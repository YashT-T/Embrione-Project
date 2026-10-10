import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Register from './pages/Register.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}