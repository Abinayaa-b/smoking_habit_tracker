import axios from 'axios'
import { useAuthStore } from '../store/useStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// --- Auth ---
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  requestReset: (email) => api.post('/auth/request-reset', { email }),
  confirmReset: (data) => api.post('/auth/confirm-reset', data),
}

// --- Logs ---
export const logsAPI = {
  submitDaily: (data) => api.post('/logs/daily', data),
  getHistory: (days = 30) => api.get(`/logs/history?days=${days}`),
  getStreak: () => api.get('/logs/streak'),
}

// --- Prediction ---
export const predictionAPI = {
  getCurrent: () => api.get('/prediction/current'),
  calculate: (data) => api.post('/prediction/calculate', data),
}

// --- AI ---
export const aiAPI = {
  getOrganVoice: (data) => api.post('/ai/organ-voice', data),
  getUrgeSupport: (data) => api.post('/ai/urge-support', data),
}

export default api
