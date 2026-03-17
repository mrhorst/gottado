import {
  getAvailableListsForSection,
  getInitialListId,
} from '@/utils/taskListSelection'
import { TaskListSummary } from '@/types/section'
import { UserTasks } from '@/services/taskService'

const lists: TaskListSummary[] = [
  { id: 10, sectionId: 1, name: 'Opening', totalTasks: 0, completedTasks: 0, pendingTasks: 0 },
  { id: 11, sectionId: 1, name: 'Closing', totalTasks: 0, completedTasks: 0, pendingTasks: 0 },
  { id: 20, sectionId: 2, name: 'Weekly', totalTasks: 0, completedTasks: 0, pendingTasks: 0 },
]

const task: UserTasks = {
  id: 101,
  title: 'Lock doors',
  description: '',
  dueDate: null,
  complete: false,
  sectionId: 1,
  sectionName: 'Front of House',
  listId: 11,
  listName: 'Closing',
  recurrence: null,
  lastCompletedAt: null,
  deadlineTime: null,
  requiresPicture: false,
  relevanceTag: null,
  priority: 'medium',
}

describe('taskListSelection', () => {
  it('filters list options by section', () => {
    expect(getAvailableListsForSection(lists, 1).map((list) => list.id)).toEqual([10, 11])
  })

  it('defaults to the first list for a selected section', () => {
    expect(getInitialListId({ sectionId: 1, lists })).toBe(10)
  })

  it('uses the current task list when editing', () => {
    expect(getInitialListId({ sectionId: 1, lists, task })).toBe(11)
  })

  it('falls back when the current task list is not in the selected section', () => {
    expect(
      getInitialListId({
        sectionId: 2,
        lists,
        task,
      })
    ).toBe(20)
  })
})
