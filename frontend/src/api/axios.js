import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Hardcoded mock data for demo mode
const mockData = {
  '/api/wallet/me': { balance: 100000.0, walletTag: '@bemd18_mock', currency: 'ORB' },
  '/api/notifications/unread-count': { count: 3 },
  '/api/notifications': {
    content: [
      { id: '1', title: 'Money Received', message: 'You received 500 ORB from @john_doe', isRead: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'Money Received', message: 'You received 120 ORB from @alice', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]
  },
  '/api/transactions': {
    content: [
      { id: '1', direction: 'SENT', receiverWalletTag: '@elon_musk', amount: 50.0, createdAt: new Date().toISOString(), referenceId: 'REF-1' },
      { id: '2', direction: 'RECEIVED', senderWalletTag: '@john_doe', amount: 500.0, createdAt: new Date(Date.now() - 86400000).toISOString(), referenceId: 'REF-2' },
      { id: '3', direction: 'RECEIVED', senderWalletTag: '@alice', amount: 120.0, createdAt: new Date(Date.now() - 172800000).toISOString(), referenceId: 'REF-3' },
    ],
    totalPages: 1
  },
  '/api/wallet/qr': { qrCode: '' } // Handled separately or mocked empty
}

// Request Interceptor
api.interceptors.request.use(async (config) => {
  const { token, isDemo } = useAuthStore.getState()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Intercept and return mock data if in demo mode
  if (isDemo && config.url) {
    // Artificial delay for realism
    await new Promise(r => setTimeout(r, 600))

    if (config.url === '/api/transactions/send') {
      return Promise.reject({ config, isMock: true, data: { data: { id: '99', direction: 'SENT', amount: JSON.parse(config.data).amount, receiverWalletTag: JSON.parse(config.data).receiverWalletTag } } })
    }
    
    // Find matching mock data
    const matchKey = Object.keys(mockData).find(key => config.url.includes(key))
    if (matchKey) {
      return Promise.reject({ config, isMock: true, data: { data: mockData[matchKey] } })
    }
  }

  return config
})

// Response Interceptor (to catch mock rejections and return them as successful responses)
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If it's a mocked response, resolve it as successful data
    if (error.isMock) {
      return Promise.resolve({ data: { success: true, data: error.data.data } })
    }

    const originalRequest = error.config
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) throw new Error('No refresh token')

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`,
        { refreshToken }
      )

      const newToken = res.data.data.accessToken
      useAuthStore.getState().setToken(newToken)

      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
