import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'

export type Recurrence =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'yearly'

export interface UserTasks {
  description: string
  dueDate: string
  id: number
  title: string
  complete: boolean
  sectionName: string
  recurrence: Recurrence | null
  lastCompletedAt: string | null
  deadlineTime: string | null
  requiresPicture: boolean
  relevanceTag: string | null
}

export interface TaskCompletion {
  id: number
  taskId: number
  completedAt: string
  dueDate: string | null
  deadlineTime: string | null
  onTime: boolean | null
}

export interface DailySnapshot {
  date: string
  completions: Array<
    TaskCompletion & {
      taskTitle: string
      sectionName: string
      recurrence: Recurrence | null
    }
  >
  summary: {
    total: number
    onTime: number
    late: number
    noDeadline: number
  }
}

const getTasks = async (): Promise<UserTasks[]> => {
  const { data } = await api.get('/tasks')
  return data
}

const setTaskCompleted = async (id: number, complete: boolean) => {
  const { data } = await api.put(`/tasks/${id}`, { complete })
  return data
}

interface CreateTaskPayload {
  title: string
  description?: string
  sectionId: number
  userId: number
  dueDate?: string
  deadlineTime?: string
  recurrence?: Recurrence
  requiresPicture?: boolean
}

const createNewTask = async (payload: CreateTaskPayload) => {
  const { data } = await api.post('/tasks', payload)
  return data
}

const getTaskHistory = async (taskId: number): Promise<TaskCompletion[]> => {
  const { data } = await api.get(`/tasks/${taskId}/history`)
  return data
}

const getDailySnapshot = async (date?: string): Promise<DailySnapshot> => {
  const params = date ? `?date=${date}` : ''
  const { data } = await api.get(`/tasks/snapshot${params}`)
  return data
}

export interface CompletionsByUserResponse {
  days: number
  users: Array<{
    userId: number
    userName: string
    count: number
  }>
}

const getCompletionsByUser = async (days = 7): Promise<CompletionsByUserResponse> => {
  const { data } = await api.get(`/tasks/completions-by-user?days=${days}`)
  return data
}

interface UpdateTaskPayload {
  title?: string
  description?: string
  dueDate?: string | null
  deadlineTime?: string | null
  recurrence?: Recurrence | null
  requiresPicture?: boolean
}

const updateTask = async (id: number, payload: UpdateTaskPayload) => {
  const { data } = await api.put(`/tasks/${id}`, payload)
  return data
}

const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`)
}

export interface TaskActivity {
  id: number
  taskId: number
  userId: number
  userName: string
  action: 'created' | 'completed' | 'uncompleted' | 'edited' | 'deleted'
  details: string | null
  createdAt: string
}

const getTaskActivities = async (taskId: number): Promise<TaskActivity[]> => {
  const { data } = await api.get(`/tasks/${taskId}/activities`)
  return data
}

const completeTaskWithPicture = async (id: number, pictureUrl: string) => {
  const { data } = await api.put(`/tasks/${id}`, { complete: true, pictureUrl })
  return data
}

const uploadImage = async (uri: string): Promise<string> => {
  const formData = new FormData()
  const filename = uri.split('/').pop() || 'photo.jpg'
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'

  formData.append('image', {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob)

  // Use fetch directly — axios mangles FormData in React Native
  const token = await AsyncStorage.getItem('auth_token')
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/uploads`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Upload failed (HTTP ${res.status})`)
  }

  const data = await res.json()
  return data.url
}

export { getTasks, setTaskCompleted, createNewTask, getTaskHistory, getDailySnapshot, getCompletionsByUser, updateTask, deleteTask, getTaskActivities, completeTaskWithPicture, uploadImage }
export type { UpdateTaskPayload }
