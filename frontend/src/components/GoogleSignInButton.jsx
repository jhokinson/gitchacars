/**
 * Google OAuth Sign-In Button
 *
 * Setup (Google Cloud Console):
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create an OAuth 2.0 Client ID (Web application)
 * 3. Add authorized JavaScript origins: http://localhost:3001, https://yourdomain.com
 * 4. Add authorized redirect URIs: http://localhost:3001, https://yourdomain.com
 * 5. Set the Client ID in both:
 *    - backend/.env  → GOOGLE_CLIENT_ID=your-client-id
 *    - frontend/.env → VITE_GOOGLE_CLIENT_ID=your-client-id
 * 6. Configure the OAuth consent screen (app name, support email, authorized domains)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import './GoogleSignInButton.css'

export default function GoogleSignInButton({ primaryIntent, onNewUser }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleClick = () => {
    setError('')
    setLoading(true)

    if (!clientId || clientId === 'placeholder') {
      setError('Google Sign-In is temporarily unavailable. Please sign in with email.')
      setLoading(false)
      return
    }

    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is temporarily unavailable. Please sign in with email.')
      setLoading(false)
      return
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    })

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap was blocked, fall back to manual popup
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-fallback'),
          { theme: 'outline', size: 'large', width: '100%' }
        )
        // Try the popup method instead
        const btn = document.getElementById('google-signin-fallback')
        if (btn) btn.querySelector('div[role="button"]')?.click()
        setLoading(false)
      }
    })
  }

  const handleCredentialResponse = async (response) => {
    try {
      setLoading(true)
      const res = await apiService.auth.googleSignIn({
        idToken: response.credential,
        primaryIntent: primaryIntent || 'both',
      })
      login(res.data.data)
      if (res.data.data.isNewUser && onNewUser) {
        onNewUser()
      }
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error?.message || ''
      if (msg.includes('invalid_client') || msg.includes('Invalid Google token')) {
        setError('Google Sign-In is temporarily unavailable. Please sign in with email.')
      } else {
        setError(msg || 'Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="google-signin-wrapper">
      <button
        type="button"
        className="google-signin-btn"
        onClick={handleClick}
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </g>
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      <div id="google-signin-fallback" style={{ display: 'none' }} />
      {error && <div className="google-signin-error">{error}</div>}
    </div>
  )
}
