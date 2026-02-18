import './FeatureTagPicker.css'

const FEATURES = [
  'Leather Seats', 'Sunroof/Moonroof', 'Backup Camera', 'Navigation',
  'Bluetooth', 'Heated Seats', 'Apple CarPlay', 'Android Auto',
  'Keyless Entry', 'Remote Start', 'Blind Spot Monitor', 'Lane Assist',
  'Adaptive Cruise', 'Third Row', 'Tow Package', 'Low Miles',
]

export default function FeatureTagPicker({ mustHave = [], niceToHave = [], onChangeMustHave, onChangeNiceToHave, selected, onChange }) {
  // Support both old (selected/onChange) and new (mustHave/niceToHave) APIs
  const hasPriorityMode = onChangeMustHave && onChangeNiceToHave

  if (!hasPriorityMode) {
    // Legacy mode: simple toggle
    const toggle = (feature) => {
      if ((selected || []).includes(feature)) {
        onChange((selected || []).filter((f) => f !== feature))
      } else {
        onChange([...(selected || []), feature])
      }
    }

    return (
      <div className="feature-tag-picker">
        {FEATURES.map((f) => (
          <button
            key={f}
            type="button"
            className={`tag-pill ${(selected || []).includes(f) ? 'active' : ''}`}
            onClick={() => toggle(f)}
          >
            {f}
          </button>
        ))}
      </div>
    )
  }

  // Priority mode: unselected → nice-to-have → must-have → unselected
  const getState = (feature) => {
    if (mustHave.includes(feature)) return 'must-have'
    if (niceToHave.includes(feature)) return 'nice-to-have'
    return 'none'
  }

  const cycle = (feature) => {
    const state = getState(feature)
    if (state === 'none') {
      // → nice-to-have
      onChangeNiceToHave([...niceToHave, feature])
    } else if (state === 'nice-to-have') {
      // → must-have
      onChangeNiceToHave(niceToHave.filter(f => f !== feature))
      onChangeMustHave([...mustHave, feature])
    } else {
      // → unselected
      onChangeMustHave(mustHave.filter(f => f !== feature))
    }
  }

  return (
    <div className="feature-tag-picker">
      <div className="feature-tag-picker-legend">
        <span className="legend-item legend-nice">Click = Nice-to-Have</span>
        <span className="legend-item legend-must">Click Again = Must-Have</span>
      </div>
      <div className="feature-tag-picker-pills">
        {FEATURES.map((f) => {
          const state = getState(f)
          return (
            <button
              key={f}
              type="button"
              className={`tag-pill ${state === 'must-have' ? 'tag-pill-must' : state === 'nice-to-have' ? 'active' : ''}`}
              onClick={() => cycle(f)}
            >
              {state === 'must-have' && <span className="tag-pill-star">★</span>}
              {f}
            </button>
          )
        })}
      </div>
    </div>
  )
}
