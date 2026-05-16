import { Routes, Route } from 'react-router-dom'
import InputPage from './components/InputPage'
import ResultsPage from './components/ResultsPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  )
}

export default App