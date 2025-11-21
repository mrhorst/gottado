import api from './api'

export interface UserTasks {
  description: string
  dueDate: string
  id?: number
  title: string
  complete: boolean
}

const fetchLoggedUser = async () => {
  const { data } = await api.get('/users/me')
  return data
}

const getTasks = async (): Promise<UserTasks[]> => {
  const { data } = await api.get('/tasks')
  return data
}

const setTaskCompleted = async (task: UserTasks) => {
  const { id, ...taskNoId } = task
  const completedTask = { ...taskNoId, complete: !task.complete }
  const { data } = await api.put(`/tasks/${task.id}`, completedTask)
  return data
}

export { fetchLoggedUser, getTasks, setTaskCompleted }
