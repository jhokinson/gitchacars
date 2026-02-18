import './GlowingShadow.css'

export default function GlowingShadow({ children, className = '' }) {
  return (
    <div className={`glowing-shadow ${className}`.trim()}>
      {children}
    </div>
  )
}
