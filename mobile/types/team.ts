export interface TeamSummary {
  id: number
  name: string
  description?: string | null
  active: boolean
  memberCount: number
}

export interface TeamMember {
  userId: number
  name: string
  email: string
  role: 'lead' | 'member'
  joinedAt?: string
}

export interface TeamNonMember {
  id: number
  name: string
  email: string
}

export interface TeamDetailResponse {
  team: TeamSummary
  members: TeamMember[]
  nonMembers: TeamNonMember[]
}
