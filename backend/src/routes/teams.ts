import { Router } from 'express'
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getTeam,
  listTeams,
  removeTeamMember,
  updateTeam,
  updateTeamMemberRole,
} from '@/controllers/teams.ts'
import { validate } from '@/middleware/validate.ts'
import {
  addTeamMemberSchema,
  createTeamSchema,
  updateTeamMemberSchema,
  updateTeamSchema,
} from '@/validation/schemas.ts'

const router = Router()

router.get('/', listTeams)
router.post('/', validate(createTeamSchema), createTeam)
router.get('/:id', getTeam)
router.put('/:id', validate(updateTeamSchema), updateTeam)
router.delete('/:id', deleteTeam)

router.post('/:id/members', validate(addTeamMemberSchema), addTeamMember)
router.put('/:id/members', validate(updateTeamMemberSchema), updateTeamMemberRole)
router.delete('/:id/members/:userId', removeTeamMember)

export default router
