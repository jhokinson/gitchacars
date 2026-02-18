import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import apiService from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import ListingCard from '../components/ListingCard'
import FilterSidebar from '../components/FilterSidebar'
import SortDropdown from '../components/SortDropdown'
import Skeleton from '../components/Skeleton'
import ErrorBoundary from '../components/ErrorBoundary'
import useScrollReveal from '../hooks/useScrollReveal'
import './HomePage.css'

const INITIAL_FILTERS = {
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
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [listings, setListings] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const debounceRef = useRef(null)
  const feedRef = useRef(null)
  useScrollReveal(feedRef)

  // Guidance banner dismiss state
  const [dismissedUnauth] = useState(() => localStorage.getItem('gitcha_dismiss_guide_unauth') === 'true')
  const [dismissedBuyer] = useState(() => localStorage.getItem('gitcha_dismiss_guide_buyer') === 'true')
  const [dismissedSeller] = useState(() => localStorage.getItem('gitcha_dismiss_guide_seller') === 'true')
  const [guideDismissed, setGuideDismissed] = useState({
    unauth: dismissedUnauth,
    buyer: dismissedBuyer,
    seller: dismissedSeller,
  })

  const dismissGuide = (key) => {
    localStorage.setItem(`gitcha_dismiss_guide_${key}`, 'true')
    setGuideDismissed(prev => ({ ...prev, [key]: true }))
  }

  const fetchListings = useCallback(async (pageNum, currentFilters, currentSort) => {
    setLoading(true)
    try {
      const params = { page: pageNum, limit: 10, sort: currentSort }
      if (currentFilters.make) params.make = currentFilters.make
      if (currentFilters.model) params.model = currentFilters.model
      if (currentFilters.yearMin) params.yearMin = currentFilters.yearMin
      if (currentFilters.yearMax) params.yearMax = currentFilters.yearMax
      if (currentFilters.budgetMin > 0) params.budgetMin = currentFilters.budgetMin
      if (currentFilters.budgetMax < 200000) params.budgetMax = currentFilters.budgetMax
      if (currentFilters.mileageMax) params.mileageMax = currentFilters.mileageMax
      if (currentFilters.transmission) params.transmission = currentFilters.transmission
      if (currentFilters.drivetrain) params.drivetrain = currentFilters.drivetrain
      if (currentFilters.vehicleTypes && currentFilters.vehicleTypes.length > 0) params.vehicleTypes = currentFilters.vehicleTypes.join(',')
      if (currentFilters.zipCode) params.zipCode = currentFilters.zipCode
      if (currentFilters.radius) params.radius = currentFilters.radius

      const res = await apiService.wantListings.list(params)
      if (pageNum === 1) {
        setListings(res.data.data.listings)
      } else {
        setListings((prev) => [...prev, ...res.data.data.listings])
      }
      setTotal(res.data.data.total)
      setError(false)
    } catch (err) {
      console.error('Failed to load listings', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    fetchListings(1, filters, sort)
  }, [sort])

  // Debounce filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchListings(1, newFilters, sort)
    }, 500)
  }

  const handleSortChange = (newSort) => {
    setSort(newSort)
    setSearchParams({ sort: newSort })
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchListings(next, filters, sort)
  }

  // Determine which guidance banner to show
  const userRole = user?.role
  const showUnauthBanner = !isAuthenticated && !guideDismissed.unauth
  const showBuyerBanner = isAuthenticated && userRole === 'buyer' && !guideDismissed.buyer && !loading && listings.length === 0
  const showSellerBanner = isAuthenticated && userRole === 'seller' && !guideDismissed.seller

  return (
    <div className="home-page">
      {/* Mobile filter toggle */}
      <button className="mobile-filter-toggle" onClick={() => setMobileFiltersOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Filters
      </button>

      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="home-sidebar-desktop">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Main content */}
      <div className="home-content">
        <div className="home-content-header">
          <div>
            <h1 className="home-content-title">Real Time Buyers</h1>
            <p className="home-content-count">
              {!loading && `Showing ${listings.length} of ${total} listings`}
            </p>
          </div>
          <SortDropdown value={sort} onSort={handleSortChange} />
        </div>

        {/* Guidance Banners */}
        {showUnauthBanner && (
          <div className="home-guidance">
            <button className="home-guidance-close" onClick={() => dismissGuide('unauth')} aria-label="Dismiss">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h3 className="home-guidance-title">How GitchaCars Works</h3>
            <p className="home-guidance-body">
              Buyers post what they want, and sellers introduce matching vehicles. Browse active Want-Listings below, or{' '}
              <Link to="/auth?mode=register" className="home-guidance-link">create an account</Link>{' '}
              to post your own or start selling.
            </p>
          </div>
        )}

        {showBuyerBanner && (
          <div className="home-guidance">
            <button className="home-guidance-close" onClick={() => dismissGuide('buyer')} aria-label="Dismiss">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h3 className="home-guidance-title">Post Your First Want Listing</h3>
            <p className="home-guidance-body">
              Tell sellers what you're looking for! Use the AI chat in the sidebar or{' '}

              <Link to="/create-listing" className="home-guidance-link">create a listing manually</Link>.
            </p>
          </div>
        )}

        {showSellerBanner && (
          <div className="home-guidance">
            <button className="home-guidance-close" onClick={() => dismissGuide('seller')} aria-label="Dismiss">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h3 className="home-guidance-title">Find Matching Buyers</h3>
            <p className="home-guidance-body">
              Browse Want-Listings below to find buyers looking for vehicles you have. Use the filters and AI chat in the sidebar to narrow results.
            </p>
          </div>
        )}

        <ErrorBoundary>
        <div className="home-listing-feed" ref={feedRef}>
          {loading && listings.length === 0 && (
            <>
              <Skeleton variant="card" />
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </>
          )}

          {listings.map((listing) => (
            <div key={listing.id} className="scroll-reveal">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
        </ErrorBoundary>

        {loading && listings.length > 0 && (
          <div className="home-loading">
            <div className="spinner" />
          </div>
        )}

        {!loading && listings.length < total && (
          <div className="home-load-more">
            <button className="btn btn-secondary" onClick={handleLoadMore}>Load More</button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="home-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>No listings found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}

        {!loading && error && listings.length === 0 && (
          <div className="home-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3>Failed to load listings</h3>
            <p>There was a problem connecting to the server.</p>
            <button className="btn btn-secondary" onClick={() => { setError(false); fetchListings(1, filters, sort) }}>
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
