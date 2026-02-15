import { Link } from 'react-router-dom'
import './IntroCard.css'

export default function IntroCard({ intro, onAccept, onReject, showActions = false }) {
  const vehicle = intro.vehicle
  const statusClass = `badge badge-${intro.status}`

  return (
    <div className="intro-card">
      <div className="intro-card-body">
        {vehicle?.images?.[0] && (
          <img src={vehicle.images[0]} alt={`${vehicle.make} ${vehicle.model}`} className="intro-card-thumb" />
        )}
        <div className="intro-card-info">
          <h4>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}</h4>
          {vehicle?.price && <p className="intro-card-price">${Number(vehicle.price).toLocaleString()}</p>}
          <p className="intro-card-message">{intro.message}</p>
          <span className={statusClass}>{intro.status}</span>
        </div>
      </div>
      {showActions && intro.status === 'pending' && (
        <div className="intro-card-actions">
          <button className="btn btn-primary" onClick={() => onAccept(intro.id)}>Accept</button>
          <button className="btn btn-danger" onClick={() => onReject(intro.id)}>Reject</button>
        </div>
      )}
      {intro.status === 'accepted' && (
        <div className="intro-card-actions">
          <Link to={`/messages/${intro.id}`} className="btn btn-primary">
            {showActions ? 'Message Seller' : 'Message Buyer'}
          </Link>
        </div>
      )}
    </div>
  )
}
