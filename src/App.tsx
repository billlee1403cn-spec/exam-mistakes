import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MistakeList from './pages/MistakeList'
import AddMistake from './pages/AddMistake'
import MistakeDetail from './pages/MistakeDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mistakes" element={<MistakeList />} />
          <Route path="/add" element={<AddMistake />} />
          <Route path="/mistake/:id" element={<MistakeDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
