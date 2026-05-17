import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BACKEND = 'http://127.0.0.1:8000'

export default function InputPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleAnalyse = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BACKEND}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      navigate('/results', { state: { result: data, query: text } })
    } catch {
      setError('Could not reach the backend. Make sure it is running on port 8000.')
      setLoading(false)
    }
  }

  return (
    <>
        <nav className="navbar">
            <span className="navbar-brand">SymptomsAI.io</span>
            <span className="navbar-sub">Not a substitute for professional medical advice</span>
        </nav>

        <div className="page">
        <div className="container">

            <div className="card">
            <p className="card-title">Describe your symptoms</p>
            <p className="card-sub">Use plain language — include duration, severity, and location if known.</p>
            <textarea
                className="symptom-input"
                placeholder="e.g. I have had a sharp stomach pain for two days, along with nausea and a mild fever..."
                value={text}
                onChange={e => setText(e.target.value)}
            />
            {error && <p className="error-box" style={{ marginTop: '12px' }}>{error}</p>}
            <button className="btn-primary" onClick={handleAnalyse} disabled={loading || !text.trim()}>
                {loading ? 'Analysing...' : 'Analyse symptoms'}
            </button>
            </div>

        </div>
        </div>
    </>
  )
}