import { useSectionQuery } from '@/app/hooks/useSections'
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

interface Section {
  name: string
  id: number
  role: 'owner' | 'editor' | 'viewer'
}

interface SectionContextValue {
  sections: []
  activeSection: Section | null
  setActiveSection: (section: Section | null) => void
  isLoading: boolean
}

const SectionContext = createContext<SectionContextValue | undefined>(undefined)

export default function SectionProvider({ children }: { children: ReactNode }) {
  const { sections, isLoading } = useSectionQuery()
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null)

  const activeSection = useMemo(() => {
    if (!sections || activeSectionId === null) return null
    return sections.find((s: Section) => s.id === activeSectionId) ?? null
  }, [sections, activeSectionId])

  const setActiveSection = (section: Section | null) => {
    setActiveSectionId(section?.id ?? null)
  }

  const value: SectionContextValue = {
    sections,
    activeSection,
    setActiveSection,
    isLoading,
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
