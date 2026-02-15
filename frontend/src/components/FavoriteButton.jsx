import { useState } from 'react'
import apiService from '../services/apiService'
import './FavoriteButton.css'

export default function FavoriteButton({ listingId, isFavorited: initialFav = false, onToggle }) {
  const [favorited, setFavorited] = useState(initialFav)

  const handleClick = async (e) => {
    e.stopPropagation()
    const newState = !favorited
    setFavorited(newState) // Optimistic

    try {
      if (newState) {
        await apiService.favorites.add(listingId)
      } else {
        await apiService.favorites.remove(listingId)
      }
      if (onToggle) onToggle(listingId, newState)
    } catch {
      setFavorited(!newState) // Revert on error
    }
  }

  return (
    <button
      className={`favorite-btn ${favorited ? 'favorited' : ''}`}
      onClick={handleClick}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorited ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  )
}
