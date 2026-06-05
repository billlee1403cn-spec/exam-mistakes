// In dev mode, use Vite proxy (/api → localhost:3001)
// In production, use the deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'

let authToken: string | null = localStorage.getItem('token')

export function setToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

export function getToken(): string | null {
  return authToken
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || '请求失败')
  }

  return data as T
}

// Auth API
export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ token: string; user: { id: string; username: string; email: string } }>(
      'POST', '/auth/register', { username, email, password }
    ),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; username: string; email: string } }>(
      'POST', '/auth/login', { email, password }
    ),
  me: () =>
    request<{ user: { id: string; username: string; email: string; created_at: number } }>(
      'GET', '/auth/me'
    ),
}

// Mistakes API
export interface MistakesListParams {
  subject?: string
  search?: string
  sort?: string
  page?: number
  limit?: number
}

export interface MistakesListResponse {
  data: any[]
  total: number
  page: number
  totalPages: number
}

export const mistakesApi = {
  list: (params: MistakesListParams = {}) => {
    const qs = new URLSearchParams()
    if (params.subject && params.subject !== 'all') qs.set('subject', params.subject)
    if (params.search) qs.set('search', params.search)
    if (params.sort) qs.set('sort', params.sort)
    if (params.page) qs.set('page', String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    return request<MistakesListResponse>('GET', `/mistakes?${qs.toString()}`)
  },
  get: (id: string) =>
    request<{ data: any }>('GET', `/mistakes/${id}`),
  create: (data: any) =>
    request<{ data: { id: string } }>('POST', '/mistakes', data),
  update: (id: string, data: any) =>
    request<{ success: boolean }>('PUT', `/mistakes/${id}`, data),
  delete: (id: string) =>
    request<{ success: boolean }>('DELETE', `/mistakes/${id}`),
  toggleMastered: (id: string, mastered: boolean) =>
    request<{ success: boolean }>('PATCH', `/mistakes/${id}/master`, { mastered }),
  updateReview: (id: string, data: { reviewCount?: number; lastReviewedAt?: number; nextReviewAt?: number }) =>
    request<{ success: boolean }>('PATCH', `/mistakes/${id}/review`, data),
}

// Classify API
export const classifyApi = {
  classify: (text: string) =>
    request<{ subject: string; confidence: number; scores: Record<string, number> }>(
      'POST', '/classify', { text }
    ),
}
