import api from './api'

const createSection = async (name: string, userId: number) => {
  const { data } = await api.post('/sections', { name, userId })
  return data
}

const getSections = async () => {
  const { data } = await api.get('/sections')
  return data
}

const getSectionMembers = async (id: number) => {
  const { data } = await api.get(`/sections/${id}`)
  return data
}

export { createSection, getSections, getSectionMembers }
