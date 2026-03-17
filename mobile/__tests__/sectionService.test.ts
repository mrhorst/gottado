import api from '@/services/api'
import { createSectionTaskList } from '@/services/sectionService'

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

describe('sectionService', () => {
  it('creates a task list for a section', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({
      data: {
        id: 12,
        sectionId: 4,
        name: 'Opening',
        description: 'Start-of-day checklist',
        sortOrder: 1,
      },
    })

    const result = await createSectionTaskList(4, {
      name: 'Opening',
      description: 'Start-of-day checklist',
    })

    expect(api.post).toHaveBeenCalledWith('/sections/4/task-lists', {
      name: 'Opening',
      description: 'Start-of-day checklist',
    })
    expect(result).toEqual({
      id: 12,
      sectionId: 4,
      name: 'Opening',
      description: 'Start-of-day checklist',
      sortOrder: 1,
    })
  })
})
