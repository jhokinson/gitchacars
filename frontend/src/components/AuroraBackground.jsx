import './AuroraBackground.css'

export default function AuroraBackground({ children, className = '', masked = false }) {
  return (
    <div className={`aurora-background ${className}`}>
      <div className={`aurora-background-layer${masked ? ' aurora-background-layer--masked' : ''}`} />
      <div className="aurora-background-content">
        {children}
      </div>
    </div>
  )
}
