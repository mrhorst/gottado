import {
  findOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganization,
  addMember,
  updateMemberRole,
  removeMember,
} from '@/controllers/organization.ts'
import { validate } from '@/middleware/validate.ts'
import {
  createOrgSchema,
  updateOrgSchema,
  addOrgMemberSchema,
  updateOrgMemberSchema,
} from '@/validation/schemas.ts'
import { Router } from 'express'

const router = Router()

router.get('/', findOrganization)
router.get('/:id', getOrganization)
router.post('/', validate(createOrgSchema), createOrganization)
router.put('/:id', validate(updateOrgSchema), updateOrganization)
router.delete('/:id', deleteOrganization)

router.post('/:id/members', validate(addOrgMemberSchema), addMember)
router.put('/:id/members', validate(updateOrgMemberSchema), updateMemberRole)
router.delete('/:id/members/:userId', removeMember)

export default router
