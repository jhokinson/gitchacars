import { useState, useEffect } from 'react'
import RangeSlider from './RangeSlider'
import CustomSelect from './CustomSelect'
import SmartActionBox from './SmartActionBox'
import SidebarChat from './SidebarChat'
import { getAllMakes, getModelsByMake } from '../data/carMakesModels'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'
import './FilterSidebar.css'

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van', 'Wagon']
const FALLBACK_MAKES = [{ value: '', label: 'Any' }, ...getAllMakes()]
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
const YEAR_OPTIONS = [{ value: '', label: 'Any' }, ...YEARS.map((y) => ({ value: String(y), label: String(y) }))]
const RADIUS_OPTIONS = [
  { value: '', label: 'Nationwide' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '100', label: '100 miles' },
  { value: '250', label: '250 miles' },
  { value: '500', label: '500 miles' },
]

export default function FilterSidebar({ filters, onFilterChange, onClose }) {
  const { isAuthenticated } = useAuth()
  const [actionMode, setActionMode] = useState(null) // null | 'find-buyer' | 'post-listing'
  const [aiAvailable, setAiAvailable] = useState(true)
  const [makesList, setMakesList] = useState(FALLBACK_MAKES)
  const [modelsList, setModelsList] = useState([])
  const [priceHistogram, setPriceHistogram] = useState([])

  useEffect(() => {
    apiService.ai.status()
      .then(res => setAiAvailable(res.data.data.available))
      .catch(() => setAiAvailable(true)) // optimistic on network error
    // Fetch makes from NHTSA-backed API
    apiService.vehicles.makes()
      .then(res => {
        const data = res.data.data
        if (Array.isArray(data) && data.length > 0) {
          setMakesList([{ value: '', label: 'Any' }, ...data])
        }
      })
      .catch(() => {}) // keep fallback
    // Fetch price distribution for histogram
    apiService.wantListings.priceDistribution()
      .then(res => {
        const data = res.data.data
        if (Array.isArray(data)) setPriceHistogram(data)
      })
      .catch(() => {})
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

  // Compute active filter counts per section
  const sectionCounts = {
    make: (filters.make ? 1 : 0) + (filters.model ? 1 : 0),
    price: (filters.budgetMin > 0 || filters.budgetMax < 200000) ? 1 : 0,
    year: (filters.yearMin ? 1 : 0) + (filters.yearMax ? 1 : 0),
    mileage: filters.mileageMax ? 1 : 0,
    location: (filters.zipCode ? 1 : 0) + (filters.radius ? 1 : 0),
    type: (filters.vehicleTypes || []).length,
    transmission: filters.transmission ? 1 : 0,
    drivetrain: filters.drivetrain ? 1 : 0,
  }

  const clearSection = (section) => {
    const clears = {
      make: { make: '', model: '' },
      price: { budgetMin: 0, budgetMax: 200000 },
      year: { yearMin: '', yearMax: '' },
      mileage: { mileageMax: '' },
      location: { zipCode: '', radius: '' },
      type: { vehicleTypes: [] },
      transmission: { transmission: '' },
      drivetrain: { drivetrain: '' },
    }
    onFilterChange({ ...filters, ...clears[section] })
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

  // Fetch models from API when make changes
  useEffect(() => {
    if (!filters.make) {
      setModelsList([])
      return
    }
    // Set fallback immediately
    const fallback = getModelsByMake(filters.make)
    if (fallback.length > 0) {
      setModelsList([{ value: '', label: 'Any' }, ...fallback])
    } else {
      setModelsList([{ value: '', label: 'Any' }])
    }
    // Fetch from API
    apiService.vehicles.models(filters.make)
      .then(res => {
        const data = res.data.data
        if (Array.isArray(data) && data.length > 0) {
          setModelsList([{ value: '', label: 'Any' }, ...data])
        }
      })
      .catch(() => {}) // keep fallback
  }, [filters.make])

  const chevron = (isOpen) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )

  const sectionHeader = (key, label) => {
    const count = sectionCounts[key] || 0
    return (
      <div className={`filter-section-header${count > 0 ? ' has-active' : ''}`}>
        <button className={`filter-section-toggle${sections[key] ? ' open' : ''}`} onClick={() => toggleSection(key)}>
          <span className="filter-section-label">
            {label}
            {count > 0 && <span className="filter-count-badge">{count}</span>}
          </span>
          {chevron(sections[key])}
        </button>
      </div>
    )
  }

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
        {sectionHeader('make', 'Make / Model')}
        {sections.make && (
          <div className="filter-section-body">
            <CustomSelect
              options={makesList}
              value={filters.make || ''}
              onChange={(val) => onFilterChange({ ...filters, make: val, model: '' })}
              placeholder="Any Make"
              searchable
            />
            {filters.make && modelsList.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <CustomSelect
                  options={modelsList}
                  value={filters.model || ''}
                  onChange={(val) => update('model', val)}
                  placeholder="Any Model"
                  searchable
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        {sectionHeader('price', 'Price Range')}
        {sections.price && (
          <div className="filter-section-body">
            <RangeSlider
              min={0}
              max={200000}
              step={5000}
              valueMin={filters.budgetMin || 0}
              valueMax={filters.budgetMax || 200000}
              onChange={(vMin, vMax) => onFilterChange({ ...filters, budgetMin: vMin, budgetMax: vMax })}
              histogram={priceHistogram}
            />
          </div>
        )}
      </div>

      {/* Year Range */}
      <div className="filter-section">
        {sectionHeader('year', 'Year Range')}
        {sections.year && (
          <div className="filter-section-body">
            <div className="filter-row">
              <CustomSelect
                options={YEAR_OPTIONS}
                value={filters.yearMin || ''}
                onChange={(val) => update('yearMin', val)}
                placeholder="Min Year"
              />
              <CustomSelect
                options={YEAR_OPTIONS}
                value={filters.yearMax || ''}
                onChange={(val) => update('yearMax', val)}
                placeholder="Max Year"
              />
            </div>
          </div>
        )}
      </div>

      {/* Max Mileage */}
      <div className="filter-section">
        {sectionHeader('mileage', 'Max Mileage')}
        {sections.mileage && (
          <div className="filter-section-body">
            <CustomSelect
              options={MILEAGE_OPTIONS}
              value={filters.mileageMax || ''}
              onChange={(val) => update('mileageMax', val)}
              placeholder="No Max"
            />
          </div>
        )}
      </div>

      {/* Location */}
      <div className="filter-section">
        {sectionHeader('location', 'Location')}
        {sections.location && (
          <div className="filter-section-body">
            <input
              type="text"
              placeholder="City or ZIP"
              value={filters.zipCode || ''}
              onChange={(e) => update('zipCode', e.target.value)}
              className="filter-text-input"
            />
            <CustomSelect
              options={RADIUS_OPTIONS}
              value={filters.radius || ''}
              onChange={(val) => update('radius', val)}
              placeholder="Nationwide"
            />
          </div>
        )}
      </div>

      {/* Vehicle Type */}
      <div className="filter-section">
        {sectionHeader('type', 'Vehicle Type')}
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
        {sectionHeader('transmission', 'Transmission')}
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
        {sectionHeader('drivetrain', 'Drivetrain')}
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
