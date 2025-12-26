export type UserProfile = {
  name: string
  email: string
  id: number
  organizations: UserOrgs[]
}

export interface UserOrgs {
  id: number
  name: string
  role: OrgMembershipRole
}

export type OrgMembershipRole = 'owner' | 'editor' | 'viewer'
