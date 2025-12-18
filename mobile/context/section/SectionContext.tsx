import { useSectionMutation } from '@/hooks/useSectionMutation'
import { useSectionQuery } from '@/hooks/useSectionQuery'
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

export interface SectionResponseProps {
  active: SectionProps[]
  inactive: SectionProps[]
}

export interface SectionProps {
  name: string
  id: number
  role: 'owner' | 'editor' | 'viewer'
}

interface SectionContextValue {
  sections: SectionProps[] | undefined
  archivedSections: SectionProps[] | undefined
  activeSection: SectionProps | null
  setActiveSection: (section: SectionProps | null) => void
  isLoading: boolean
  addSection: (name: string, options?: any) => void
}

const SectionContext = createContext<SectionContextValue | undefined>(undefined)

export default function SectionProvider({ children }: { children: ReactNode }) {
  const { sections, archivedSections, isLoading } = useSectionQuery()
  const { addSection } = useSectionMutation()
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null)

  const activeSection = useMemo(() => {
    if (!sections || activeSectionId === null) return null
    return sections.find((s: SectionProps) => s.id === activeSectionId) ?? null
  }, [sections, activeSectionId])

  const setActiveSection = (section: SectionProps | null) => {
    setActiveSectionId(section?.id ?? null)
  }

  const value: SectionContextValue = {
    sections,
    archivedSections,
    activeSection,
    setActiveSection,
    isLoading,
    addSection,
  }

  return (
    <SectionContext.Provider value={value}>{children}</SectionContext.Provider>
  )
}

export function useSections() {
  const context = useContext(SectionContext)
  if (!context) {
    throw new Error('useSections must be used within a SectionProvider')
  }

  return context
}
