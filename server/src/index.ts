import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { initSchema } from './db/schema.js'
import { errorHandler } from './middleware/error.js'
import authRoutes from './routes/auth.routes.js'
import mistakesRoutes from './routes/mistakes.routes.js'
import classifyRoutes from './routes/classify.routes.js'

const app = express()

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json({ limit: '50mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/mistakes', mistakesRoutes)
app.use('/api/classify', classifyRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() })
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
