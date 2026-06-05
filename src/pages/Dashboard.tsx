import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Brain, TrendingUp, Target, Plus, ArrowRight } from 'lucide-react'
import { db } from '../db'
import { SUBJECTS } from '../types'
import { formatRelativeDate } from '../hooks/utils'
import type { Mistake } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [mistakes, setMistakes] = useState<Mistake[]>([])

  useEffect(() => {
    db.mistakes.orderBy('createdAt').reverse().toArray()
      .then(setMistakes)
      .catch(console.error)
  }, [])

  const totalCount = mistakes.length
  const masteredCount = mistakes.filter(m => m.mastered).length
  const recentCount = mistakes.filter(m => m.createdAt > Date.now() - 7 * 86400000).length
  const reviewDueCount = mistakes.filter(m => m.nextReviewAt && m.nextReviewAt <= Date.now() && !m.mastered).length

  const subjectStats = SUBJECTS.map(s => ({
    ...s,
    count: mistakes.filter(m => m.subject === s.id).length,
    mastered: mistakes.filter(m => m.subject === s.id && m.mastered).length,
  }))

  const recentMistakes = mistakes.slice(0, 5)

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-text">考研加油！📚</h2>
            <p className="text-sm text-text-secondary mt-1">
              你已经整理了 <strong className="text-primary">{totalCount}</strong> 道错题，继续努力！
            </p>
          </div>
          <button
            onClick={() => navigate('/add')}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            添加错题
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '总错题', value: totalCount, icon: BookOpen, color: 'text-primary bg-primary/5' },
          { label: '已掌握', value: masteredCount, icon: Brain, color: 'text-success bg-success/5' },
          { label: '本周新增', value: recentCount, icon: TrendingUp, color: 'text-secondary bg-secondary/5' },
          { label: '待复习', value: reviewDueCount, icon: Target, color: 'text-danger bg-danger/5' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color} mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-text">{stat.value}</div>
            <div className="text-xs text-text-secondary mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subject Stats */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h3 className="font-semibold text-text text-sm mb-3">各学科统计</h3>
        <div className="space-y-3">
          {subjectStats.map(s => {
            const pct = s.count ? Math.round((s.mastered / s.count) * 100) : 0
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-gray-100">
                  {s.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-text">{s.label}</span>
                    <span className="text-text-secondary">{s.mastered}/{s.count} 掌握</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: s.count ? '#4f46e5' : '#e2e8f0' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Mistakes */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text text-sm">最近添加</h3>
          <button
            onClick={() => navigate('/mistakes')}
            className="text-xs text-primary hover:text-primary-dark flex items-center gap-0.5"
          >
            查看全部 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentMistakes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm text-text-secondary">还没有错题记录</p>
            <button
              onClick={() => navigate('/add')}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              添加第一道错题
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentMistakes.map(m => (
              <div
                key={m.id}
                onClick={() => navigate(`/mistake/${m.id}`)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <span className="text-lg">{SUBJECTS.find(s => s.id === m.subject)?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{m.title || '无标题'}</p>
                  <p className="text-xs text-text-secondary">{formatRelativeDate(m.createdAt)}</p>
                </div>
                {m.mastered && (
                  <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">已掌握</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study tips */}
      <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/10 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-text text-sm">学习建议</h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              根据艾宾浩斯遗忘曲线，建议在整理错题后的第1天、第3天、第7天进行复习。
              {reviewDueCount > 0 && ` 你有 ${reviewDueCount} 道题等待复习！`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
