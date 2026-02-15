import Lottie from 'lottie-react'
import './LottieAnimation.css'

export default function LottieAnimation({ animationData, size = 200, loop = true, autoplay = true }) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    return null
  }

  return (
    <div className="lottie-wrapper" style={{ width: size, height: size }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
