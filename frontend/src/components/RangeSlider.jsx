import { useState, useCallback, useRef, useEffect } from 'react'
import PriceHistogram from './PriceHistogram'
import './RangeSlider.css'

export default function RangeSlider({ min = 0, max = 100000, step = 1000, valueMin, valueMax, onChange, formatValue, histogram }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(null)

  const format = formatValue || ((v) => v === max ? 'No max' : `$${v.toLocaleString()}`)

  const getPercent = (val) => ((val - min) / (max - min)) * 100

  const getValueFromPosition = useCallback((clientX) => {
    const track = trackRef.current
    if (!track) return min
    const rect = track.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + pct * (max - min)
    return Math.round(raw / step) * step
  }, [min, max, step])

  const handleMouseDown = (thumb) => (e) => {
    e.preventDefault()
    setDragging(thumb)
  }

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const val = getValueFromPosition(clientX)
      if (dragging === 'min') {
        onChange(Math.min(val, valueMax - step), valueMax)
      } else {
        onChange(valueMin, Math.max(val, valueMin + step))
      }
    }

    const handleMouseUp = () => setDragging(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [dragging, valueMin, valueMax, getValueFromPosition, onChange, step])

  const handleMinInput = (e) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || min
    onChange(Math.min(val, valueMax - step), valueMax)
  }

  const handleMaxInput = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      onChange(valueMin, max)
      return
    }
    const val = parseInt(raw) || max
    onChange(valueMin, Math.max(val, valueMin + step))
  }

  return (
    <div className="range-slider">
      {histogram && histogram.length > 0 && (
        <PriceHistogram
          buckets={histogram}
          min={min}
          max={max}
          valueMin={valueMin}
          valueMax={valueMax}
        />
      )}
      <div className="range-slider-track" ref={trackRef}>
        <div className="range-slider-rail" />
        <div
          className="range-slider-fill"
          style={{
            left: `${getPercent(valueMin)}%`,
            width: `${getPercent(valueMax) - getPercent(valueMin)}%`,
          }}
        />
        <div
          className="range-slider-thumb"
          style={{ left: `${getPercent(valueMin)}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleMouseDown('min')}
        />
        <div
          className="range-slider-thumb"
          style={{ left: `${getPercent(valueMax)}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleMouseDown('max')}
        />
      </div>
      <div className="range-slider-stacked-inputs">
        <div className="range-slider-input-row">
          <label className="range-slider-label">Min</label>
          <div className="range-slider-input-group">
            <span className="range-slider-prefix">$</span>
            <input
              type="text"
              value={valueMin === 0 ? '' : valueMin.toLocaleString()}
              onChange={handleMinInput}
              className="range-slider-input"
              placeholder="No min"
            />
          </div>
        </div>
        <div className="range-slider-input-row">
          <label className="range-slider-label">Max</label>
          <div className="range-slider-input-group">
            <span className="range-slider-prefix">$</span>
            <input
              type="text"
              value={valueMax >= max ? '' : valueMax.toLocaleString()}
              onChange={handleMaxInput}
              className="range-slider-input"
              placeholder="No max"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
