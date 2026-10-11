import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Register from './pages/Register.jsx'
import Admin from './pages/Admin.jsx'
import Team from './pages/Team.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1b1d1a',
            color: '#f1f1e8',
            border: '1px solid #2d302b',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#d8f06e', secondary: '#121412' } },
        }}
      />
      <Navbar />

      {/* Every page sits inside this centred container */}
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-14 sm:py-20">
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </main>

      <footer className="mx-auto w-full max-w-[1120px] px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-7 font-display text-[15px] text-muted">
          <span>Small beginnings. Meaningful things.</span>
          <span>© 2026 Embrione · PES University</span>
        </div>
      </footer>
    </div>
  )
}
