import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import AvatarDropdown from './AvatarDropdown'
import './NavBar.css'

export default function NavBar() {
  const { isAuthenticated, isRole } = useAuth()
  const location = useLocation()
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

        {/* Desktop navigation links */}
        <div className="navbar-links">
          <Link to="/" className={`navbar-link${isActive('/') ? ' active' : ''}`}>
            Browse
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`navbar-link${isActive('/dashboard') ? ' active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/create-listing" className={`navbar-link${isActive('/create-listing') ? ' active' : ''}`}>
                Post Want
              </Link>
              <Link to="/add-vehicle" className={`navbar-link${isActive('/add-vehicle') ? ' active' : ''}`}>
                Add Vehicle
              </Link>
            </>
          )}
          {isAuthenticated && isRole('admin') && (
            <Link to="/admin" className={`navbar-link${isActive('/admin') ? ' active' : ''}`}>
              Admin
            </Link>
          )}
        </div>

        {/* Right side: auth buttons or user controls */}
        <div className="navbar-right">
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
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`navbar-mobile-link${isActive('/dashboard') ? ' active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/create-listing" className={`navbar-mobile-link${isActive('/create-listing') ? ' active' : ''}`}>
                Post Want Listing
              </Link>
              <Link to="/add-vehicle" className={`navbar-mobile-link${isActive('/add-vehicle') ? ' active' : ''}`}>
                Add Vehicle
              </Link>
              <Link to="/introductions" className={`navbar-mobile-link${isActive('/introductions') ? ' active' : ''}`}>
                Introductions
              </Link>
              <Link to="/messages" className={`navbar-mobile-link${isActive('/messages') ? ' active' : ''}`}>
                Messages
              </Link>
              {isRole('admin') && (
                <Link to="/admin" className={`navbar-mobile-link${isActive('/admin') ? ' active' : ''}`}>
                  Admin
                </Link>
              )}
            </>
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
