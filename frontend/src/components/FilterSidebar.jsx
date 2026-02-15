import { useState, useEffect } from 'react'
import RangeSlider from './RangeSlider'
import SmartActionBox from './SmartActionBox'
import SidebarChat from './SidebarChat'
import { getAllMakes, getModelsByMake } from '../data/carMakesModels'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import './FilterSidebar.css'

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van', 'Wagon']
const MAKES = [{ value: '', label: 'Any' }, ...getAllMakes()]
const MILEAGE_OPTIONS = [
  { value: '', label: 'No Max' },
  { value: '50000', label: '50,000 mi' },
  { value: '75000', label: '75,000 mi' },
  { value: '100000', label: '100,000 mi' },
  { value: '150000', label: '150,000 mi' },
  { value: '200000', label: '200,000 mi' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear + 1 - i)

export default function FilterSidebar({ filters, onFilterChange, onClose }) {
  const { isAuthenticated } = useAuth()
  const [actionMode, setActionMode] = useState(null) // null | 'find-buyer' | 'post-listing'
  const [aiAvailable, setAiAvailable] = useState(true)

  useEffect(() => {
    apiService.ai.status()
      .then(res => setAiAvailable(res.data.data.available))
      .catch(() => setAiAvailable(true)) // optimistic on network error
  }, [])

  const handleSelectAction = (action) => {
    if (!isAuthenticated) {
      const redirect = action === 'post-listing' ? '/create-listing' : '/'
      window.location.href = `/auth?mode=login&redirect=${redirect}`
      return
    }
    setActionMode(action)
  }

  const handleFiltersExtracted = (filterData) => {
    const updates = { ...filters }
    if (filterData.make) updates.make = filterData.make
    if (filterData.model) updates.model = filterData.model
    if (filterData.yearMin) updates.yearMin = String(filterData.yearMin)
    if (filterData.yearMax) updates.yearMax = String(filterData.yearMax)
    if (filterData.vehicleType) {
      const current = filters.vehicleTypes || []
      if (!current.includes(filterData.vehicleType)) {
        updates.vehicleTypes = [...current, filterData.vehicleType]
      }
    }
    if (filterData.mileageMax) updates.mileageMax = String(filterData.mileageMax)
    if (filterData.transmission) updates.transmission = filterData.transmission
    if (filterData.drivetrain) updates.drivetrain = filterData.drivetrain
    onFilterChange(updates)

    // Open relevant sections
    setSections((prev) => ({
      ...prev,
      make: true,
      type: filterData.vehicleType ? true : prev.type,
      year: filterData.yearMin ? true : prev.year,
      mileage: filterData.mileageMax ? true : prev.mileage,
      transmission: filterData.transmission ? true : prev.transmission,
      drivetrain: filterData.drivetrain ? true : prev.drivetrain,
    }))
  }

  const handleClearMode = () => {
    setActionMode(null)
  }

  const [sections, setSections] = useState({
    make: true,
    price: true,
    location: true,
    year: false,
    mileage: false,
    type: false,
    transmission: false,
    drivetrain: false,
  })

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const update = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handleClearAll = () => {
    onFilterChange({
      zipCode: '',
      radius: '',
      vehicleTypes: [],
      make: '',
      model: '',
      budgetMin: 0,
      budgetMax: 200000,
      yearMin: '',
      yearMax: '',
      mileageMax: '',
      transmission: '',
      drivetrain: '',
    })
  }

  // Compute models list when make is selected
  const MODELS = filters.make
    ? [{ value: '', label: 'Any' }, ...getModelsByMake(filters.make)]
    : []

  const chevron = (isOpen) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <h3>Filters</h3>
        <button className="filter-clear-btn" onClick={handleClearAll}>Clear All</button>
        {onClose && (
          <button className="btn-icon filter-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Smart Action Box */}
      <SmartActionBox
        onSelectAction={handleSelectAction}
        activeMode={actionMode}
        onClearMode={handleClearMode}
        aiAvailable={aiAvailable}
      />

      {/* Sidebar Chat (when action is selected) */}
      {actionMode && (
        <SidebarChat
          mode={actionMode}
          onFiltersExtracted={handleFiltersExtracted}
          onClose={handleClearMode}
        />
      )}

      {/* Make / Model */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.make ? ' open' : ''}`} onClick={() => toggleSection('make')}>
          <span>Make / Model</span>
          {chevron(sections.make)}
        </button>
        {sections.make && (
          <div className="filter-section-body">
            <select
              value={filters.make || ''}
              onChange={(e) => onFilterChange({ ...filters, make: e.target.value, model: '' })}
              className="filter-select"
            >
              {MAKES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {filters.make && (
              <select
                value={filters.model || ''}
                onChange={(e) => update('model', e.target.value)}
                className="filter-select"
                style={{ marginTop: 'var(--space-2)' }}
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.price ? ' open' : ''}`} onClick={() => toggleSection('price')}>
          <span>Price Range</span>
          {chevron(sections.price)}
        </button>
        {sections.price && (
          <div className="filter-section-body">
            <RangeSlider
              min={0}
              max={200000}
              step={5000}
              valueMin={filters.budgetMin || 0}
              valueMax={filters.budgetMax || 200000}
              onChange={(vMin, vMax) => onFilterChange({ ...filters, budgetMin: vMin, budgetMax: vMax })}
            />
          </div>
        )}
      </div>

      {/* Year Range */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.year ? ' open' : ''}`} onClick={() => toggleSection('year')}>
          <span>Year Range</span>
          {chevron(sections.year)}
        </button>
        {sections.year && (
          <div className="filter-section-body">
            <div className="filter-row">
              <select
                value={filters.yearMin || ''}
                onChange={(e) => update('yearMin', e.target.value)}
                className="filter-select"
              >
                <option value="">Min Year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={filters.yearMax || ''}
                onChange={(e) => update('yearMax', e.target.value)}
                className="filter-select"
              >
                <option value="">Max Year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Max Mileage */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.mileage ? ' open' : ''}`} onClick={() => toggleSection('mileage')}>
          <span>Max Mileage</span>
          {chevron(sections.mileage)}
        </button>
        {sections.mileage && (
          <div className="filter-section-body">
            <select
              value={filters.mileageMax || ''}
              onChange={(e) => update('mileageMax', e.target.value)}
              className="filter-select"
            >
              {MILEAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.location ? ' open' : ''}`} onClick={() => toggleSection('location')}>
          <span>Location</span>
          {chevron(sections.location)}
        </button>
        {sections.location && (
          <div className="filter-section-body">
            <div className="filter-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input
                type="text"
                placeholder="Zip code"
                value={filters.zipCode || ''}
                onChange={(e) => update('zipCode', e.target.value)}
                maxLength={5}
              />
            </div>
            <select
              value={filters.radius || ''}
              onChange={(e) => update('radius', e.target.value)}
              className="filter-select"
            >
              <option value="">Nationwide</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
              <option value="250">250 miles</option>
              <option value="500">500 miles</option>
            </select>
          </div>
        )}
      </div>

      {/* Vehicle Type */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.type ? ' open' : ''}`} onClick={() => toggleSection('type')}>
          <span>Vehicle Type</span>
          {chevron(sections.type)}
        </button>
        {sections.type && (
          <div className="filter-section-body">
            {VEHICLE_TYPES.map((type) => (
              <label key={type} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(filters.vehicleTypes || []).includes(type)}
                  onChange={(e) => {
                    const current = filters.vehicleTypes || []
                    update('vehicleTypes', e.target.checked
                      ? [...current, type]
                      : current.filter((t) => t !== type)
                    )
                  }}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Transmission */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.transmission ? ' open' : ''}`} onClick={() => toggleSection('transmission')}>
          <span>Transmission</span>
          {chevron(sections.transmission)}
        </button>
        {sections.transmission && (
          <div className="filter-section-body">
            {['', 'automatic', 'manual'].map((val) => (
              <label key={val || 'any'} className="filter-radio">
                <input
                  type="radio"
                  name="transmission"
                  checked={filters.transmission === val}
                  onChange={() => update('transmission', val)}
                />
                <span>{val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Any'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Drivetrain */}
      <div className="filter-section">
        <button className={`filter-section-toggle${sections.drivetrain ? ' open' : ''}`} onClick={() => toggleSection('drivetrain')}>
          <span>Drivetrain</span>
          {chevron(sections.drivetrain)}
        </button>
        {sections.drivetrain && (
          <div className="filter-section-body">
            {['', 'fwd', 'rwd', 'awd', '4wd'].map((val) => (
              <label key={val || 'any'} className="filter-radio">
                <input
                  type="radio"
                  name="drivetrain"
                  checked={filters.drivetrain === val}
                  onChange={() => update('drivetrain', val)}
                />
                <span>{val ? val.toUpperCase() : 'Any'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {onClose && (
        <div className="filter-sidebar-footer">
          <button className="btn btn-primary btn-full" onClick={onClose}>Apply Filters</button>
        </div>
      )}
    </aside>
  )
}
