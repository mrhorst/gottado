import AsyncStorage from '@react-native-async-storage/async-storage'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const api: AxiosInstance = axios.create({
  baseURL: API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

interface CustomAxiosConfig extends AxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      console.log('api interceptor request:', err)
    }
    return config
  },
  (err) => Promise.reject(err)
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosConfig

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      await AsyncStorage.removeItem('auth_token')

      return Promise.reject(new Error('token expired'))
    }
    if (error.response) {
      const { status, data } = error.response
      const serverMsg =
        (data && typeof data === 'object' && (data as any).message) ||
        (data && typeof data === 'object' && (data as any).error) ||
        (typeof data === 'string' ? data : null)

      if (__DEV__) {
        console.warn('HTTP error:', { status, data })
      }

      return Promise.reject(
        new Error(
          serverMsg
            ? `${serverMsg} (HTTP ${status})`
            : `Request failed (HTTP ${status})`
        )
      )
    }

    // No response (network/timeout)
    if (error.request) {
      const isTimeout = (error as any).code === 'ECONNABORTED'
      const msg = isTimeout
        ? 'Request timed out. Please check your connection and try again.'
        : 'No response from server. Check your connection or the server status.'
      if (__DEV__) {
        console.warn('Network error:', {
          code: (error as any).code,
          message: error.message,
        })
      }
      return Promise.reject(new Error(msg))
    }

    // Setup error
    return Promise.reject(
      new Error(error.message || 'Unexpected error occurred.')
    )
  }
)

export default api
