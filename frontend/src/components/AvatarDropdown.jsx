import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AvatarDropdown.css'

export default function AvatarDropdown() {
  const { user, logout, isRole } = useAuth()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initial = user?.firstName?.[0]?.toUpperCase() || '?'
  const dashboardPath = isRole('admin') ? '/admin' : '/dashboard'

  const handleNav = (path) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="avatar-dropdown" ref={dropdownRef}>
      <button className="avatar-btn" onClick={() => setOpen(!open)}>
        <span className="avatar-circle">{initial}</span>
      </button>

      {open && (
        <div className="avatar-menu">
          <div className="avatar-menu-header">
            <span className="avatar-menu-name">{user?.firstName} {user?.lastName}</span>
            <span className="avatar-menu-email">{user?.email}</span>
          </div>
          <div className="avatar-menu-divider" />
          <button className="avatar-menu-item" onClick={() => handleNav(dashboardPath)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </button>
          <button className="avatar-menu-item" onClick={() => handleNav('/introductions')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Introductions
          </button>
          <button className="avatar-menu-item" onClick={() => handleNav('/messages')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Messages
          </button>
          <div className="avatar-menu-divider" />
          <button className="avatar-menu-item avatar-menu-item-danger" onClick={() => { setOpen(false); logout(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
