import { useState, useEffect, useRef } from 'react'
import './DemoGate.css'

const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD
const STORAGE_KEY = 'gitcha_demo_access'

export default function DemoGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!DEMO_PASSWORD) return true
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const [hiding, setHiding] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!unlocked && inputRef.current) {
      inputRef.current.focus()
    }
  }, [unlocked])

  if (!DEMO_PASSWORD) return children
  if (unlocked && !hiding) return children

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === DEMO_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setHiding(true)
      setTimeout(() => setUnlocked(true), 400)
    } else {
      setError('Incorrect password')
      setPassword('')
      if (inputRef.current) inputRef.current.focus()
    }
  }

  return (
    <>
      <div className={`demo-gate${hiding ? ' demo-gate--hidden' : ''}`}>
        <div className="demo-gate-card">
          <div className="demo-gate-brand">
            Gitcha<span>Cars</span>
          </div>
          <div className="demo-gate-subtitle">
            Private Demo &mdash; Enter password to continue
          </div>
          <form className="demo-gate-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="password"
              className={`demo-gate-input${error ? ' demo-gate-input--error' : ''}`}
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoComplete="off"
            />
            <button type="submit" className="demo-gate-btn">
              Enter
            </button>
            {error && <div className="demo-gate-error">{error}</div>}
          </form>
        </div>
      </div>
      {hiding && children}
    </>
  )
}
