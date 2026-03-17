import { buildSectionSummaries, buildSectionListSummaries } from '@/utils/taskHierarchy'
import { SectionProps } from '@/types/section'
import { UserTasks } from '@/services/taskService'

const sections: SectionProps[] = [
  { id: 1, name: 'Front of House', role: 'owner' },
  { id: 2, name: 'Kitchen', role: 'editor' },
]

const tasks: UserTasks[] = [
  {
    id: 10,
    title: 'Open dining room',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    complete: false,
    sectionId: 1,
    sectionName: 'Front of House',
    listId: 100,
    listName: 'Opening',
    recurrence: null,
    lastCompletedAt: null,
    deadlineTime: '09:00',
    requiresPicture: false,
    relevanceTag: null,
    priority: 'medium',
  },
  {
    id: 11,
    title: 'Sweep patio',
    description: '',
    dueDate: null,
    complete: true,
    sectionId: 1,
    sectionName: 'Front of House',
    listId: 101,
    listName: 'Closing',
    recurrence: 'daily',
    lastCompletedAt: null,
    deadlineTime: null,
    requiresPicture: false,
    relevanceTag: null,
    priority: 'low',
  },
]

describe('taskHierarchy', () => {
  it('builds section summaries with pending and completed counts', () => {
    const summaries = buildSectionSummaries(sections, tasks)

    expect(summaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          totalTasks: 2,
          completedTasks: 1,
          pendingTasks: 1,
          listCount: 2,
        }),
      ])
    )
  })

  it('builds list summaries for a section', () => {
    const summaries = buildSectionListSummaries(1, tasks)

    expect(summaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 100,
          name: 'Opening',
          totalTasks: 1,
          completedTasks: 0,
        }),
        expect.objectContaining({
          id: 101,
          name: 'Closing',
          totalTasks: 1,
          completedTasks: 1,
        }),
      ])
    )
  })
})
