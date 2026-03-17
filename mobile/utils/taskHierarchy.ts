import { UserTasks } from '@/services/taskService'
import { SectionProps, SectionTaskSummary, TaskListSummary } from '@/types/section'

const todayIso = () => new Date().toISOString().split('T')[0]

export const buildSectionSummaries = (
  sections: SectionProps[] = [],
  tasks: UserTasks[] = []
): SectionTaskSummary[] => {
  const today = todayIso()

  return sections.map((section) => {
    const sectionTasks = tasks.filter((task) => task.sectionId === section.id)
    const completedTasks = sectionTasks.filter((task) => task.complete).length
    const pendingTasks = sectionTasks.length - completedTasks
    const overdueTasks = sectionTasks.filter(
      (task) => !task.complete && !!task.dueDate && task.dueDate < today
    ).length
    const dueTodayTasks = sectionTasks.filter(
      (task) => !task.complete && task.dueDate === today
    ).length
    const listCount = new Set(sectionTasks.map((task) => task.listId)).size

    return {
      ...section,
      totalTasks: sectionTasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      dueTodayTasks,
      listCount,
    }
  })
}

export const buildSectionListSummaries = (
  sectionId: number,
  tasks: UserTasks[] = []
): TaskListSummary[] => {
  const sectionTasks = tasks.filter((task) => task.sectionId === sectionId)
  const grouped = new Map<number, TaskListSummary>()

  for (const task of sectionTasks) {
    const existing = grouped.get(task.listId)
    if (existing) {
      existing.totalTasks += 1
      existing.completedTasks += task.complete ? 1 : 0
      existing.pendingTasks += task.complete ? 0 : 1
      continue
    }

    grouped.set(task.listId, {
      id: task.listId,
      name: task.listName,
      totalTasks: 1,
      completedTasks: task.complete ? 1 : 0,
      pendingTasks: task.complete ? 0 : 1,
    })
  }

  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name))
}
