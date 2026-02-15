import { useState } from 'react'
import { Link } from 'react-router-dom'
import './VehicleCard.css'

const Placeholder = () => (
  <div className="vehicle-card-img" style={{ background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9m-6-6h15m-6-5v5"/>
    </svg>
  </div>
)

export default function VehicleCard({ vehicle }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="vehicle-card">
      {vehicle.images?.[0] && !imgError ? (
        <img src={vehicle.images[0]} alt={`${vehicle.make} ${vehicle.model}`} className="vehicle-card-img" onError={() => setImgError(true)} />
      ) : (
        <Placeholder />
      )}
      <div className="vehicle-card-body">
        <h4>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
        <p className="vehicle-card-price">${Number(vehicle.price).toLocaleString()}</p>
        <div className="vehicle-card-actions">
          <Link to={`/vehicles/${vehicle.id}/matches`} className="btn btn-primary btn-sm">Find Buyers</Link>
          <Link to={`/edit-vehicle/${vehicle.id}`} className="btn btn-secondary btn-sm">Edit</Link>
        </div>
      </div>
    </div>
  )
}
