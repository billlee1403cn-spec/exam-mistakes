import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'exam-mistake-tracker-secret-key-2024',
  jwtExpiresIn: '30d',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'mistakes.db'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
}
