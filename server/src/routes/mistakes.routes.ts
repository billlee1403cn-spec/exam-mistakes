import { Router } from 'express'
import {
  getMistakes,
  getMistake,
  createMistake,
  updateMistake,
  deleteMistake,
  toggleMastered,
  updateReview,
} from '../controllers/mistakes.controller.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from './utils.js'

const router = Router()

router.use(authMiddleware)

router.get('/', asyncHandler(getMistakes))
router.post('/', asyncHandler(createMistake))
router.get('/:id', asyncHandler(getMistake))
router.put('/:id', asyncHandler(updateMistake))
router.delete('/:id', asyncHandler(deleteMistake))
router.patch('/:id/master', asyncHandler(toggleMastered))
router.patch('/:id/review', asyncHandler(updateReview))

export default router
