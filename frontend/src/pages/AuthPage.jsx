import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PasswordInput from '../components/PasswordInput'
import './pages.css'

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const redirect = searchParams.get('redirect')
  const { login } = useAuth()
  const navigate = useNavigate()

  // Login state
  const [loginEmail, setLoginEmail] = useState(searchParams.get('email') || '')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState(searchParams.get('expired') ? 'Your session has expired. Please log in again.' : '')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', primaryIntent: 'buy',
  })
  const [regErrors, setRegErrors] = useState({})
  const [regServerError, setRegServerError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const [welcomeMsg, setWelcomeMsg] = useState('')

  const setMode = (m) => {
    const params = new URLSearchParams(searchParams)
    params.set('mode', m)
    setSearchParams(params, { replace: true })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await apiService.auth.login({ email: loginEmail, password: loginPassword })
      login(res.data.data)
      const user = res.data.data.user
      navigate(redirect || (user.role === 'admin' ? '/admin' : '/dashboard'))
    } catch {
      setLoginError('Invalid email or password')
    } finally {
      setLoginLoading(false)
    }
  }

  const validateReg = () => {
    const errs = {}
    if (!regForm.firstName.trim()) errs.firstName = 'First name is required'
    if (!regForm.lastName.trim()) errs.lastName = 'Last name is required'
    if (!regForm.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) errs.email = 'Invalid email format'
    if (!regForm.password) errs.password = 'Password is required'
    else if (regForm.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (regForm.password !== regForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegServerError('')
    setDuplicateEmail(false)
    const errs = validateReg()
    setRegErrors(errs)
    if (Object.keys(errs).length > 0) return

    setRegLoading(true)
    try {
      const res = await apiService.auth.register({
        firstName: regForm.firstName, lastName: regForm.lastName,
        email: regForm.email, password: regForm.password,
        primaryIntent: regForm.primaryIntent,
      })
      login(res.data.data)
      navigate(redirect || '/dashboard')
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateEmail(true)
      } else {
        setRegServerError(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setRegLoading(false)
    }
  }

  const handleRegChange = (e) => setRegForm({ ...regForm, [e.target.name]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: mode === 'register' ? 520 : 440 }}>
        <div className="auth-brand">
          <h1 className="auth-brand-name">GitchaCars</h1>
          <p className="auth-brand-tagline">The Want Marketplace for Cars</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' && (
          <>
            {loginError && <div className="form-error-banner auth-error" role="alert">{loginError}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <PasswordInput value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="auth-divider">or</div>
            <GoogleSignInButton />
          </>
        )}

        {mode === 'register' && (
          <>
            {welcomeMsg && <div className="form-success-banner" role="status">{welcomeMsg}</div>}
            {regServerError && <div className="form-error-banner auth-error" role="alert">{regServerError}</div>}

            <GoogleSignInButton
              primaryIntent={regForm.primaryIntent}
              onNewUser={() => setWelcomeMsg('Welcome to GitchaCars! You can buy and sell from your account.')}
            />
            <div className="auth-divider">or continue with email</div>

            {duplicateEmail && (
              <div className="duplicate-email-card" role="alert">
                <div className="duplicate-email-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <div className="duplicate-email-content">
                  <p className="duplicate-email-title">An account with <strong>{regForm.email}</strong> already exists.</p>
                  <p className="duplicate-email-subtitle">Would you like to sign in instead?</p>
                  <div className="duplicate-email-actions">
                    <button type="button" className="btn btn-accent btn-sm" onClick={() => { setLoginEmail(regForm.email); setMode('login') }}>Sign In</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setDuplicateEmail(false); setRegForm({ ...regForm, email: '' }) }}>Try a different email</button>
                  </div>
                </div>
              </div>
            )}

            <div className="intent-selector">
              <p className="intent-label">What brings you here?</p>
              <div className="intent-options">
                <button type="button" className={`role-card ${regForm.primaryIntent === 'buy' ? 'active' : ''}`} onClick={() => setRegForm({ ...regForm, primaryIntent: 'buy' })}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <strong>I'm looking to buy a car</strong>
                  <span>Browse and post want-listings</span>
                  {regForm.primaryIntent === 'buy' && <div className="role-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </button>
                <button type="button" className={`role-card ${regForm.primaryIntent === 'sell' ? 'active' : ''}`} onClick={() => setRegForm({ ...regForm, primaryIntent: 'sell' })}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
                    <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9m-6-6h15m-6-5v5"/>
                  </svg>
                  <strong>I'm looking to sell a car</strong>
                  <span>List vehicles and connect with buyers</span>
                  {regForm.primaryIntent === 'sell' && <div className="role-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </button>
                <button type="button" className={`role-card ${regForm.primaryIntent === 'both' ? 'active' : ''}`} onClick={() => setRegForm({ ...regForm, primaryIntent: 'both' })}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  <strong>Both — buy and sell</strong>
                  <span>Full access to all features</span>
                  {regForm.primaryIntent === 'both' && <div className="role-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </button>
              </div>
              <p className="intent-helper">Don't worry — you can always do both. This just helps us personalize your experience.</p>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={regForm.firstName} onChange={handleRegChange} placeholder="First name" />
                  {regErrors.firstName && <div className="form-error" role="alert">{regErrors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={regForm.lastName} onChange={handleRegChange} placeholder="Last name" />
                  {regErrors.lastName && <div className="form-error" role="alert">{regErrors.lastName}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={regForm.email} onChange={handleRegChange} placeholder="you@example.com" />
                {regErrors.email && <div className="form-error" role="alert">{regErrors.email}</div>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <PasswordInput name="password" value={regForm.password} onChange={handleRegChange} placeholder="At least 8 characters" />
                {regErrors.password && <div className="form-error" role="alert">{regErrors.password}</div>}
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <PasswordInput name="confirmPassword" value={regForm.confirmPassword} onChange={handleRegChange} placeholder="Confirm your password" />
                {regErrors.confirmPassword && <div className="form-error" role="alert">{regErrors.confirmPassword}</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={regLoading}>
                {regLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
