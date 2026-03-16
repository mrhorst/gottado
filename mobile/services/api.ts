import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL

interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
}

interface RequestConfig {
  headers?: Record<string, string>
  _retry?: boolean
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  try {
    const token = await AsyncStorage.getItem('auth_token')
    const orgId = await AsyncStorage.getItem('activeOrgId')

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (orgId) {
      headers['x-org-id'] = orgId
    }
  } catch (err) {
    console.log('getAuthHeaders error:', err)
  }

  return headers
}

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}/api${endpoint}`
  const authHeaders = await getAuthHeaders()

  // Merge headers - config.headers takes precedence
  const headers: Record<string, string> = { ...authHeaders, ...config.headers }

  // Detect FormData across browser/RN/Expo runtimes.
  const isFormData =
    !!body &&
    (
      (typeof FormData !== 'undefined' && body instanceof FormData) ||
      Object.prototype.toString.call(body) === '[object FormData]' ||
      (
        typeof body === 'object' &&
        typeof (body as { append?: unknown }).append === 'function' &&
        (
          typeof (body as { getParts?: unknown }).getParts === 'function' ||
          Array.isArray((body as { _parts?: unknown })._parts)
        )
      )
    )

  // For FormData, let React Native set the Content-Type with multipart boundary
  if (isFormData) {
    delete headers['Content-Type']
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body && !isFormData) {
    options.body = JSON.stringify(body)
  } else if (body) {
    options.body = body as FormData
  }

  try {
    const response = await fetch(url, options)

    // Handle 401 Unauthorized
    if (response.status === 401 && !config._retry) {
      await AsyncStorage.removeItem('auth_token')
      throw new ApiError('token expired', 401)
    }

    // Parse response body
    let data: T
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = text as T
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const serverMsg =
        (data && typeof data === 'object' && (data as any).message) ||
        (data && typeof data === 'object' && (data as any).error) ||
        `Request failed (HTTP ${response.status})`

      if (__DEV__) {
        console.warn('HTTP error:', { status: response.status, data })
      }

      throw new ApiError(serverMsg, response.status)
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    }
  } catch (error) {
    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const msg = 'No response from server. Check your connection or the server status.'
      if (__DEV__) {
        console.warn('Network error:', error)
      }
      throw new Error(msg)
    }

    // Other errors
    throw new Error(error instanceof Error ? error.message : 'Unexpected error occurred.')
  }
}

const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>('GET', endpoint, undefined, config),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>('POST', endpoint, body, config),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>('PUT', endpoint, body, config),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>('DELETE', endpoint, undefined, config),
}

export default api
export { ApiError }
