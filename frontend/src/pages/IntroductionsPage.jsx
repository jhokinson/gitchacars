import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import IntroCard from '../components/IntroCard'
import './pages.css'

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected', 'Expired']

export default function IntroductionsPage() {
  const { isRole } = useAuth()
  const [intros, setIntros] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const isBuyer = isRole('buyer')

  useEffect(() => {
    const fetch = isBuyer
      ? apiService.introductions.getReceived()
      : apiService.introductions.getSent()
    fetch
      .then((res) => setIntros(res.data.data))
      .finally(() => setLoading(false))
  }, [isBuyer])

  const handleAccept = async (id) => {
    await apiService.introductions.accept(id)
    setIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'accepted' } : i)))
  }

  const handleReject = async (id) => {
    await apiService.introductions.reject(id)
    setIntros((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)))
  }

  const filtered = filter === 'All' ? intros : intros.filter((i) => i.status === filter.toLowerCase())

  if (loading) return <div className="intros-page"><div className="spinner" style={{ margin: '40px auto' }} /></div>

  return (
    <div className="intros-page">
      <h1>{isBuyer ? 'Received' : 'Sent'} Introductions</h1>
      <div className="filter-pills">
        {FILTERS.map((f) => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="dashboard-empty">No {filter === 'All' ? '' : filter.toLowerCase() + ' '}introductions found.</div>
      ) : (
        <div className="intros-list">
          {filtered.map((intro) => (
            <IntroCard
              key={intro.id}
              intro={intro}
              onAccept={handleAccept}
              onReject={handleReject}
              showActions={isBuyer}
            />
          ))}
        </div>
      )}
    </div>
  )
}
