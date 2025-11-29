import { Request, Response } from 'express'
import { section, sectionMember } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { AuthenticatedRequest } from './tasks.ts'

const listSections = async (_req: Request, res: Response) => {
  const sections = await db.select().from(section)
  res.status(501).send(sections)
}
const createSection = async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body
  const ownerId = Number(req.user?.sub)
  const newSection = { name, ownerId }

  const [addedSection, ..._rest] = await db
    .insert(section)
    .values(newSection)
    .returning()

  const [addedSectionMember, ...rest] = await db
    .insert(sectionMember)
    .values({ userId: ownerId, sectionId: addedSection.id })
    .returning()

  res.status(501).send({ addedSection, addedSectionMember })
}
const updateSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}
const deleteSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}

export { listSections, createSection, updateSection, deleteSection }
