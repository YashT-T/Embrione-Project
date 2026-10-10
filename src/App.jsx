import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Register from './pages/Register.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
            fontSize: '14px',
          },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="border-t border-line py-5 text-center text-sm text-muted">
        The Embrione · Department of CSE · PES University
      </footer>
    </div>
  )
}