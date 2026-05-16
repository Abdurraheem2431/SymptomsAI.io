import { useState } from 'react'
import './css/App.css'

const BACKEND = 'http://127.0.0.1:8000'

const LOADER_MSGS = [
  'Extracting symptoms...',
  'Mapping to disease features...',
  'Running prediction model...',
  'Preparing your results...',
]

function triage(prob) {
  if (prob >= 0.45) return { color: 'green', label: 'Low urgency', advice: 'Monitor your symptoms. Consider a routine appointment if they persist.' }
  if (prob >= 0.22) return { color: 'yellow', label: 'Moderate urgency', advice: 'See a doctor within the next day or two for a professional evaluation.' }
  return { color: 'red', label: 'High urgency', advice: 'Seek medical attention promptly. Do not ignore these symptoms.' }
}

function StepCircle({ n, current }) {
  const done = current > n
  const active = current === n
  const cls = done ? 'step-circle done' : active ? 'step-circle active' : 'step-circle'
  return <div className={cls}>{done ? '✓' : n}</div>
}

function StepBar({ step }) {
  const labels = ['Describe', 'Analyse', 'Results']
  return (
    <div className="step-bar">
      {[1, 2, 3].map((n, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div className="step-item">
            <StepCircle n={n} current={step} />
            <span className="step-label">{labels[i]}</span>
          </div>
          {i < 2 && <div className={`step-line${step > n ? ' done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

function BarChart({ top5 }) {
  const max = top5[0].probability
  return (
    <div>
      {top5.map((item, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-meta">
            <span>{item.disease}</span>
            <span>{(item.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${max > 0 ? (item.probability / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loaderMsg, setLoaderMsg] = useState(LOADER_MSGS[0])
  const [error, setError] = useState(null)

  const handleAnalyse = async () => {
    if (!text.trim()) return
    setStep(2)
    setError(null)
    let idx = 0
    const timer = setInterval(() => {
      idx = (idx + 1) % LOADER_MSGS.length
      setLoaderMsg(LOADER_MSGS[idx])
    }, 1200)
    try {
      const res = await fetch(`${BACKEND}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      clearInterval(timer)
      setResult(data)
      setStep(3)
    } catch {
      clearInterval(timer)
      setError('Could not reach the backend. Make sure it is running on port 8000.')
      setStep(3)
    }
  }

  const reset = () => { setText(''); setResult(null); setError(null); setStep(1) }

  const t = result ? triage(result.probability) : null

  return (
    <div className="page">
      <div className="container">

        <div className="header">
          <p className="header-eyebrow">SymptomsAI.io</p>
          <h1 className="header-title">Symptom triage assistant</h1>
          <p className="header-sub">Not a substitute for professional medical advice</p>
        </div>

        <StepBar step={step} />

        {/* Step 1 — Input */}
        {step === 1 && (
          <div className="card">
            <p className="card-title">Describe your symptoms</p>
            <p className="card-sub">Use plain language — include duration, severity, and location if known.</p>
            <textarea
              className="symptom-input"
              placeholder="e.g. I have had a sharp stomach pain for two days, along with nausea and a mild fever..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button className="btn-primary" onClick={handleAnalyse} disabled={!text.trim()}>
              Analyse symptoms
            </button>
            <p className="privacy-note">Your input is not stored or shared.</p>
          </div>
        )}

        {/* Step 2 — Loading */}
        {step === 2 && (
          <div className="card">
            <div className="loader">
              <div className="spinner" />
              <p className="loader-msg">{loaderMsg}</p>
            </div>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 3 && (
          <>
            {error ? (
              <div className="error-box">{error}</div>
            ) : result && (
              <div className="card">
                <div className={`triage-banner triage-${t.color}`}>
                  <div className="triage-dot" />
                  <div>
                    <p className="triage-label">{t.label}</p>
                    <p className="triage-advice">{t.advice}</p>
                  </div>
                </div>

                <div className="prediction-section">
                  <p className="section-label">Top prediction</p>
                  <p className="disease-name">{result.prediction}</p>
                  <p className="disease-confidence">Confidence: {(result.probability * 100).toFixed(1)}%</p>
                </div>

                <p className="section-label">Likelihood breakdown</p>
                <BarChart top5={result.top5} />

                <p className="disclaimer">
                  This tool uses a machine learning model and is for informational purposes only.
                  Always consult a qualified healthcare professional for diagnosis and treatment.
                </p>
              </div>
            )}
            <button className="btn-secondary" onClick={reset}>Start over</button>
          </>
        )}

      </div>
    </div>
  )
}