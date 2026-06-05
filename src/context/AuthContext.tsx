import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, setToken, getToken } from '../services/api'

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  // Check existing token on mount
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(res => setUser(res.user))
      .catch(() => {
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setToken(res.token)
    setUser(res.user)
  }

  const register = async (username: string, email: string, password: string) => {
    const res = await authApi.register(username, email, password)
    setToken(res.token)
    setUser(res.user)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
