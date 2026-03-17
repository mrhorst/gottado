import { UserTasks } from '@/services/taskService'
import { TaskListSummary } from '@/types/section'

export const getAvailableListsForSection = (
  lists: TaskListSummary[],
  sectionId: number | null
): TaskListSummary[] => {
  if (!sectionId) return []
  return lists.filter((list) => list.sectionId === sectionId)
}

export const getInitialListId = ({
  sectionId,
  lists,
  task,
}: {
  sectionId: number | null
  lists: TaskListSummary[]
  task?: UserTasks
}): number | null => {
  const availableLists = getAvailableListsForSection(lists, sectionId)
  if (availableLists.length === 0) return null

  if (task && availableLists.some((list) => list.id === task.listId)) {
    return task.listId
  }

  return availableLists[0]?.id ?? null
}
