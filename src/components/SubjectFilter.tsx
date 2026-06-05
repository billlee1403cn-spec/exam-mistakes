import type { Subject } from '../types'

interface SubjectFilterProps {
  active: Subject | 'all'
  onChange: (v: Subject | 'all') => void
}

const FILTERS: { value: Subject | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'politics', label: '政治' },
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  { value: 'specialty', label: '专业课' },
]

export default function SubjectFilter({ active, onChange }: SubjectFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === f.value
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-text-secondary border border-border hover:border-primary/30 hover:text-primary'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
