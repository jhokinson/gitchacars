import { useState, useCallback, useRef, useEffect } from 'react'
import './RangeSlider.css'

export default function RangeSlider({ min = 0, max = 100000, step = 1000, valueMin, valueMax, onChange, formatValue }) {
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
      const val = getValueFromPosition(e.clientX)
      if (dragging === 'min') {
        onChange(Math.min(val, valueMax - step), valueMax)
      } else {
        onChange(valueMin, Math.max(val, valueMin + step))
      }
    }

    const handleMouseUp = () => setDragging(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
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
        />
        <div
          className="range-slider-thumb"
          style={{ left: `${getPercent(valueMax)}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
      <div className="range-slider-inputs">
        <div className="range-slider-input-group">
          <span className="range-slider-prefix">$</span>
          <input
            type="text"
            value={valueMin.toLocaleString()}
            onChange={handleMinInput}
            className="range-slider-input"
          />
        </div>
        <span className="range-slider-separator">&mdash;</span>
        <div className="range-slider-input-group">
          <span className="range-slider-prefix">$</span>
          <input
            type="text"
            value={valueMax >= max ? 'No max' : valueMax.toLocaleString()}
            onChange={handleMaxInput}
            className="range-slider-input"
          />
        </div>
      </div>
    </div>
  )
}
