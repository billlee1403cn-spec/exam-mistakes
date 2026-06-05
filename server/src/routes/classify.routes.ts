import { Router } from 'express'
import { classifySubject } from '../utils/subjectClassifier.js'

const router = Router()

router.post('/', (req, res) => {
  const { text } = req.body
  if (!text) {
    res.status(400).json({ error: '请提供需要识别的文本' })
    return
  }
  const result = classifySubject(text)
  console.log('Classify input:', JSON.stringify(text.slice(0, 100)))
  console.log('Classify result:', JSON.stringify(result))
  res.json(result)
})

export default router
