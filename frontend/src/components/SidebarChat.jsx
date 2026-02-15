import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'
import './SidebarChat.css'

export default function SidebarChat({ mode, onFiltersExtracted, onClose }) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const greeting = mode === 'find-buyer'
      ? 'Describe the vehicle you want to sell and I\'ll help you find matching buyers.'
      : 'Tell me about the car you\'re looking for and I\'ll help you create a want listing.'
    setMessages([{ role: 'assistant', content: greeting }])
  }, [mode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      if (mode === 'find-buyer') {
        // Extract filters from user message for the feed
        const res = await apiService.ai.extractFilters(input.trim())
        const filterData = res.data.data
        if (filterData && typeof filterData === 'object') {
          onFiltersExtracted?.(filterData)
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'I\'ve updated the filters based on your description. Check the listings feed for matching buyers!'
          }])
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Could you tell me more about the vehicle? For example: make, model, year, and price.'
          }])
        }
      } else {
        // Post listing mode — redirect to create listing page
        navigate('/create-listing')
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="sidebar-chat">
      <div className="sidebar-chat-header">
        <span className="sidebar-chat-title">
          {mode === 'find-buyer' ? 'Find Buyers' : 'Create Listing'}
        </span>
        <button className="sidebar-chat-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="sidebar-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`sidebar-chat-bubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="sidebar-chat-typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sidebar-chat-input">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'find-buyer' ? 'Describe your vehicle...' : 'Describe what you want...'}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
