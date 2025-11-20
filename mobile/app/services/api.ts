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
    return Promise.reject(error.response.data)
  }
)

export default api
