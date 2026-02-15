import { useState, useEffect, useRef } from 'react'
import apiService from '../services/apiService'
import './AIChatBox.css'

const GREETING_MESSAGE = "Hey! I'm here to help you create the perfect want listing. Tell me about your dream car — here are some things to include:\n\n• **Type:** Classic car, luxury/high-end, family SUV, daily driver, truck, etc.\n• **Make & Model:** Honda CR-V, Ford Mustang, Tesla Model 3, etc.\n• **Year Range:** 2020–2024, pre-1970 for classics, etc.\n• **Budget:** Your ideal price range\n• **Must-Haves:** Color, features, mileage, condition\n\nThe more specific you are, the better sellers can match you!"

function renderMarkdown(text) {
  // Simple inline markdown: **bold** → <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function AIChatBox({ onListingData, onSwitchToManual }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: GREETING_MESSAGE }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendToAI = async (msgs) => {
    setLoading(true)
    try {
      const res = await apiService.ai.chat(msgs)
      const reply = res.data.data.reply

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setApiError(false)

      // Check for JSON data in the response
      const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/)
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1].trim())
          onListingData?.(data)
        } catch {
          // JSON parse failed, ignore
        }
      }
    } catch (err) {
      setApiError(true)
      const status = err.response?.status
      const serverMsg = err.response?.data?.error?.message
      let errorContent
      if (status === 402 || status === 401) {
        errorContent = serverMsg || 'AI features are currently unavailable. Please use the manual form to create your listing.'
      } else if (status === 429) {
        errorContent = serverMsg || 'Too many requests. Please wait a moment and try again.'
      } else if (!err.response) {
        errorContent = 'Unable to connect. Check your connection and try again.'
      } else {
        errorContent = serverMsg || 'AI assistant is temporarily unavailable. Please use the manual form.'
      }
      setMessages(prev => [...prev, {
        role: 'error',
        content: errorContent
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages.filter(m => m.role !== 'error'), userMsg]
    setMessages(newMessages)
    setInput('')

    // Build conversation history for the API (only user and assistant messages)
    const apiMessages = newMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    sendToAI(apiMessages)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
            {msg.role === 'error' && onSwitchToManual && (
              <button className="ai-chat-switch-btn" onClick={onSwitchToManual}>
                Switch to Manual Form
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-chat-typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your ideal vehicle purchase..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
