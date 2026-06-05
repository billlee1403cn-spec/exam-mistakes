import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password) {
      setError('请填写所有字段')
      return
    }
    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">考研错题本</h1>
          <p className="text-sm text-text-secondary mt-1">创建新账号</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          {error && (
            <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">昵称</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="你的昵称"
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少6位密码"
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 注册中...</>
            ) : (
              <><UserPlus className="w-4 h-4" /> 注册</>
            )}
          </button>

          <p className="text-center text-sm text-text-secondary">
            已有账号？{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
