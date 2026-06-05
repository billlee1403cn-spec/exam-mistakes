import { useState, useEffect, useMemo } from 'react'
import { Search, SortAsc } from 'lucide-react'
import { db } from '../db'
import type { Mistake, Subject } from '../types'
import MistakeCard from '../components/MistakeCard'
import SubjectFilter from '../components/SubjectFilter'
import EmptyState from '../components/EmptyState'

type SortMode = 'newest' | 'oldest' | 'subject'

export default function MistakeList() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'all'>('all')
  const [searchText, setSearchText] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')

  useEffect(() => {
    db.mistakes.orderBy('createdAt').reverse().toArray()
      .then(data => {
        setMistakes(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(searchInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const filtered = useMemo(() => {
    let result = [...mistakes]

    // Subject filter
    if (subjectFilter !== 'all') {
      result = result.filter(m => m.subject === subjectFilter)
    }

    // Search
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter(m =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.questionText && m.questionText.toLowerCase().includes(q)) ||
        (m.answerText && m.answerText.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        m.knowledgePoints.some(kp => kp.toLowerCase().includes(q)) ||
        (m.source.book && m.source.book.toLowerCase().includes(q)) ||
        (m.source.chapter && m.source.chapter.toLowerCase().includes(q)) ||
        (m.source.problemNumber && m.source.problemNumber.toLowerCase().includes(q))
      )
    }

    // Sort
    switch (sortMode) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt)
        break
      case 'subject':
        result.sort((a, b) => a.subject.localeCompare(b.subject) || b.createdAt - a.createdAt)
        break
    }

    return result
  }, [mistakes, subjectFilter, searchText, sortMode])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20 sm:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">错题列表</h2>
        <span className="text-sm text-text-secondary">{filtered.length} 道</span>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="搜索错题内容、知识点、来源..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-text-secondary" />
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
            <option value="subject">按学科</option>
          </select>
        </div>
      </div>

      {/* Subject Filter */}
      <SubjectFilter active={subjectFilter} onChange={(v) => setSubjectFilter(v)} />

      {/* Mistake List */}
      {filtered.length === 0 ? (
        <EmptyState
          message={searchInput ? '没有搜索到匹配的错题' : subjectFilter !== 'all' ? '该学科下还没有错题' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <MistakeCard key={m.id} mistake={m} />
          ))}
        </div>
      )}
    </div>
  )
}
