import { Request, Response } from 'express'
import { section, sectionMember } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { AuthenticatedRequest } from './tasks.ts'
import { eq } from 'drizzle-orm'

const listSections = async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user!.sub)
  const sections = await db
    .select()
    .from(section)
    .where(eq(section.ownerId, userId))
  res.status(200).send(sections)
}
const createSection = async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body
  const ownerId = Number(req.user!.sub)
  const newSection = { name, ownerId }

  const [addedSection, addedSectionMember] = await db.transaction(
    async (tx) => {
      const [addedSection] = await tx
        .insert(section)
        .values(newSection)
        .returning()

      const [addedSectionMember] = await tx
        .insert(sectionMember)
        .values({ userId: ownerId, sectionId: addedSection.id, role: 'owner' })
        .returning()

      return [addedSection, addedSectionMember] as const
    }
  )

  res.status(201).send({ addedSection, addedSectionMember })
}
const updateSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}
const deleteSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}

export { listSections, createSection, updateSection, deleteSection }
