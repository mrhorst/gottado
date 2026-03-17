import * as ImageManipulator from 'expo-image-manipulator'
import { Platform } from 'react-native'
import api from './api'

export type Recurrence =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'yearly'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface UserTasks {
  description: string
  dueDate: string | null
  id: number
  title: string
  complete: boolean
  sectionId: number
  sectionName: string
  listId: number
  listName: string
  recurrence: Recurrence | null
  lastCompletedAt: string | null
  deadlineTime: string | null
  requiresPicture: boolean
  relevanceTag: string | null
  priority?: TaskPriority | null
}

export interface TaskCompletion {
  id: number
  taskId: number
  completedAt: string
  dueDate: string | null
  deadlineTime: string | null
  onTime: boolean | null
  pictureUrl?: string | null
}

export interface DailySnapshot {
  date: string
  completions: (
    TaskCompletion & {
      taskTitle: string
      sectionName: string
      recurrence: Recurrence | null
    }
  )[]
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
  listId?: number
  userId: number
  dueDate?: string
  deadlineTime?: string
  recurrence?: Recurrence
  requiresPicture?: boolean
  priority?: TaskPriority
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
  users: {
    userId: number
    userName: string
    count: number
  }[]
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
  priority?: TaskPriority
  listId?: number | null
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
  // Resize and compress the image before uploading
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  )

  let fileUri = manipulated.uri
  if (
    Platform.OS !== 'web' &&
    !fileUri.startsWith('file://') &&
    !fileUri.startsWith('content://')
  ) {
    fileUri = `file://${fileUri}`
  }
  const filename = fileUri.split('/').pop() || 'photo.jpg'

  const formData = new FormData()
  if (Platform.OS === 'web') {
    const imageResponse = await fetch(fileUri)
    const blob = await imageResponse.blob()
    formData.append('image', blob, filename)
  } else {
    formData.append('image', {
      uri: fileUri,
      name: filename,
      type: 'image/jpeg',
    } as unknown as Blob)
  }

  const { data } = await api.post<{ url: string }>('/uploads', formData)
  return data.url
}

export { getTasks, setTaskCompleted, createNewTask, getTaskHistory, getDailySnapshot, getCompletionsByUser, updateTask, deleteTask, getTaskActivities, completeTaskWithPicture, uploadImage }
export type { UpdateTaskPayload }
