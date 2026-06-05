export type Subject = 'politics' | 'math' | 'english' | 'specialty'

export interface SubjectOption {
  id: Subject
  label: string
  color: string
  icon: string
}

export const SUBJECTS: SubjectOption[] = [
  { id: 'politics', label: '政治', color: 'bg-red-500', icon: '📖' },
  { id: 'math', label: '数学', color: 'bg-blue-500', icon: '📐' },
  { id: 'english', label: '英语', color: 'bg-green-500', icon: '📝' },
  { id: 'specialty', label: '专业课', color: 'bg-purple-500', icon: '📚' },
]

export interface SourceInfo {
  book: string
  chapter: string
  problemNumber: string
}

export interface Mistake {
  id: string
  subject: Subject
  title: string
  questionText: string
  questionImages: string[] // base64 data URLs
  answerText: string
  answerImages: string[] // base64 data URLs
  source: SourceInfo
  knowledgePoints: string[]
  notes: string
  createdAt: number // timestamp
  updatedAt: number
  mastered: boolean
  reviewCount: number
  lastReviewedAt?: number
  nextReviewAt?: number
}

export type MistakeFormData = Omit<Mistake, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'lastReviewedAt' | 'nextReviewAt' | 'mastered'>
