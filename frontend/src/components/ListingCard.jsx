import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FavoriteButton from './FavoriteButton'
import ShareButton from './ShareButton'
import VehicleTypeIcon from './VehicleTypeIcon'
import './ListingCard.css'

export default function ListingCard({ listing, onFavoriteToggle }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [imgError, setImgError] = useState(false)

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `${days}d ago`
    const hours = Math.floor(diff / 3600000)
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const budgetMin = listing.budgetMin ? `$${Number(listing.budgetMin).toLocaleString()}` : '$0'
  const budgetMax = listing.budgetMax ? `$${Number(listing.budgetMax).toLocaleString()}` : ''
  const specs = [
    listing.yearMin && listing.yearMax ? `${listing.yearMin}–${listing.yearMax}` : null,
    listing.mileageMax ? `Under ${Number(listing.mileageMax).toLocaleString()} mi` : null,
    listing.transmission ? listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1) : null,
    listing.drivetrain ? listing.drivetrain.toUpperCase() : null,
  ].filter(Boolean)

  const buyerInitial = listing.buyer?.firstName?.[0]?.toUpperCase() || listing.buyerFirstName?.[0]?.toUpperCase() || '?'
  const buyerName = listing.buyer?.firstName || listing.buyerFirstName || 'Buyer'

  return (
    <div className="listing-card" onClick={() => navigate(`/want-listings/${listing.id}`)}>
      <div className="listing-card-image">
        {listing.make && listing.model && !imgError ? (
          <img
            src={`/api/car-image?make=${encodeURIComponent(listing.make)}&model=${encodeURIComponent(listing.model)}&year=${listing.yearMax || ''}`}
            alt={`${listing.make} ${listing.model}`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <VehicleTypeIcon type={listing.vehicleType} size={48} />
        )}
        <div className="listing-card-image-overlay" />
        <span className="listing-card-tag">
          <VehicleTypeIcon type={listing.vehicleType} size={16} />
          Buyer
        </span>
      </div>

      <div className="listing-card-content">
        <div className="listing-card-actions" onClick={(e) => e.stopPropagation()}>
          <ShareButton listingId={listing.id} />
          {isAuthenticated && (
            <FavoriteButton
              listingId={listing.id}
              isFavorited={listing.isFavorited}
              onToggle={onFavoriteToggle}
            />
          )}
        </div>

        <div className="listing-card-row1">
          <span className="listing-card-budget">{budgetMin} – {budgetMax}</span>
          <span className="listing-card-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {timeAgo(listing.createdAt)}
          </span>
        </div>

        <div className="listing-card-row2">
          <h3 className="listing-card-title">{listing.title}</h3>
          <p className="listing-card-subtitle">
            Wanting to buy{listing.yearMin && listing.yearMax ? ` ${listing.yearMin}–${listing.yearMax}` : ''}{listing.make ? ` ${listing.make}` : ''}{listing.model ? ` ${listing.model}` : ''}
          </p>
          {listing.zipCode && (
            <span className="listing-card-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Within {listing.radiusMiles || '25'} mi of {listing.zipCode}
            </span>
          )}
        </div>

        {specs.length > 0 && (
          <div className="listing-card-specs">
            {specs.join(' | ')}
          </div>
        )}

        {(() => {
          const mustHave = listing.featuresMustHave || []
          const niceToHave = listing.featuresNiceToHave || []
          const allPrioritized = [...mustHave.map(f => ({ f, priority: 'must' })), ...niceToHave.map(f => ({ f, priority: 'nice' }))]
          const features = allPrioritized.length > 0
            ? allPrioritized
            : (listing.features || []).map(f => ({ f, priority: null }))
          if (features.length === 0) return null
          return (
            <div className="listing-card-features">
              {features.slice(0, 4).map(({ f, priority }) => (
                <span key={f} className={`tag-pill${priority === 'must' ? ' tag-pill-must' : priority === 'nice' ? ' active' : ''}`}>{f}</span>
              ))}
              {features.length > 4 && (
                <span className="tag-pill">+{features.length - 4}</span>
              )}
            </div>
          )
        })()}

        <div className="listing-card-buyer">
          <span className="listing-card-buyer-avatar">{buyerInitial}</span>
          <span className="listing-card-buyer-name">{buyerName}</span>
        </div>
      </div>
    </div>
  )
}
