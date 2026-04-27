import { useState } from 'react'
import { predictSymptoms } from './api'

export default function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await predictSymptoms(text)
      setResult(data)
    } catch (err) {
      setError('Could not reach the backend. Make sure it is running.')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (prob) => {
    if (prob >= 0.5) return 'text-green-400'
    if (prob >= 0.25) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTriageInfo = (prob) => {
    if (prob >= 0.5) return { color: 'bg-green-500', label: 'Low Urgency', advice: 'Monitor your symptoms. Consider booking a routine appointment.' }
    if (prob >= 0.25) return { color: 'bg-yellow-500', label: 'Moderate Urgency', advice: 'See a doctor soon. Your symptoms need professional evaluation.' }
    return { color: 'bg-red-500', label: 'High Urgency', advice: 'Seek medical attention promptly. Do not ignore these symptoms.' }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">SymptomsAI.io</h1>
        <p className="text-gray-400 text-sm">Describe your symptoms and get an instant triage assessment</p>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-xl bg-gray-900 rounded-2xl p-6 shadow-xl mb-6">
        <label className="block text-sm text-gray-400 mb-2">Describe your symptoms</label>
        <textarea
          className="w-full bg-gray-800 text-white rounded-xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500 h-28"
          placeholder="e.g. I have a sharp stomach pain, fever and nausea..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {loading ? 'Analysing...' : 'Analyse Symptoms'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-xl bg-red-900 text-red-300 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (() => {
        const triage = getTriageInfo(result.probability)
        return (
          <div className="w-full max-w-xl bg-gray-900 rounded-2xl p-6 shadow-xl">
            
            {/* Triage Banner */}
            <div className={`${triage.color} rounded-xl p-4 mb-6 text-center`}>
              <p className="font-bold text-lg">{triage.label}</p>
              <p className="text-sm mt-1 opacity-90">{triage.advice}</p>
            </div>

            {/* Top Prediction */}
            <div className="mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Top Prediction</p>
              <p className="text-2xl font-bold capitalize">{result.prediction}</p>
              <p className={`text-sm font-semibold mt-1 ${getConfidenceColor(result.probability)}`}>
                Confidence: {(result.probability * 100).toFixed(1)}%
              </p>
            </div>

            {/* Top 5 */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Other Possibilities</p>
              <div className="space-y-2">
                {result.top5.slice(1).map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2 text-sm">
                    <span className="capitalize">{item.disease}</span>
                    <span className="text-gray-400">{(item.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-gray-600 text-xs mt-6 text-center">
              This is not a medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </div>
        )
      })()}
    </div>
  )
}