import { useState } from 'react'
import GlowingShadow from './GlowingShadow'
import './SmartActionBox.css'

export default function SmartActionBox({ onSelectAction, activeMode, onClearMode, aiAvailable }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (activeMode) {
    return (
      <div className="smart-action-box">
        <div className="smart-action-active">
          <span>
            {activeMode === 'find-buyer' ? 'Finding Buyers...' : 'Creating Listing...'}
          </span>
          <button className="smart-action-active-close" onClick={onClearMode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const handleSelect = (action) => {
    if (!aiAvailable) return
    setDropdownOpen(false)
    onSelectAction(action)
  }

  return (
    <div className="smart-action-box">
      <GlowingShadow>
        <button
          className={`smart-action-prompt${dropdownOpen ? ' open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span>What would you like to do?</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </GlowingShadow>

      <div className={`smart-action-dropdown${dropdownOpen ? ' open' : ''}`}>
        {!aiAvailable && (
          <div className="smart-action-unavailable-msg">
            AI features are currently unavailable.
          </div>
        )}
        <div className="smart-action-cards">
          <button
            className={`smart-action-card${!aiAvailable ? ' smart-action-card--disabled' : ''}`}
            onClick={() => handleSelect('find-buyer')}
            disabled={!aiAvailable}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Find a Buyer</span>
          </button>
          <button
            className={`smart-action-card${!aiAvailable ? ' smart-action-card--disabled' : ''}`}
            onClick={() => handleSelect('post-listing')}
            disabled={!aiAvailable}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Post a Want-Listing</span>
          </button>
        </div>
      </div>
    </div>
  )
}
