import { useState, useRef, useEffect } from 'react'
import './SortDropdown.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'budget_asc', label: 'Budget: Low to High' },
  { value: 'budget_desc', label: 'Budget: High to Low' },
]

export default function SortDropdown({ value = 'newest', onSort }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || 'Newest'

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="sort-dropdown" ref={ref}>
      <button className="sort-dropdown-btn" onClick={() => setOpen(!open)}>
        <span className="sort-dropdown-label">Sort By:</span>
        <span className="sort-dropdown-value">{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="sort-dropdown-menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`sort-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => { onSort(opt.value); setOpen(false); }}
            >
              {opt.label}
              {value === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
