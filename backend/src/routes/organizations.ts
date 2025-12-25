import { findOrganization } from '@/controllers/organization.ts'
import { Router } from 'express'
// import  from '../controllers/orgs.ts'

const router = Router()

router.get('/', findOrganization)
// router.get('/:id')
// router.post('/')
// router.put('/:id')
// router.delete('/:id')

// router.post('/:id/members')
// router.put('/:id/members')

// router.delete('/:id/members/:userId')

export default router
