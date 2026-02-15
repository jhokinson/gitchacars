import { useState } from 'react'
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
      <button
        className={`smart-action-prompt${dropdownOpen ? ' open' : ''}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>What would you like to do?</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`smart-action-dropdown${dropdownOpen ? ' open' : ''}`}>
        {!aiAvailable && (
          <div className="smart-action-unavailable-msg">
            AI features are currently unavailable.
          </div>
        )}
        <button
          className={`smart-action-option${!aiAvailable ? ' smart-action-option--disabled' : ''}`}
          onClick={() => handleSelect('find-buyer')}
          disabled={!aiAvailable}
        >
          <span className="smart-action-option-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <div className="smart-action-option-text">
            <span className="smart-action-option-title">Find a Buyer</span>
            <span className="smart-action-option-subtitle">Describe your vehicle to find matching buyers</span>
          </div>
        </button>
        <button
          className={`smart-action-option${!aiAvailable ? ' smart-action-option--disabled' : ''}`}
          onClick={() => handleSelect('post-listing')}
          disabled={!aiAvailable}
        >
          <span className="smart-action-option-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <div className="smart-action-option-text">
            <span className="smart-action-option-title">Post a Want Listing</span>
            <span className="smart-action-option-subtitle">Tell us what car you want to buy</span>
          </div>
        </button>
      </div>
    </div>
  )
}
