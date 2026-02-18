import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import apiService from '../services/apiService'
import ListingCard from '../components/ListingCard'
import './pages.css'

export default function VehicleMatchesPage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [introduced, setIntroduced] = useState(new Set())

  useEffect(() => {
    Promise.all([
      apiService.vehicles.get(id).catch(() => null),
      apiService.vehicles.getMatches(id),
    ]).then(([vRes, mRes]) => {
      if (vRes) setVehicle(vRes.data.data)
      setMatches(mRes.data.data.listings)
    }).finally(() => setLoading(false))
  }, [id])

  const openModal = (listing) => {
    setSelectedListing(listing)
    setMessage('')
    setModalOpen(true)
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await apiService.introductions.create({
        vehicleId: id,
        wantListingId: selectedListing.id,
        message,
      })
      setIntroduced((prev) => new Set([...prev, selectedListing.id]))
      setModalOpen(false)
    } catch {
      alert('Failed to send introduction')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="matches-page"><div className="spinner" style={{ margin: '40px auto' }} /></div>

  return (
    <div className="matches-page">
      {vehicle && (
        <div className="matches-vehicle-header">
          {vehicle.images?.[0] && (
            <img src={vehicle.images[0]} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          )}
          <div className="matches-vehicle-info">
            <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
            <p>${vehicle.price?.toLocaleString()} &middot; {vehicle.mileage?.toLocaleString()} mi</p>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
        Matching Want-Listings
      </h1>

      {matches.length === 0 ? (
        <div className="dashboard-empty">No matching buyers found for this vehicle yet. Check back as new Want-Listings are posted.</div>
      ) : (
        <div className="matches-list">
          {matches.map((listing) => (
            <div key={listing.id} className="match-item">
              <div style={{ flex: 1 }}>
                <ListingCard listing={listing} />
              </div>
              {introduced.has(listing.id) ? (
                <button className="btn btn-secondary btn-sm" disabled>Already Introduced</button>
              ) : (
                <button className="btn btn-accent btn-sm" onClick={() => openModal(listing)}>
                  Introduce from Inventory
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Introduce Your Vehicle to This Buyer</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
              Write a message to the buyer about your vehicle (max 500 characters)
            </p>
            <textarea
              className="modal-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Write a personal note to the buyer about your vehicle..."
            />
            <p className="modal-char-count">{message.length}/500</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSend} disabled={sending || !message.trim()}>
                {sending ? 'Sending...' : 'Send Introduction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
