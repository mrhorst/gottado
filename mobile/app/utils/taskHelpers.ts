import { UserTasks } from '../services/taskService'

export const sortTasks = (tasks: UserTasks[]): UserTasks[] => {
  return [...tasks].sort((a, b) => {
    return a.complete === b.complete ? 0 : a.complete ? 1 : -1
  })
}
