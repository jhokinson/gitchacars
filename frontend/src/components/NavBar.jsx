import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import NotificationBell from './NotificationBell'
import AvatarDropdown from './AvatarDropdown'
import './NavBar.css'

export default function NavBar() {
  const { isAuthenticated, isRole } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-gitcha">Gitcha</span>
          <span className="navbar-brand-cars">Cars</span>
        </Link>

        {/* Desktop navigation icons */}
        <div className="navbar-links">
          <Link to="/" className={`navbar-icon-link${isActive('/') ? ' active' : ''}`} data-tooltip="Browse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </Link>
          <Link
            to={isAuthenticated ? '/dashboard' : '#'}
            className={`navbar-icon-link${isActive('/dashboard') ? ' active' : ''}`}
            data-tooltip="Dashboard"
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                toast.info(
                  <>Sign in to access Dashboard. <a href="/auth?mode=login&redirect=/dashboard" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a></>
                )
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Link>
          <Link
            to={isAuthenticated ? '/add-vehicle' : '#'}
            className={`navbar-icon-link${isActive('/add-vehicle') ? ' active' : ''}`}
            data-tooltip="Add Vehicle"
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                toast.info(
                  <>Sign in to access Add Vehicle. <a href="/auth?mode=login&redirect=/add-vehicle" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a></>
                )
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h3l3 3v5h-2" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </Link>
          {isAuthenticated && isRole('admin') && (
            <Link to="/admin" className={`navbar-icon-link${isActive('/admin') ? ' active' : ''}`} data-tooltip="Admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Right side: CTA + auth buttons or user controls */}
        <div className="navbar-right">
          {/* CTA Button — always visible */}
          <Link
            to={isAuthenticated ? '/create-listing' : '#'}
            className="btn btn-primary btn-sm navbar-cta"
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                toast.info(
                  <>Sign in to post a Want-Listing. <a href="/auth?mode=login&redirect=/create-listing" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a></>
                )
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="navbar-cta-label">Post Want-Listing</span>
          </Link>

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <AvatarDropdown />
            </>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/auth?mode=login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/auth?mode=register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" className={`navbar-mobile-link${isActive('/') ? ' active' : ''}`}>
            Browse
          </Link>
          <Link
            to={isAuthenticated ? '/dashboard' : '#'}
            className={`navbar-mobile-link${isActive('/dashboard') ? ' active' : ''}`}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                toast.info(
                  <>Sign in to access Dashboard. <a href="/auth?mode=login&redirect=/dashboard" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a></>
                )
              }
            }}
          >
            Dashboard
          </Link>
          <Link
            to={isAuthenticated ? '/create-listing' : '#'}
            className={`navbar-mobile-link${isActive('/create-listing') ? ' active' : ''}`}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                toast.info(
                  <>Sign in to post a Want-Listing. <a href="/auth?mode=login&redirect=/create-listing" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a></>
                )
              }
            }}
          >
            Post Want-Listing
          </Link>
          <Link
            to={isAuthenticated ? '/add-vehicle' : '#'}
            className={`navbar-mobile-link${isActive('/add-vehicle') ? ' active' : ''}`}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                toast.info(
                  <>Sign in to access Add Vehicle. <a href="/auth?mode=login&redirect=/add-vehicle" style={{ color: '#fff', textDecoration: 'underline' }}>Sign In</a></>
                )
              }
            }}
          >
            Add Vehicle
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/introductions" className={`navbar-mobile-link${isActive('/introductions') ? ' active' : ''}`}>
                Introductions
              </Link>
              <Link to="/messages" className={`navbar-mobile-link${isActive('/messages') ? ' active' : ''}`}>
                Messages
              </Link>
            </>
          )}
          {isAuthenticated && isRole('admin') && (
            <Link to="/admin" className={`navbar-mobile-link${isActive('/admin') ? ' active' : ''}`}>
              Admin
            </Link>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/auth?mode=login" className="navbar-mobile-link">Sign In</Link>
              <Link to="/auth?mode=register" className="navbar-mobile-link">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
