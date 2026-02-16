import { useState, useRef, useEffect, useCallback } from 'react'
import './CustomSelect.css'

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const listRef = useRef(null)
  const searchRef = useRef(null)

  const selectedOption = options.find((o) => o.value === value)
  const filtered = searchable && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opening in searchable mode
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open, searchable])

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(-1)
  }, [query])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.custom-select-option')
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIndex])

  const handleToggle = useCallback(() => {
    if (disabled) return
    if (open) {
      setOpen(false)
      setQuery('')
      setHighlightIndex(-1)
    } else {
      setOpen(true)
    }
  }, [disabled, open])

  const handleSelect = useCallback((opt) => {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
    setHighlightIndex(-1)
  }, [onChange])

  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        return
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && filtered[highlightIndex]) {
          handleSelect(filtered[highlightIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setQuery('')
        setHighlightIndex(-1)
        break
      default:
        break
    }
  }, [open, filtered, highlightIndex, handleSelect])

  return (
    <div
      className={`custom-select${disabled ? ' disabled' : ''}${open ? ' open' : ''} ${className}`}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`custom-select-value${!selectedOption ? ' placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="custom-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="custom-select-dropdown" role="listbox">
          {searchable && (
            <div className="custom-select-search">
              <input
                ref={searchRef}
                type="text"
                className="custom-select-search-input"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="custom-select-options" ref={listRef}>
            {filtered.length === 0 ? (
              <div className="custom-select-empty">No results</div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={opt.value}
                  className={`custom-select-option${opt.value === value ? ' selected' : ''}${i === highlightIndex ? ' highlighted' : ''}`}
                  onClick={() => handleSelect(opt)}
                  role="option"
                  aria-selected={opt.value === value}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <svg className="custom-select-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
