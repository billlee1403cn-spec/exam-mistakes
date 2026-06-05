import { useNavigate } from 'react-router-dom'
import { ChevronRight, BookOpen, Tag } from 'lucide-react'
import type { Mistake } from '../types'
import { getSubjectColor, getSubjectLabel } from '../hooks/utils'

interface MistakeCardProps {
  mistake: Mistake
}

export default function MistakeCard({ mistake }: MistakeCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/mistake/${mistake.id}`)}
      className="bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Subject Badge */}
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSubjectColor(mistake.subject)}`}>
          {getSubjectLabel(mistake.subject)}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text text-sm mb-1.5 truncate">
            {mistake.title || '无标题'}
          </h3>

          {/* Question preview */}
          {mistake.questionText && (
            <p className="text-xs text-text-secondary line-clamp-2 mb-2 leading-relaxed">
              {mistake.questionText.slice(0, 120)}
            </p>
          )}

          {/* Source info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            {mistake.source.book && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {mistake.source.book}
                {mistake.source.chapter && ` · ${mistake.source.chapter}`}
                {mistake.source.problemNumber && ` · 第${mistake.source.problemNumber}题`}
              </span>
            )}
          </div>

          {/* Knowledge Points */}
          {mistake.knowledgePoints.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {mistake.knowledgePoints.map((kp, idx) => (
                <span key={idx} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary/5 text-primary rounded text-xs">
                  <Tag className="w-2.5 h-2.5" />
                  {kp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-text-secondary shrink-0 mt-1" />
      </div>
    </div>
  )
}
