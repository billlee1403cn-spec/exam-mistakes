import { FileQuestion } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface EmptyStateProps {
  message?: string
}

export default function EmptyState({ message = '还没有错题，快去添加吧！' }: EmptyStateProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileQuestion className="w-16 h-16 text-text-secondary/30 mb-4" />
      <p className="text-text-secondary mb-4">{message}</p>
      <button
        onClick={() => navigate('/add')}
        className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
      >
        添加第一道错题
      </button>
    </div>
  )
}
