import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Toaster from './Toaster'
import Footer from './Footer'

export default function Layout() {
  const navigate = useNavigate()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const linkStyle = ({ isActive }) => ({
    padding: '8px 12px',
    textDecoration: 'none',
    color: isActive ? '#000' : '#333',
    background: isActive ? '#e2e8f0' : 'transparent',
    borderRadius: 6,
  })

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <header className="glassmorphic-nav">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="brand-accent" style={{ fontSize: '20px', fontWeight: '700', flexShrink: 0, marginRight: '24px' }}>
            📚 ACUTEA
          </div>
          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
            <NavLink 
              to="/dashboard" 
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <span className="nav-icon">🏠</span>
              Dashboard
            </NavLink>
            <NavLink 
              to="/classes" 
              className={`nav-item ${location.pathname === '/classes' ? 'active' : ''}`}
            >
              <span className="nav-icon">🎓</span>
              Class Management
            </NavLink>
            <NavLink 
              to="/categories" 
              className={`nav-item ${location.pathname === '/categories' ? 'active' : ''}`}
            >
              <span className="nav-icon">🗂️</span>
              Categories
            </NavLink>
            <NavLink 
              to="/grading" 
              className={`nav-item ${location.pathname === '/grading' ? 'active' : ''}`}
            >
              <span className="nav-icon">✏️</span>
              Grading
            </NavLink>
            <NavLink 
              to="/student-grades" 
              className={`nav-item ${location.pathname === '/student-grades' ? 'active' : ''}`}
            >
              <span className="nav-icon">📝</span>
              Student Grades
            </NavLink>
            <button 
              onClick={signOut} 
              className="ghost-btn"
              style={{ marginLeft: '16px' }}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
