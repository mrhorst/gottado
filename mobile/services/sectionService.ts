import { MembershipRoles } from '../hooks/useMembershipQuery'
import { TaskListSummary } from '@/types/section'
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

const getSectionTaskLists = async (id: number): Promise<TaskListSummary[]> => {
  const { data } = await api.get<TaskListSummary[]>(`/sections/${id}/task-lists`)
  return data
}

const createSectionTaskList = async (
  sectionId: number,
  payload: { name: string; description?: string }
): Promise<TaskListSummary> => {
  const { data } = await api.post<TaskListSummary>(
    `/sections/${sectionId}/task-lists`,
    payload
  )
  return data
}

const addMember = async (
  userId: number,
  sectionId: number,
  role: MembershipRoles
) => {
  return await api.post(`/sections/${sectionId}/members`, {
    userId,
    sectionId,
    role,
  })
}

const updateMemberRole = async (
  userId: number,
  sectionId: number,
  role: MembershipRoles
) => {
  return await api.put(`/sections/${sectionId}/members`, {
    userId,
    sectionId,
    role,
  })
}

const removeMember = async (userId: number, sectionId: number) => {
  return await api.delete(`/sections/${sectionId}/members/${userId}`)
}

const renameSection = async (sectionId: number, name: string) => {
  return await api.put(`/sections/${sectionId}`, { name })
}

const archiveSection = async (sectionId: number) => {
  return await api.put(`/sections/${sectionId}`, { active: false })
}

const unarchiveSection = async (sectionId: number) => {
  return await api.put(`/sections/${sectionId}`, { active: true })
}

const deleteSection = async (sectionId: number) => {
  return await api.delete(`/sections/${sectionId}`)
}

export {
  createSection,
  getSections,
  getSectionMembers,
  getSectionTaskLists,
  createSectionTaskList,
  addMember,
  updateMemberRole,
  removeMember,
  renameSection,
  archiveSection,
  unarchiveSection,
  deleteSection,
}
