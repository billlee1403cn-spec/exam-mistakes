export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatRelativeDate(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatDate(ts)
}

const SUBJECT_COLORS: Record<string, string> = {
  politics: 'bg-red-100 text-red-700 border-red-200',
  math: 'bg-blue-100 text-blue-700 border-blue-200',
  english: 'bg-green-100 text-green-700 border-green-200',
  specialty: 'bg-purple-100 text-purple-700 border-purple-200',
}
const SUBJECT_LABELS: Record<string, string> = {
  politics: '政治',
  math: '数学',
  english: '英语',
  specialty: '专业课',
}

export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export function getSubjectLabel(subject: string): string {
  return SUBJECT_LABELS[subject] || subject
}
