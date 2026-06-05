import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config } from './config.js'
import { initSchema } from './db/schema.js'
import { errorHandler } from './middleware/error.js'
import authRoutes from './routes/auth.routes.js'
import mistakesRoutes from './routes/mistakes.routes.js'
import classifyRoutes from './routes/classify.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json({ limit: '50mb' }))

// Serve frontend static files (from project root dist/)
const distPath = path.resolve(__dirname, '..', '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  console.log(`📦 前端静态文件目录: ${distPath}`)
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/mistakes', mistakesRoutes)
app.use('/api/classify', classifyRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() })
})

// Serve frontend for all non-API routes (SPA support)
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).json({ error: '前端页面未构建，请先运行 npm run build' })
  }
})

// Error handler
app.use(errorHandler)

// Init DB schema
initSchema()

// Start
app.listen(config.port, () => {
  console.log(`🚀 考研错题本服务启动成功: http://localhost:${config.port}`)
  console.log(`📚 API 地址: http://localhost:${config.port}/api`)
})
