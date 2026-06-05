import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AnswerPanelProps {
  answerText: string
  answerImages: string[]
}

export default function AnswerPanel({ answerText, answerImages }: AnswerPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-semibold text-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          答案
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-border animate-fade-in">
          {answerText && (
            <div className="text-sm text-text leading-relaxed whitespace-pre-wrap mb-3">
              {answerText}
            </div>
          )}
          {answerImages.map((img, idx) => (
            <div key={idx} className="mt-2">
              <img
                src={img}
                alt={`答案图片 ${idx + 1}`}
                className="max-w-full h-auto rounded-lg border border-border"
              />
            </div>
          ))}
          {!answerText && answerImages.length === 0 && (
            <p className="text-sm text-text-secondary">暂无答案</p>
          )}
        </div>
      )}
    </div>
  )
}
