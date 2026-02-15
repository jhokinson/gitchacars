import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'
import './NotificationBell.css'

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loaded, setLoaded] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCount = () => {
      apiService.notifications.getUnreadCount()
        .then((res) => setCount(res.data.data.count))
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleToggle = async () => {
    if (!open && !loaded) {
      try {
        const res = await apiService.notifications.getAll()
        setNotifications(res.data.data)
        setLoaded(true)
      } catch {}
    }
    setOpen(!open)
  }

  const handleMarkAllRead = async () => {
    await apiService.notifications.markAllRead()
    setCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleClick = (notif) => {
    if (!notif.read) {
      apiService.notifications.markRead(notif.id)
      setCount((c) => Math.max(0, c - 1))
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    }
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div className="notif-bell" ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={handleToggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && <span className="notif-badge">{count}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <strong>Notifications</strong>
            {count > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 && (
            <p className="notif-empty">No notifications</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
              onClick={() => handleClick(n)}
            >
              <p>{n.message}</p>
              <span className="notif-time">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
