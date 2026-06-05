import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { db } from '../db'
import { generateId } from '../hooks/utils'
import type { Subject } from '../types'
import { SUBJECTS } from '../types'
import ImageViewer from '../components/ImageViewer'
import SmartUpload, { type SmartUploadResult } from '../components/SmartUpload'

export default function AddMistake() {
  const navigate = useNavigate()

  // Form state
  const [subject, setSubject] = useState<Subject>('math')
  const [title, setTitle] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [questionImages, setQuestionImages] = useState<string[]>([])
  const [answerText, setAnswerText] = useState('')
  const [answerImages, setAnswerImages] = useState<string[]>([])
  const [sourceBook, setSourceBook] = useState('')
  const [sourceChapter, setSourceChapter] = useState('')
  const [sourceProblem, setSourceProblem] = useState('')
  const [knowledgePointInput, setKnowledgePointInput] = useState('')
  const [knowledgePoints, setKnowledgePoints] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Smart upload mode
  const [showSmartUpload, setShowSmartUpload] = useState(false)
  const [smartUploading, setSmartUploading] = useState(false)
  const answerFileInputRef = useRef<HTMLInputElement>(null)
  const answerCameraInputRef = useRef<HTMLInputElement>(null)

  const handleSmartUploadComplete = (result: SmartUploadResult) => {
    setQuestionImages(result.questionImages)
    setQuestionText(result.questionText)
    setSubject(result.subject)
    setShowSmartUpload(false)
    setSmartUploading(true)
    // Auto-generate title
    if (!title) {
      const subjectLabel = SUBJECTS.find(s => s.id === result.subject)?.label || ''
      setTitle(`${subjectLabel}错题`)
    }
  }

  const addKnowledgePoint = () => {
    const trimmed = knowledgePointInput.trim()
    if (trimmed && !knowledgePoints.includes(trimmed)) {
      setKnowledgePoints(prev => [...prev, trimmed])
      setKnowledgePointInput('')
    }
  }

  const removeKnowledgePoint = (idx: number) => {
    setKnowledgePoints(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!questionImages.length && !questionText) {
      alert('请至少上传一道错题图片或输入题目内容')
      return
    }

    setSaving(true)
    try {
      const now = Date.now()
      await db.mistakes.add({
        id: generateId(),
        subject,
        title: title || `${SUBJECTS.find(s => s.id === subject)?.label || ''}错题`,
        questionText,
        questionImages,
        answerText,
        answerImages,
        source: {
          book: sourceBook,
          chapter: sourceChapter,
          problemNumber: sourceProblem,
        },
        knowledgePoints: [...knowledgePoints],
        notes,
        createdAt: now,
        updatedAt: now,
        mastered: false,
        reviewCount: 0,
      })
      navigate('/mistakes')
    } catch (err: any) {
      alert(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // Show smart upload as initial step
  if (showSmartUpload) {
    return (
      <div className="max-w-3xl mx-auto pb-20 sm:pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowSmartUpload(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-text">智能上传</h2>
        </div>
        <SmartUpload
          onComplete={handleSmartUploadComplete}
          onCancel={() => setShowSmartUpload(false)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-text">添加错题</h2>
      </div>

      <div className="space-y-6">
        {/* Smart Upload Button */}
        {!smartUploading && questionImages.length === 0 && (
          <button
            onClick={() => setShowSmartUpload(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition-colors text-primary font-medium"
          >
            <Sparkles className="w-5 h-5" />
            智能上传 — 拍照自动识别科目
          </button>
        )}

        {smartUploading && questionImages.length > 0 && (
          <div className="bg-success/5 border border-success/20 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-success flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              已通过智能识别导入
            </span>
            <button
              onClick={() => { setShowSmartUpload(true); setSmartUploading(false) }}
              className="text-xs text-primary hover:underline"
            >
              重新上传
            </button>
          </div>
        )}

        {/* Subject Selection */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">学科分类</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  subject === s.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-white text-text-secondary hover:border-primary/30'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Title */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">标题 <span className="text-text-secondary font-normal">（选填）</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例：极限计算易错题"
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </section>

        {/* Question */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">题目 <span className="text-red-500">*</span></label>
          <div className="bg-white border border-border rounded-xl p-4 space-y-3">
            {questionImages.length > 0 && (
              <ImageViewer images={questionImages} onRemove={(idx) => setQuestionImages(prev => prev.filter((_, i) => i !== idx))} />
            )}
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="题目文字内容"
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
            />
          </div>
        </section>

        {/* Answer */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">答案 <span className="text-text-secondary font-normal">（选填）</span></label>
          <div className="bg-white border border-border rounded-xl p-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => answerFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                上传答案图片
              </button>
              <button
                onClick={() => answerCameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                拍照
              </button>
            </div>
            <input ref={answerFileInputRef} type="file" accept="image/*" multiple onChange={e => {
              Array.from(e.target.files || []).forEach(file => {
                const reader = new FileReader()
                reader.onload = (ev) => setAnswerImages(prev => [...prev, ev.target?.result as string])
                reader.readAsDataURL(file)
              })
              e.target.value = ''
            }} className="hidden" />
            <input ref={answerCameraInputRef} type="file" accept="image/*" capture="environment" onChange={e => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => setAnswerImages(prev => [...prev, ev.target?.result as string])
                reader.readAsDataURL(file)
              }
              e.target.value = ''
            }} className="hidden" />
            <ImageViewer images={answerImages} onRemove={(idx) => setAnswerImages(prev => prev.filter((_, i) => i !== idx))} />
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="答案文字内容"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
            />
          </div>
        </section>

        {/* Source */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">题目来源 <span className="text-text-secondary font-normal">（选填）</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">书籍</label>
              <input type="text" value={sourceBook} onChange={e => setSourceBook(e.target.value)} placeholder="如：880" className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">章节</label>
              <input type="text" value={sourceChapter} onChange={e => setSourceChapter(e.target.value)} placeholder="如：第三章" className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">题号</label>
              <input type="text" value={sourceProblem} onChange={e => setSourceProblem(e.target.value)} placeholder="如：12" className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
            </div>
          </div>
        </section>

        {/* Knowledge Points */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">知识点标签 <span className="text-text-secondary font-normal">（选填）</span></label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={knowledgePointInput}
              onChange={e => setKnowledgePointInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKnowledgePoint()}
              placeholder="输入知识点后按回车添加"
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
            <button onClick={addKnowledgePoint} className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors text-sm font-medium">添加</button>
          </div>
          {knowledgePoints.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {knowledgePoints.map((kp, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs">
                  {kp}
                  <button onClick={() => removeKnowledgePoint(idx)} className="hover:text-red-500 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">备注 <span className="text-text-secondary font-normal">（选填）</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="补充说明，如：这道题经常考，需要重点复习" rows={2} className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none" />
        </section>

        {/* Save */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="flex-1 px-6 py-3 border border-border rounded-xl text-text-secondary hover:bg-gray-50 transition-colors text-sm font-medium">取消</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> 保存中...</> : <><Save className="w-4 h-4" /> 保存错题</>}
          </button>
        </div>
      </div>
    </div>
  )
}
