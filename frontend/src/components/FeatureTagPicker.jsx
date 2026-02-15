import { useState } from 'react'
import './FeatureTagPicker.css'

const FEATURES = [
  'Leather Seats', 'Sunroof/Moonroof', 'Backup Camera', 'Navigation',
  'Bluetooth', 'Heated Seats', 'Apple CarPlay', 'Android Auto',
  'Keyless Entry', 'Remote Start', 'Blind Spot Monitor', 'Lane Assist',
  'Adaptive Cruise', 'Third Row', 'Tow Package', 'Low Miles',
]

export default function FeatureTagPicker({ selected = [], onChange }) {
  const toggle = (feature) => {
    if (selected.includes(feature)) {
      onChange(selected.filter((f) => f !== feature))
    } else {
      onChange([...selected, feature])
    }
  }

  return (
    <div className="feature-tag-picker">
      {FEATURES.map((f) => (
        <button
          key={f}
          type="button"
          className={`tag-pill ${selected.includes(f) ? 'active' : ''}`}
          onClick={() => toggle(f)}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
