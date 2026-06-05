import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface AuthPayload {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录，请先登录' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}
