import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import './pages.css'
import './MessagesPage.css'

export default function MessagesPage() {
  const { user, isRole } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const isBuyer = isRole('buyer')
        const res = isBuyer
          ? await apiService.introductions.getReceived()
          : await apiService.introductions.getSent()
        const accepted = res.data.data.filter((i) => i.status === 'accepted')
        setConversations(accepted)
      } catch (err) {
        console.error('Failed to load conversations', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  if (loading) return <div className="messages-page"><div className="spinner" style={{ margin: '40px auto' }} /></div>

  return (
    <div className="messages-page">
      <h1>Messages</h1>
      {conversations.length === 0 ? (
        <div className="dashboard-empty">No active conversations. Accept an introduction to start messaging.</div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv) => {
            const otherName = isRole('buyer') ? conv.sellerName : conv.buyerName
            const vehicle = conv.vehicle
            return (
              <Link to={`/messages/${conv.id}`} key={conv.id} className="conversation-row">
                {vehicle?.images?.[0] ? (
                  <img src={vehicle.images[0]} alt="" className="conversation-thumb" />
                ) : (
                  <div className="conversation-thumb-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
                      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9m-6-6h15m-6-5v5"/>
                    </svg>
                  </div>
                )}
                <div className="conversation-info">
                  <strong>{otherName}</strong>
                  <span className="conversation-vehicle">
                    {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                  </span>
                </div>
                <svg className="conversation-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
