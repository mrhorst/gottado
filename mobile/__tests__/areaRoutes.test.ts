import { getAreaOperationsPath, getAreaSettingsPath } from '@/utils/areaRoutes'

describe('areaRoutes', () => {
  it('routes area operations through the tasks stack', () => {
    expect(getAreaOperationsPath(14)).toBe('/(tabs)/tasks/area/14')
  })

  it('routes area settings through the sections stack', () => {
    expect(getAreaSettingsPath(14)).toBe('/(tabs)/sections/14')
  })
})
