import api from './api'

const createSection = async (name: string, userId: number) => {
  const { data } = await api.post('/sections', { name, userId })
  return data
}

export { createSection }
