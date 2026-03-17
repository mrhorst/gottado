export interface SectionResponseProps {
  active: SectionProps[]
  inactive: SectionProps[]
}

export interface SectionProps {
  name: string
  id: number
  role: 'owner' | 'editor' | 'viewer'
}

export interface SectionTaskSummary extends SectionProps {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  dueTodayTasks: number
  listCount: number
}

export interface TaskListSummary {
  id: number
  name: string
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}
