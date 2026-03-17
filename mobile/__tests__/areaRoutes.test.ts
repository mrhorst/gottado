import {
  getAreaChecklistPath,
  getAreaOperationsPath,
  getAreaSettingsPath,
} from '@/utils/areaRoutes'

describe('areaRoutes', () => {
  it('routes area operations through the tasks stack', () => {
    expect(getAreaOperationsPath(14)).toBe('/(tabs)/tasks/area/14')
  })

  it('routes area settings through the areas stack', () => {
    expect(getAreaSettingsPath(14)).toBe('/(tabs)/areas/14')
  })

  it('routes a checklist through its parent area path', () => {
    expect(getAreaChecklistPath(14, 9)).toBe('/(tabs)/tasks/area/14/list/9')
  })
})
