import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import FavoriteButton from '../components/FavoriteButton'
import ShareButton from '../components/ShareButton'
import FeatureTag from '../components/FeatureTag'
import VehicleTypeIcon from '../components/VehicleTypeIcon'
import AuroraBackground from '../components/AuroraBackground'
import ShimmerButton from '../components/ShimmerButton'
import ErrorBoundary from '../components/ErrorBoundary'
import CustomSelect from '../components/CustomSelect'
import './pages.css'

const vehicleTypeLabels = {
  sedan: 'Sedan',
  suv: 'SUV',
  truck: 'Pickup Truck',
  classic: 'Classic Car',
  exotic: 'Exotic / Sports',
  van: 'Van / Minivan',
  coupe: 'Coupe',
  convertible: 'Convertible',
  wagon: 'Wagon / Hatchback',
  electric: 'Electric',
  other: 'Other',
}

export default function WantListingDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [heroImgError, setHeroImgError] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [introMessage, setIntroMessage] = useState('')
  const [introSending, setIntroSending] = useState(false)
  const [introSent, setIntroSent] = useState(false)
  const [introError, setIntroError] = useState('')
  const [vehicleSelectorOpen, setVehicleSelectorOpen] = useState(false)

  useEffect(() => {
    apiService.wantListings.get(id)
      .then((res) => setListing(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (isAuthenticated) {
      apiService.vehicles.getMine()
        .then((res) => setVehicles(res.data.data || []))
        .catch(() => {})
    }
  }, [isAuthenticated])

  const handleSendIntro = async () => {
    if (!selectedVehicle) return
    setIntroSending(true)
    setIntroError('')
    try {
      await apiService.introductions.create({
        vehicleId: selectedVehicle,
        wantListingId: id,
        message: introMessage,
      })
      setIntroSent(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send introduction'
      if (msg.toLowerCase().includes('already')) {
        setIntroSent(true)
      } else {
        setIntroError(msg)
      }
    } finally {
      setIntroSending(false)
    }
  }

  const handleArchive = async () => {
    if (!window.confirm('Archive this listing?')) return
    await apiService.wantListings.archive(id)
    navigate('/dashboard')
  }

  if (loading) return <div className="detail-page"><div className="spinner" style={{ margin: '40px auto' }} /></div>
  if (notFound || !listing) return (
    <div className="detail-page">
      <div className="dashboard-empty">
        <p>Listing not found.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Back to Home</Link>
      </div>
    </div>
  )

  const isOwner = user && listing.userId === user.id
  const specs = [
    { label: 'Year Range', value: `${listing.yearMin} – ${listing.yearMax}` },
    { label: 'Max Mileage', value: listing.mileageMax ? `${Number(listing.mileageMax).toLocaleString()} mi` : 'Any' },
    { label: 'Transmission', value: listing.transmission || 'Any' },
    { label: 'Drivetrain', value: listing.drivetrain?.toUpperCase() || 'Any' },
    { label: 'Condition', value: listing.condition ? listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1) : 'Any' },
  ]

  const hasImage = listing.make && listing.model && !heroImgError
  const imageUrl = `/api/car-image?make=${encodeURIComponent(listing.make || '')}&model=${encodeURIComponent(listing.model || '')}&year=${listing.yearMax || ''}&angle=01`

  return (
    <ErrorBoundary>
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <Link to="/">Home</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <span>{listing.title}</span>
      </div>

      {/* Hero Image with Aurora Background */}
      <AuroraBackground className="detail-aurora-hero">
        <div className={`detail-hero-image${hasImage ? '' : ' detail-hero-image-fallback'}`}>
          {hasImage ? (
            <img
              src={imageUrl}
              alt={`${listing.make} ${listing.model}`}
              onError={() => setHeroImgError(true)}
            />
          ) : (
            <VehicleTypeIcon type={listing.vehicleType} size={80} />
          )}
          <span className="detail-hero-tag">
            <VehicleTypeIcon type={listing.vehicleType} size={16} />
            Buyer &middot; {listing.make} {listing.model}
          </span>
        </div>
      </AuroraBackground>

      {/* Budget + type pills */}
      <div className="detail-pills">
        <span className="detail-budget-pill">
          ${Number(listing.budgetMin).toLocaleString()} – ${Number(listing.budgetMax).toLocaleString()}
        </span>
        {listing.vehicleType && (
          <span className="detail-type-pill">
            <VehicleTypeIcon type={listing.vehicleType} size={16} />
            {vehicleTypeLabels[listing.vehicleType] || listing.vehicleType}
          </span>
        )}
      </div>

      <div className="detail-hero card">
        <div className="detail-hero-main">
          <div className="detail-hero-header">
            <div>
              <h1 className="detail-title">{listing.title}</h1>
              <p className="detail-subtitle">{listing.make} {listing.model}</p>
            </div>
            <span className={`badge badge-${listing.status}`}>{listing.status}</span>
          </div>
          <div className="detail-hero-meta">
            <span className="detail-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {listing.zipCode} &middot; {listing.radiusMiles || listing.radius || '—'} mi radius
            </span>
          </div>
        </div>
        <div className="detail-actions">
          {user && <FavoriteButton listingId={listing.id} isFavorited={listing.isFavorited} />}
          <ShareButton listingId={listing.id} />
          {isOwner && (
            <>
              <Link to={`/edit-listing/${id}`} className="btn btn-secondary btn-sm">Edit</Link>
              <button className="btn btn-ghost-danger btn-sm" onClick={handleArchive}>Archive</button>
            </>
          )}
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-col-left">
          <div className="card">
            <h3 className="detail-section-title">Specifications</h3>
            <div className="detail-specs">
              {specs.map((s, i) => (
                <div key={s.label} className={`detail-spec-row${i % 2 === 1 ? ' detail-spec-row-alt' : ''}`}>
                  <span className="detail-spec-label">{s.label}</span>
                  <span className="detail-spec-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {(() => {
            const mustHave = listing.featuresMustHave || []
            const niceToHave = listing.featuresNiceToHave || []
            const hasPriorities = mustHave.length > 0 || niceToHave.length > 0
            const flatFeatures = listing.features || []

            if (!hasPriorities && flatFeatures.length === 0) return null

            if (hasPriorities) {
              return (
                <>
                  {mustHave.length > 0 && (
                    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                      <h3 className="detail-section-title">Must-Haves</h3>
                      <div className="detail-features">
                        {mustHave.map((f) => <FeatureTag key={f} label={f} priority="must-have" />)}
                      </div>
                    </div>
                  )}
                  {niceToHave.length > 0 && (
                    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                      <h3 className="detail-section-title">Nice-to-Haves</h3>
                      <div className="detail-features">
                        {niceToHave.map((f) => <FeatureTag key={f} label={f} priority="nice-to-have" />)}
                      </div>
                    </div>
                  )}
                </>
              )
            }

            return (
              <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                <h3 className="detail-section-title">Desired Features</h3>
                <div className="detail-features">
                  {flatFeatures.map((f) => <FeatureTag key={f} label={f} />)}
                </div>
              </div>
            )
          })()}
        </div>

        <div className="detail-col-right">
          {/* Introduction tool — visible to all visitors */}
          {!isOwner && (
            <div className="detail-intro-card card">
              <h3 className="detail-section-title">Introduce Your Vehicle</h3>
              {!isAuthenticated ? (
                <>
                  <p className="detail-intro-text">Sign in to introduce your vehicle and let this buyer know you have what they're looking for.</p>
                  <Link to={`/auth?mode=login&redirect=/want-listings/${id}`} className="btn btn-accent btn-full">Sign In / Up</Link>
                </>
              ) : introSent ? (
                <div className="detail-intro-success">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  <p>Introduction sent! The buyer will be notified.</p>
                </div>
              ) : vehicles.length === 0 ? (
                <>
                  <p className="detail-intro-text">You don't have any vehicles in your inventory yet. Add one to introduce it to this buyer.</p>
                  <Link to={`/add-vehicle?redirect=/want-listings/${id}`} className="btn btn-accent btn-full">Add a Vehicle First</Link>
                </>
              ) : (
                <div className="intro-form">
                  {/* Add My Vehicle section */}
                  <div className="intro-vehicle-box">
                    {selectedVehicle ? (
                      <div className="intro-vehicle-selected">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h3l3 3v5h-2"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        <span className="intro-vehicle-name">
                          {(() => { const v = vehicles.find(v => String(v.id) === String(selectedVehicle)); return v ? `${v.year} ${v.make} ${v.model}` : '' })()}
                        </span>
                        <button className="intro-vehicle-clear" onClick={() => { setSelectedVehicle(''); setVehicleSelectorOpen(false) }} title="Change vehicle">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ) : !vehicleSelectorOpen ? (
                      <button className="intro-add-vehicle-btn" onClick={() => setVehicleSelectorOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h3l3 3v5h-2"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        <span>Add My Vehicle</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    ) : (
                      <div className="intro-vehicle-selector">
                        <label>Select your vehicle</label>
                        <CustomSelect
                          options={vehicles.map((v) => ({
                            value: String(v.id),
                            label: `${v.year} ${v.make} ${v.model}`,
                          }))}
                          value={selectedVehicle}
                          onChange={(val) => { setSelectedVehicle(val); if (val) setVehicleSelectorOpen(false) }}
                          placeholder="Choose a vehicle..."
                          searchable={vehicles.length > 5}
                        />
                      </div>
                    )}
                  </div>

                  {/* Message section */}
                  <div className="intro-message-box">
                    <label>Message to Buyer</label>
                    <textarea
                      value={introMessage}
                      onChange={(e) => setIntroMessage(e.target.value)}
                      placeholder="Write a personal note..."
                      rows={3}
                      maxLength={500}
                    />
                  </div>

                  {introError && <div className="form-error">{introError}</div>}

                  {/* Send Introduction shimmer button */}
                  <ShimmerButton
                    fullWidth
                    onClick={handleSendIntro}
                    disabled={!selectedVehicle || introSending}
                    className="intro-send-btn"
                  >
                    {introSending ? 'Sending...' : 'Send Introduction'}
                  </ShimmerButton>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-description">{listing.description}</p>
          </div>

          {listing.buyer && (
            <div className="card detail-posted-by-card" style={{ marginTop: 'var(--space-4)' }}>
              <h3 className="detail-section-title">Posted By</h3>
              <div className="detail-buyer">
                <div className="detail-buyer-avatar">
                  {listing.buyer.firstName?.charAt(0).toUpperCase()}
                </div>
                <span className="detail-buyer-name">{listing.buyer.firstName}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
