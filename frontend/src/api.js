import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const predictSymptoms = async (text) => {
  const response = await axios.post(`${API_URL}/predict`, { text })
  return response.data
}