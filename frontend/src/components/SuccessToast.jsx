import { useState, useEffect } from 'react'
import LottieAnimation from './LottieAnimation'
import successAnim from '../assets/lottie/success-check.json'
import './SuccessToast.css'

export default function SuccessToast({ message, show, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        if (onDone) onDone()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onDone])

  if (!visible) return null

  return (
    <div className="success-toast-overlay">
      <div className="success-toast">
        <LottieAnimation animationData={successAnim} size={80} loop={false} />
        <p className="success-toast-message">{message}</p>
      </div>
    </div>
  )
}
