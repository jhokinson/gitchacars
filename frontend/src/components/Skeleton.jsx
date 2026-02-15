import './Skeleton.css'

export default function Skeleton({ variant = 'text', width, height }) {
  if (variant === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card-image skeleton-shimmer" />
        <div className="skeleton-card-content">
          <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: 14 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: 18 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: 14 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: 14 }} />
        </div>
      </div>
    )
  }

  if (variant === 'avatar') {
    return <div className="skeleton-avatar skeleton-shimmer" />
  }

  return (
    <div
      className="skeleton-line skeleton-shimmer"
      style={{ width: width || '100%', height: height || 14 }}
    />
  )
}
