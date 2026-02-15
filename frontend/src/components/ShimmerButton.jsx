import './ShimmerButton.css'

export default function ShimmerButton({ children, className = '', fullWidth = false, ...props }) {
  return (
    <button
      className={`shimmer-btn${fullWidth ? ' shimmer-btn-full' : ''} ${className}`}
      {...props}
    >
      <div className="shimmer-btn-spark">
        <div className="shimmer-btn-spark-inner">
          <div className="shimmer-btn-spark-gradient" />
        </div>
      </div>
      <span className="shimmer-btn-content">{children}</span>
      <div className="shimmer-btn-highlight" />
      <div className="shimmer-btn-backdrop" />
    </button>
  )
}
