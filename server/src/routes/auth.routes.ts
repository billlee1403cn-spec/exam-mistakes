import { Router } from 'express'
import { register, login, getMe } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from './utils.js'

const router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.get('/me', authMiddleware, getMe)

export default router
