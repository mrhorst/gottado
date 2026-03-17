import { getTaskActionMode } from '@/utils/taskInteraction'

describe('taskInteraction', () => {
  it('uses long press actions on web to keep task rows uncluttered', () => {
    expect(getTaskActionMode('web')).toBe('long_press')
  })

  it('uses swipe actions on native platforms', () => {
    expect(getTaskActionMode('ios')).toBe('swipe')
    expect(getTaskActionMode('android')).toBe('swipe')
  })
})
