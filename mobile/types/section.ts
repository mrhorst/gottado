export interface SectionResponseProps {
  active: SectionProps[]
  inactive: SectionProps[]
}

export interface SectionProps {
  name: string
  id: number
  role: 'owner' | 'editor' | 'viewer'
}
