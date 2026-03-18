import api from './api'
import type { TeamDetailResponse, TeamSummary } from '@/types/team'

export const getTeams = async (): Promise<TeamSummary[]> => {
  const { data } = await api.get<TeamSummary[]>('/teams')
  return data
}

export const createTeam = async (payload: {
  name: string
  description?: string
}): Promise<TeamSummary> => {
  const { data } = await api.post<TeamSummary>('/teams', payload)
  return data
}

export const getTeam = async (teamId: number): Promise<TeamDetailResponse> => {
  const { data } = await api.get<TeamDetailResponse>(`/teams/${teamId}`)
  return data
}
