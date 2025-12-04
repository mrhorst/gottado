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

// role as enum for safety?
const addMember = async (userId: number, sectionId: number, role: string) => {
  return await api.post(`/sections/${sectionId}/members`, {
    userId,
    sectionId,
    role,
  })
}

const updateMemberRole = async (
  userId: number,
  sectionId: number,
  role: string
) => {
  return await api.put(`/sections/${sectionId}/members`, {
    userId,
    sectionId,
    role,
  })
}

export {
  createSection,
  getSections,
  getSectionMembers,
  addMember,
  updateMemberRole,
}
