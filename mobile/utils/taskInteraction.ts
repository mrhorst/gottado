export const getTaskActionMode = (platformOS: string): 'swipe' | 'none' => {
  return platformOS === 'web' ? 'none' : 'swipe'
}
