import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PasswordInput from '../components/PasswordInput'
import './pages.css'

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', primaryIntent: 'buy',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setDuplicateEmail(false)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const res = await apiService.auth.register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        primaryIntent: form.primaryIntent,
      })
      login(res.data.data)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateEmail(true)
      } else {
        setServerError(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-brand">
          <h1 className="auth-brand-name">GitchaCars</h1>
          <p className="auth-brand-tagline">Create your account</p>
        </div>

        {welcomeMsg && <div className="form-success-banner" role="status">{welcomeMsg}</div>}
        {serverError && <div className="form-error-banner auth-error" role="alert">{serverError}</div>}

        <GoogleSignInButton
          primaryIntent={form.primaryIntent}
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
              <p className="duplicate-email-title">An account with <strong>{form.email}</strong> already exists.</p>
              <p className="duplicate-email-subtitle">Would you like to log in instead?</p>
              <div className="duplicate-email-actions">
                <Link to={`/login?email=${encodeURIComponent(form.email)}`} className="btn btn-accent btn-sm">Log In</Link>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setDuplicateEmail(false); setForm({ ...form, email: '' }) }}>Try a different email</button>
              </div>
            </div>
          </div>
        )}

        <div className="intent-selector">
          <p className="intent-label">What brings you here?</p>
          <div className="intent-options">
            <button type="button" className={`role-card ${form.primaryIntent === 'buy' ? 'active' : ''}`} onClick={() => setForm({ ...form, primaryIntent: 'buy' })}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <strong>I'm looking to buy a car</strong>
              <span>Browse and post want-listings</span>
              {form.primaryIntent === 'buy' && <div className="role-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
            </button>
            <button type="button" className={`role-card ${form.primaryIntent === 'sell' ? 'active' : ''}`} onClick={() => setForm({ ...form, primaryIntent: 'sell' })}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
                <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9m-6-6h15m-6-5v5"/>
              </svg>
              <strong>I'm looking to sell a car</strong>
              <span>List vehicles and connect with buyers</span>
              {form.primaryIntent === 'sell' && <div className="role-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
            </button>
            <button type="button" className={`role-card ${form.primaryIntent === 'both' ? 'active' : ''}`} onClick={() => setForm({ ...form, primaryIntent: 'both' })}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              <strong>Both — buy and sell</strong>
              <span>Full access to all features</span>
              {form.primaryIntent === 'both' && <div className="role-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
            </button>
          </div>
          <p className="intent-helper">Don't worry — you can always do both. This just helps us personalize your experience.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
              {errors.firstName && <div className="form-error" role="alert">{errors.firstName}</div>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
              {errors.lastName && <div className="form-error" role="alert">{errors.lastName}</div>}
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            {errors.email && <div className="form-error" role="alert">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" />
            {errors.password && <div className="form-error" role="alert">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
            {errors.confirmPassword && <div className="form-error" role="alert">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="form-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  )
}
