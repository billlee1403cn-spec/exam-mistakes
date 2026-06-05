import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db/connection.js'
import { AppError } from '../middleware/error.js'
import type { Subject } from '../utils/subjectClassifier.js'

export function getMistakes(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { subject, search, sort = 'newest', page = '1', limit = '50' } = req.query

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50))
  const offset = (pageNum - 1) * limitNum

  const db = getDb()
  const conditions: string[] = ['user_id = ?']
  const params: any[] = [userId]

  if (subject && subject !== 'all') {
    conditions.push('subject = ?')
    params.push(subject)
  }

  if (search && (search as string).trim()) {
    const q = `%${(search as string).trim()}%`
    conditions.push(`(
      title LIKE ? OR question_text LIKE ? OR answer_text LIKE ?
      OR source_book LIKE ? OR source_chapter LIKE ? OR source_problem_num LIKE ?
      OR knowledge_points LIKE ? OR notes LIKE ?
    )`)
    params.push(q, q, q, q, q, q, q, q)
  }

  const whereClause = conditions.join(' AND ')

  let orderClause: string
  switch (sort) {
    case 'oldest': orderClause = 'created_at ASC'; break
    case 'subject': orderClause = 'subject ASC, created_at DESC'; break
    default: orderClause = 'created_at DESC'
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM mistakes WHERE ${whereClause}`).get(...params) as any).count
  const rows = db.prepare(`SELECT * FROM mistakes WHERE ${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`).all(...params, limitNum, offset) as any[]

  const data = rows.map(row => ({
    id: row.id,
    subject: row.subject as Subject,
    title: row.title,
    questionText: row.question_text,
    questionImages: JSON.parse(row.question_images || '[]'),
    answerText: row.answer_text,
    answerImages: JSON.parse(row.answer_images || '[]'),
    source: {
      book: row.source_book,
      chapter: row.source_chapter,
      problemNumber: row.source_problem_num,
    },
    knowledgePoints: JSON.parse(row.knowledge_points || '[]'),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mastered: !!row.mastered,
    reviewCount: row.review_count,
    lastReviewedAt: row.last_reviewed_at || undefined,
    nextReviewAt: row.next_review_at || undefined,
  }))

  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
}

export function getMistake(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { id } = req.params

  const db = getDb()
  const row = db.prepare('SELECT * FROM mistakes WHERE id = ? AND user_id = ?').get(id, userId) as any

  if (!row) {
    throw new AppError(404, '错题不存在')
  }

  res.json({
    data: {
      id: row.id,
      subject: row.subject as Subject,
      title: row.title,
      questionText: row.question_text,
      questionImages: JSON.parse(row.question_images || '[]'),
      answerText: row.answer_text,
      answerImages: JSON.parse(row.answer_images || '[]'),
      source: {
        book: row.source_book,
        chapter: row.source_chapter,
        problemNumber: row.source_problem_num,
      },
      knowledgePoints: JSON.parse(row.knowledge_points || '[]'),
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      mastered: !!row.mastered,
      reviewCount: row.review_count,
      lastReviewedAt: row.last_reviewed_at || undefined,
      nextReviewAt: row.next_review_at || undefined,
    },
  })
}

export function createMistake(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { subject, title, questionText, questionImages, answerText, answerImages, source, knowledgePoints, notes } = req.body

  if (!subject) {
    throw new AppError(400, '请选择学科分类')
  }

  const id = uuidv4()
  const now = Date.now()
  const db = getDb()

  db.prepare(`
    INSERT INTO mistakes (id, user_id, subject, title, question_text, question_images, answer_text, answer_images, source_book, source_chapter, source_problem_num, knowledge_points, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, subject, title || '',
    questionText || '', JSON.stringify(questionImages || []),
    answerText || '', JSON.stringify(answerImages || []),
    source?.book || '', source?.chapter || '', source?.problemNumber || '',
    JSON.stringify(knowledgePoints || []), notes || '',
    now, now,
  )

  res.status(201).json({ data: { id } })
}

export function updateMistake(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { id } = req.params
  const { subject, title, questionText, questionImages, answerText, answerImages, source, knowledgePoints, notes, mastered } = req.body

  const db = getDb()
  const existing = db.prepare('SELECT * FROM mistakes WHERE id = ? AND user_id = ?').get(id, userId) as any
  if (!existing) {
    throw new AppError(404, '错题不存在')
  }

  const now = Date.now()
  const updates: string[] = ['updated_at = ?']
  const params: any[] = [now]

  if (subject !== undefined) { updates.push('subject = ?'); params.push(subject) }
  if (title !== undefined) { updates.push('title = ?'); params.push(title) }
  if (questionText !== undefined) { updates.push('question_text = ?'); params.push(questionText) }
  if (questionImages !== undefined) { updates.push('question_images = ?'); params.push(JSON.stringify(questionImages)) }
  if (answerText !== undefined) { updates.push('answer_text = ?'); params.push(answerText) }
  if (answerImages !== undefined) { updates.push('answer_images = ?'); params.push(JSON.stringify(answerImages)) }
  if (source?.book !== undefined) { updates.push('source_book = ?'); params.push(source.book) }
  if (source?.chapter !== undefined) { updates.push('source_chapter = ?'); params.push(source.chapter) }
  if (source?.problemNumber !== undefined) { updates.push('source_problem_num = ?'); params.push(source.problemNumber) }
  if (knowledgePoints !== undefined) { updates.push('knowledge_points = ?'); params.push(JSON.stringify(knowledgePoints)) }
  if (notes !== undefined) { updates.push('notes = ?'); params.push(notes) }
  if (mastered !== undefined) { updates.push('mastered = ?'); params.push(mastered ? 1 : 0) }

  params.push(id, userId)
  db.prepare(`UPDATE mistakes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params)

  res.json({ success: true })
}

export function deleteMistake(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { id } = req.params

  const db = getDb()
  const result = db.prepare('DELETE FROM mistakes WHERE id = ? AND user_id = ?').run(id, userId)

  if (result.changes === 0) {
    throw new AppError(404, '错题不存在')
  }

  res.json({ success: true })
}

export function toggleMastered(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { id } = req.params
  const { mastered } = req.body

  const db = getDb()
  const existing = db.prepare('SELECT * FROM mistakes WHERE id = ? AND user_id = ?').get(id, userId) as any
  if (!existing) {
    throw new AppError(404, '错题不存在')
  }

  db.prepare('UPDATE mistakes SET mastered = ?, updated_at = ? WHERE id = ? AND user_id = ?')
    .run(mastered ? 1 : 0, Date.now(), id, userId)

  res.json({ success: true })
}

export function updateReview(req: Request, res: Response): void {
  const userId = req.user!.userId
  const { id } = req.params
  const { reviewCount, lastReviewedAt, nextReviewAt } = req.body

  const db = getDb()
  const existing = db.prepare('SELECT * FROM mistakes WHERE id = ? AND user_id = ?').get(id, userId) as any
  if (!existing) {
    throw new AppError(404, '错题不存在')
  }

  db.prepare('UPDATE mistakes SET review_count = ?, last_reviewed_at = ?, next_review_at = ?, updated_at = ? WHERE id = ? AND user_id = ?')
    .run(reviewCount || 0, lastReviewedAt || null, nextReviewAt || null, Date.now(), id, userId)

  res.json({ success: true })
}
