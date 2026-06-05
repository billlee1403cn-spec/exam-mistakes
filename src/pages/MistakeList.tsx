import { useState, useEffect, useCallback } from 'react'
import { Search, SortAsc, ChevronLeft, ChevronRight } from 'lucide-react'
import { mistakesApi, type MistakesListResponse } from '../services/api'
import type { MistakesListParams } from '../services/api'
import type { Subject } from '../types'
import MistakeCard from '../components/MistakeCard'
import SubjectFilter from '../components/SubjectFilter'
import EmptyState from '../components/EmptyState'

type SortMode = 'newest' | 'oldest' | 'subject'

export default function MistakeList() {
  const [data, setData] = useState<MistakesListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'all'>('all')
  const [searchText, setSearchText] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: MistakesListParams = {
        subject: subjectFilter,
        sort: sortMode,
        page,
        limit,
      }
      if (searchText.trim()) {
        params.search = searchText.trim()
      }
      const res = await mistakesApi.list(params)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [subjectFilter, sortMode, page, searchText])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const mistakes = data?.data || []
  const totalPages = data?.totalPages || 0
  const total = data?.total || 0

  if (loading && !data) {
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
        <span className="text-sm text-text-secondary">{total} 道</span>
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
            onChange={e => { setSortMode(e.target.value as SortMode); setPage(1) }}
            className="px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
            <option value="subject">按学科</option>
          </select>
        </div>
      </div>

      {/* Subject Filter */}
      <SubjectFilter active={subjectFilter} onChange={(v) => { setSubjectFilter(v); setPage(1) }} />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Mistake List */}
      {!loading && mistakes.length === 0 ? (
        <EmptyState
          message={searchInput ? '没有搜索到匹配的错题' : subjectFilter !== 'all' ? '该学科下还没有错题' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {mistakes.map(m => (
            <MistakeCard key={m.id} mistake={m} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> 上一页
          </button>
          <span className="text-sm text-text-secondary">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            下一页 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
