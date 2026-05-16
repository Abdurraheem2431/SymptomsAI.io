import { useLocation, useNavigate } from 'react-router-dom'

function triage(prob) {
  if (prob >= 0.45) return { color: 'green', label: 'Low urgency', advice: 'Monitor your symptoms. Consider a routine appointment if they persist.' }
  if (prob >= 0.22) return { color: 'yellow', label: 'Moderate urgency', advice: 'See a doctor within the next day or two for a professional evaluation.' }
  return { color: 'red', label: 'High urgency', advice: 'Seek medical attention promptly. Do not ignore these symptoms.' }
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

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // If someone navigates directly to /results with no data, send them back
  if (!state?.result) {
    navigate('/')
    return null
  }

  const { result, query } = state
  const t = triage(result.probability)

  return (
    <div className="page">
      <div className="container">

        <div className="header">
          <p className="header-eyebrow">SymptomsAI.io</p>
          <h1 className="header-title">Your results</h1>
          <p className="header-sub">"{query}"</p>
        </div>

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

        <button className="btn-secondary" onClick={() => navigate('/')}>
          Check another symptom
        </button>

      </div>
    </div>
  )
}