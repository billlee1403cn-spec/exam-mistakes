import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db/connection.js'
import { config } from '../config.js'
import { AppError } from '../middleware/error.js'

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    throw new AppError(400, '用户名、邮箱和密码不能为空')
  }
  if (password.length < 6) {
    throw new AppError(400, '密码至少需要6位')
  }

  const db = getDb()
  const now = Date.now()
  const id = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, username, email, passwordHash, now, now)
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      if (err.message?.includes('email')) {
        throw new AppError(409, '该邮箱已被注册')
      }
      throw new AppError(409, '该用户名已被使用')
    }
    throw err
  }

  const token = jwt.sign({ userId: id, email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

  res.status(201).json({
    token,
    user: { id, username, email },
  })
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  if (!email || !password) {
    throw new AppError(400, '邮箱和密码不能为空')
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

  if (!user) {
    throw new AppError(401, '邮箱或密码错误')
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw new AppError(401, '邮箱或密码错误')
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )

  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email },
  })
}

export function getMe(req: Request, res: Response): void {
  const db = getDb()
  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.user!.userId) as any

  if (!user) {
    throw new AppError(404, '用户不存在')
  }

  res.json({ user })
}
