import api from './api'

export interface OrgDetail {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  members: Array<{
    userId: number
    role: string
    joinedAt: string
    name: string
    email: string
  }>
}

const createOrg = async (name: string) => {
  const { data } = await api.post('/orgs', { name })
  return data
}

const updateOrg = async (id: number, name: string) => {
  const { data } = await api.put(`/orgs/${id}`, { name })
  return data
}

const deleteOrg = async (id: number): Promise<void> => {
  await api.delete(`/orgs/${id}`)
}

const getOrg = async (id: number): Promise<OrgDetail> => {
  const { data } = await api.get(`/orgs/${id}`)
  return data
}

const addOrgMember = async (
  orgId: number,
  userId: number,
  role?: string
): Promise<void> => {
  await api.post(`/orgs/${orgId}/members`, { userId, role })
}

const updateOrgMemberRole = async (
  orgId: number,
  userId: number,
  role: string
) => {
  const { data } = await api.put(`/orgs/${orgId}/members`, { userId, role })
  return data
}

const removeOrgMember = async (
  orgId: number,
  userId: number
): Promise<void> => {
  await api.delete(`/orgs/${orgId}/members/${userId}`)
}

export {
  createOrg,
  updateOrg,
  deleteOrg,
  getOrg,
  addOrgMember,
  updateOrgMemberRole,
  removeOrgMember,
}
