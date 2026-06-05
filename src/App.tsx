import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MistakeList from './pages/MistakeList'
import AddMistake from './pages/AddMistake'
import MistakeDetail from './pages/MistakeDetail'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes - no layout, standalone pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mistakes" element={<MistakeList />} />
            <Route path="/add" element={<AddMistake />} />
            <Route path="/mistake/:id" element={<MistakeDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
