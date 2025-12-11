import api from './api'

export interface UserTasks {
  description: string
  dueDate: string
  id: number
  title: string
  complete: boolean
  sectionName: string
}

const getTasks = async (): Promise<UserTasks[]> => {
  const { data } = await api.get('/tasks')
  return data
}

const setTaskCompleted = async (id: number, complete: boolean) => {
  const { data } = await api.put(`/tasks/${id}`, { complete })
  return data
}

const createNewTask = async (
  title: string,
  description: string,
  sectionId: number,
  userId: number
) => {
  const newTask = { title, description, sectionId, userId }
  const { data } = await api.post('/tasks', newTask)
  return data
}

export { getTasks, setTaskCompleted, createNewTask }
