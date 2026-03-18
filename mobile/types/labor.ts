export interface LaborShift {
  id: number
  title: string
  shiftDate: string
  startTime: string
  endTime: string
  areaId?: number | null
  areaName?: string | null
  assignedTeamId?: number | null
  assignedTeamName?: string | null
  assignedUserId?: number | null
  assignedUserName?: string | null
  notes?: string | null
  createdAt?: string
}

export interface LaborReferenceArea {
  id: number
  name: string
  teamId?: number | null
  teamName?: string | null
}

export interface LaborReferenceTeam {
  id: number
  name: string
  description?: string | null
}

export interface LaborReferenceMember {
  id: number
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
}

export interface LaborReferencesResponse {
  areas: LaborReferenceArea[]
  teams: LaborReferenceTeam[]
  members: LaborReferenceMember[]
}

export interface CreateLaborShiftPayload {
  title: string
  shiftDate: string
  startTime: string
  endTime: string
  areaId?: number | null
  assignedTeamId?: number | null
  assignedUserId?: number | null
  notes?: string
}
