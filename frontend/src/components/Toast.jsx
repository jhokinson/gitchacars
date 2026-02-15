import { useEffect, useState } from 'react'
import './Toast.css'

export default function Toast({ message, variant = 'success', onClose }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onClose, 300)
    }, 2700)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${variant} ${exiting ? 'toast-exit' : ''}`}>
      <span>{message}</span>
    </div>
  )
}
