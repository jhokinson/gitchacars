import { useState, useRef, useEffect } from 'react'
import './SearchableSelect.css'

export default function SearchableSelect({ options = [], value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const selectedLabel = options.find((o) => o.value === value)?.label || ''

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFocus = () => {
    if (!disabled) {
      setOpen(true)
      setQuery('')
    }
  }

  const handleSelect = (opt) => {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      handleSelect(filtered[0])
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className={`searchable-select${disabled ? ' disabled' : ''}`} ref={wrapperRef}>
      <div className="searchable-select-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="searchable-select-input"
          value={open ? query : selectedLabel}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <svg className="searchable-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div className="searchable-select-dropdown">
          {filtered.length === 0 ? (
            <div className="searchable-select-empty">No results</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                className={`searchable-select-option${opt.value === value ? ' selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
