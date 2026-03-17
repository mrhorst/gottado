import { getTaskActionMode } from '@/utils/taskInteraction'

describe('taskInteraction', () => {
  it('disables row actions on web to avoid text-selection and copy overlays', () => {
    expect(getTaskActionMode('web')).toBe('none')
  })

  it('uses swipe actions on native platforms', () => {
    expect(getTaskActionMode('ios')).toBe('swipe')
    expect(getTaskActionMode('android')).toBe('swipe')
  })
})
