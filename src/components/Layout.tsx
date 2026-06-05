import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Plus, LayoutDashboard, List } from 'lucide-react'

export default function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-text-secondary hover:text-text'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-text">考研错题本</h1>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <NavLink to="/" className={linkClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span>概览</span>
            </NavLink>
            <NavLink to="/mistakes" className={linkClass}>
              <List className="w-5 h-5" />
              <span>错题列表</span>
            </NavLink>
            <NavLink to="/add" className={linkClass}>
              <Plus className="w-5 h-5" />
              <span>添加错题</span>
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
        <div className="flex justify-around py-2">
          <NavLink to="/" className={linkClass}>
            <LayoutDashboard className="w-5 h-5" />
            <span>概览</span>
          </NavLink>
          <NavLink to="/mistakes" className={linkClass}>
            <List className="w-5 h-5" />
            <span>列表</span>
          </NavLink>
          <NavLink to="/add" className={linkClass}>
            <Plus className="w-5 h-5" />
            <span>添加</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
