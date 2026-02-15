import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import { initFirebase } from '../services/firebaseService'
import './ChatPage.css'

export default function ChatPage() {
  const { introductionId } = useParams()
  const { user } = useAuth()
  const [introduction, setIntroduction] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const messagesEndRef = useRef(null)
  const unsubRef = useRef(null)

  useEffect(() => {
    // Load introduction details
    const loadIntro = async () => {
      try {
        const [recvRes, sentRes] = await Promise.all([
          apiService.introductions.getReceived(),
          apiService.introductions.getSent(),
        ])
        const all = [...(recvRes.data.data || []), ...(sentRes.data.data || [])]
        const found = all.find((i) => String(i.id) === String(introductionId))
        setIntroduction(found || null)
      } catch {
        // Failed to load
      } finally {
        setLoading(false)
      }
    }
    loadIntro()
  }, [introductionId])

  useEffect(() => {
    // Try to initialize Firebase for real-time messaging
    const setupFirebase = async () => {
      try {
        const firebase = await initFirebase()
        if (!firebase || !firebase.db) return

        const { db } = firebase
        const { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } = await import('firebase/firestore')

        const chatRef = collection(db, 'chats', String(introductionId), 'messages')
        const q = query(chatRef, orderBy('createdAt', 'asc'))

        unsubRef.current = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setMessages(msgs)
          setFirebaseReady(true)
        })
      } catch {
        // Firebase not available, use static mode
        setFirebaseReady(false)
      }
    }
    setupFirebase()

    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [introductionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)

    try {
      if (firebaseReady) {
        const firebase = await initFirebase()
        const { db } = firebase
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

        const chatRef = collection(db, 'chats', String(introductionId), 'messages')
        await addDoc(chatRef, {
          text: newMessage.trim(),
          senderId: user.id,
          senderName: user.firstName,
          createdAt: serverTimestamp(),
        })
      } else {
        // Fallback: just add to local state
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: newMessage.trim(),
            senderId: user.id,
            senderName: user.firstName,
            createdAt: { seconds: Date.now() / 1000 },
          },
        ])
      }
      setNewMessage('')
    } catch {
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) return <div className="chat-page"><div className="spinner" style={{ margin: '40px auto' }} /></div>

  if (!introduction) {
    return (
      <div className="chat-page">
        <div className="dashboard-empty">
          <p>Conversation not found.</p>
          <Link to="/messages" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Back to Messages</Link>
        </div>
      </div>
    )
  }

  const vehicle = introduction.vehicle
  const otherName = String(introduction.sellerId) === String(user.id)
    ? introduction.buyerName
    : introduction.sellerName

  return (
    <div className="chat-page">
      <div className="chat-header">
        <Link to="/messages" className="chat-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="chat-header-info">
          <strong>{otherName}</strong>
          {vehicle && (
            <span className="chat-header-vehicle">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {!firebaseReady && messages.length === 0 && (
          <div className="chat-welcome">
            <p>Start the conversation! Discuss the vehicle details, arrange a viewing, or negotiate.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = String(msg.senderId) === String(user.id)
          return (
            <div key={msg.id} className={`chat-bubble ${isMe ? 'sent' : 'received'}`}>
              {!isMe && <span className="chat-bubble-name">{msg.senderName}</span>}
              <p>{msg.text}</p>
              {msg.createdAt && (
                <span className="chat-bubble-time">
                  {new Date((msg.createdAt.seconds || msg.createdAt._seconds || 0) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button onClick={handleSend} disabled={sending || !newMessage.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
