import { getSectionDetailPath } from '@/utils/sectionDetailRoute'

describe('sectionDetailRoute', () => {
  it('routes section detail through the sections stack', () => {
    expect(getSectionDetailPath(14)).toBe('/(tabs)/sections/14')
  })
})
