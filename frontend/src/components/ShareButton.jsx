import { useState } from 'react'
import './ShareButton.css'

export default function ShareButton({ listingId }) {
  const [copied, setCopied] = useState(false)

  const handleClick = async (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/want-listings/${listingId}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GitchaCars Listing', url })
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button className="share-btn" onClick={handleClick} title="Share listing">
      {copied ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
      {copied && <span className="share-tooltip">Link copied!</span>}
    </button>
  )
}
