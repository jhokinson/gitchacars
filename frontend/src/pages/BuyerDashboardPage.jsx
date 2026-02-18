import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiService from '../services/apiService'
import IntroCard from '../components/IntroCard'
import Skeleton from '../components/Skeleton'
import './pages.css'

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected']

export default function BuyerDashboardPage() {
  const [listings, setListings] = useState([])
  const [intros, setIntros] = useState([])
  const [loading, setLoading] = useState(true)
  const [introFilter, setIntroFilter] = useState('All')

  useEffect(() => {
    Promise.all([
      apiService.wantListings.getMine(),
      apiService.introductions.getReceived(),
    ])
      .then(([listRes, introRes]) => {
        setListings(listRes.data.data)
        setIntros(introRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAccept = async (id) => {
    await apiService.introductions.accept(id)
    setIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'accepted' } : i)))
  }

  const handleReject = async (id) => {
    await apiService.introductions.reject(id)
    setIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)))
  }

  const filteredIntros = introFilter === 'All'
    ? intros
    : intros.filter((i) => i.status === introFilter.toLowerCase())

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header"><h1>Buyer Dashboard</h1></div>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Buyer Dashboard</h1>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Want-Listings</h2>
          <Link to="/buyer/create-listing" className="btn btn-primary btn-sm">+ New Listing</Link>
        </div>
        {listings.length === 0 ? (
          <div className="dashboard-empty">No want listings yet. Create one to start receiving vehicle introductions.</div>
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
                <Link to={`/buyer/edit-listing/${l.id}`} className="btn btn-secondary btn-sm">Edit</Link>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Introductions</h2>
        </div>
        <div className="filter-pills">
          {FILTERS.map((f) => (
            <button key={f} className={`filter-pill ${introFilter === f ? 'active' : ''}`} onClick={() => setIntroFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        {filteredIntros.length === 0 ? (
          <div className="dashboard-empty">No {introFilter === 'All' ? '' : introFilter.toLowerCase() + ' '}introductions yet.</div>
        ) : (
          <div className="intros-list">
            {filteredIntros.map((intro) => (
              <IntroCard key={intro.id} intro={intro} onAccept={handleAccept} onReject={handleReject} showActions />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
