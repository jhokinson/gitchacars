import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/apiService'
import VehicleCard from '../components/VehicleCard'
import IntroCard from '../components/IntroCard'
import Skeleton from '../components/Skeleton'
import LottieAnimation from '../components/LottieAnimation'
import useScrollReveal from '../hooks/useScrollReveal'
import emptySearchAnim from '../assets/lottie/empty-search.json'
import emptyGarageAnim from '../assets/lottie/empty-garage.json'
import './pages.css'

const INTRO_FILTERS = ['All', 'Pending', 'Accepted', 'Rejected']

export default function DashboardPage() {
  const [listings, setListings] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [receivedIntros, setReceivedIntros] = useState([])
  const [sentIntros, setSentIntros] = useState([])
  const [loading, setLoading] = useState(true)
  const [introFilter, setIntroFilter] = useState('All')
  const dashRef = useRef(null)
  useScrollReveal(dashRef)

  useEffect(() => {
    Promise.all([
      apiService.wantListings.getMine(),
      apiService.vehicles.getMine(),
      apiService.introductions.getReceived(),
      apiService.introductions.getSent(),
    ])
      .then(([listRes, vehRes, recvRes, sentRes]) => {
        setListings(listRes.data.data)
        setVehicles(vehRes.data.data)
        setReceivedIntros(recvRes.data.data)
        setSentIntros(sentRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAccept = async (id) => {
    await apiService.introductions.accept(id)
    setReceivedIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'accepted' } : i)))
  }

  const handleReject = async (id) => {
    await apiService.introductions.reject(id)
    setReceivedIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)))
  }

  const filteredIntros = introFilter === 'All'
    ? receivedIntros
    : receivedIntros.filter((i) => i.status === introFilter.toLowerCase())

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header"><h1>Dashboard</h1></div>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  return (
    <div className="dashboard-page" ref={dashRef}>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      {/* My Want Listings */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Want Listings ({listings.length})</h2>
          <Link to="/create-listing" className="btn btn-primary btn-sm">+ Create Want Listing</Link>
        </div>
        {listings.length === 0 ? (
          <div className="dashboard-empty">
            <LottieAnimation animationData={emptySearchAnim} size={120} />
            <p>You haven't posted any want listings yet.</p>
            <Link to="/create-listing" className="btn btn-accent btn-sm" style={{ marginTop: 'var(--space-3)', display: 'inline-flex' }}>Create Your First Listing</Link>
          </div>
        ) : (
          listings.map((l) => (
            <div key={l.id} className="dash-listing-row">
              <div className="dash-listing-info">
                <Link to={`/want-listings/${l.id}`} className="dash-listing-title">
                  {l.title}
                </Link>
                <span className="dash-listing-meta">
                  {l.make} {l.model} &middot; {l.yearMin}–{l.yearMax}
                </span>
                <span className={`badge badge-${l.status}`}>{l.status}</span>
                {l.introCount !== undefined && (
                  <span className="dash-listing-meta">{l.introCount} intro{l.introCount !== 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="dash-listing-actions">
                <Link to={`/edit-listing/${l.id}`} className="btn btn-secondary btn-sm">Edit</Link>
              </div>
            </div>
          ))
        )}
      </section>

      {/* My Private Inventory */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Private Inventory ({vehicles.length})</h2>
          <Link to="/add-vehicle" className="btn btn-primary btn-sm">+ Add to Inventory</Link>
        </div>
        {vehicles.length === 0 ? (
          <div className="dashboard-empty">
            <LottieAnimation animationData={emptyGarageAnim} size={120} />
            <p>Your private inventory is empty. Add vehicles that only you can see — then introduce them to interested buyers.</p>
            <Link to="/add-vehicle" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-3)', display: 'inline-flex' }}>Add Your First Vehicle to Inventory</Link>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <div key={v.id} className="scroll-reveal">
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Received Introductions */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Received Introductions</h2>
        </div>
        <div className="filter-pills">
          {INTRO_FILTERS.map((f) => (
            <button key={f} className={`filter-pill ${introFilter === f ? 'active' : ''}`} onClick={() => setIntroFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        {filteredIntros.length === 0 ? (
          <div className="dashboard-empty">
            <p>No {introFilter === 'All' ? '' : introFilter.toLowerCase() + ' '}introductions yet. When sellers introduce their vehicles to your listings, they'll appear here.</p>
          </div>
        ) : (
          <div className="intros-list">
            {filteredIntros.map((intro) => (
              <IntroCard key={intro.id} intro={intro} onAccept={handleAccept} onReject={handleReject} showActions />
            ))}
          </div>
        )}
      </section>

      {/* Sent Introductions */}
      {sentIntros.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Sent Introductions</h2>
          </div>
          <div className="intros-list">
            {sentIntros.map((intro) => (
              <IntroCard key={intro.id} intro={intro} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
