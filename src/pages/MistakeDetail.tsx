import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Tag, Trash2, CheckCircle, Clock, Calendar, Loader2 } from 'lucide-react'
import { db } from '../db'
import type { Mistake } from '../types'
import { formatDate, getSubjectLabel, getSubjectColor } from '../hooks/utils'
import AnswerPanel from '../components/AnswerPanel'
import ImageViewer from '../components/ImageViewer'

export default function MistakeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mistake, setMistake] = useState<Mistake | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [masterLoading, setMasterLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    db.mistakes.get(id)
      .then(data => {
        if (data) {
          setMistake(data)
        } else {
          navigate('/mistakes', { replace: true })
        }
      })
      .catch(() => navigate('/mistakes', { replace: true }))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async () => {
    if (!id) return
    setDeleteLoading(true)
    try {
      await db.mistakes.delete(id)
      navigate('/mistakes', { replace: true })
    } catch (err: any) {
      alert(err.message || '删除失败')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleMastered = async () => {
    if (!mistake || !id) return
    setMasterLoading(true)
    try {
      const updated = { ...mistake, mastered: !mistake.mastered, updatedAt: Date.now() }
      await db.mistakes.put(updated)
      setMistake(updated)
    } catch (err: any) {
      alert(err.message || '操作失败')
    } finally {
      setMasterLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!mistake) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">😅</div>
        <p className="text-text-secondary mb-4">错题不存在或已被删除</p>
        <button onClick={() => navigate('/mistakes')} className="text-primary hover:underline text-sm">返回错题列表</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMastered}
            disabled={masterLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mistake.mastered
                ? 'bg-success/10 text-success hover:bg-success/20'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            {masterLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {mistake.mastered ? '已掌握' : '标记掌握'}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleteLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 text-xs font-medium transition-colors"
          >
            {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            删除
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mb-4 p-3 bg-danger/5 border border-danger/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-danger">确认删除这道错题？此操作不可撤销。</span>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="text-xs px-3 py-1.5 border border-border rounded-lg">取消</button>
            <button onClick={handleDelete} className="text-xs px-3 py-1.5 bg-danger text-white rounded-lg">确认删除</button>
          </div>
        </div>
      )}

      {/* Subject & Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSubjectColor(mistake.subject)}`}>
          {getSubjectLabel(mistake.subject)}
        </span>
        {mistake.mastered && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">✓ 已掌握</span>
        )}
      </div>

      <h1 className="text-xl font-bold text-text mb-4">{mistake.title || '无标题'}</h1>

      {/* Question */}
      <section className="bg-white rounded-xl border border-border p-5 mb-4">
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">题</span>
          题目
        </h2>
        {mistake.questionText && (
          <div className="text-sm text-text leading-relaxed whitespace-pre-wrap mb-3">{mistake.questionText}</div>
        )}
        <ImageViewer images={mistake.questionImages} />
      </section>

      {/* Answer */}
      <section className="mb-4">
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">答</span>
          答案 <span className="font-normal text-text-secondary">（点击展开）</span>
        </h2>
        <AnswerPanel answerText={mistake.answerText} answerImages={mistake.answerImages} />
      </section>

      {/* Source */}
      {(mistake.source.book || mistake.source.chapter || mistake.source.problemNumber) && (
        <section className="bg-white rounded-xl border border-border p-4 mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">题目来源</h3>
          <div className="flex items-center gap-2 text-sm text-text">
            <BookOpen className="w-4 h-4 text-text-secondary" />
            {[mistake.source.book, mistake.source.chapter, mistake.source.problemNumber && `第${mistake.source.problemNumber}题`]
              .filter(Boolean).join(' · ')}
          </div>
        </section>
      )}

      {/* Knowledge Points */}
      {mistake.knowledgePoints.length > 0 && (
        <section className="bg-white rounded-xl border border-border p-4 mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">知识点</h3>
          <div className="flex flex-wrap gap-1.5">
            {mistake.knowledgePoints.map((kp, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs">
                <Tag className="w-3 h-3" /> {kp}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {mistake.notes && (
        <section className="bg-white rounded-xl border border-border p-4 mb-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">备注</h3>
          <p className="text-sm text-text whitespace-pre-wrap">{mistake.notes}</p>
        </section>
      )}

      {/* Metadata */}
      <section className="bg-white rounded-xl border border-border p-4">
        <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 创建于 {formatDate(mistake.createdAt)}</div>
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 复习 {mistake.reviewCount} 次</div>
          {mistake.lastReviewedAt && <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> 上次复习 {formatDate(mistake.lastReviewedAt)}</div>}
          {mistake.nextReviewAt && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 下次复习 {formatDate(mistake.nextReviewAt)}</div>}
        </div>
      </section>
    </div>
  )
}
