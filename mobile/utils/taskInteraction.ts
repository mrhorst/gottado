export const getTaskActionMode = (platformOS: string): 'swipe' | 'long_press' => {
  return platformOS === 'web' ? 'long_press' : 'swipe'
}
