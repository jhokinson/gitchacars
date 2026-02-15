import VehicleTypeIcon from './VehicleTypeIcon'
import './ListingPreview.css'

const vehicleTypeLabels = {
  sedan: 'Sedan',
  suv: 'SUV',
  truck: 'Pickup Truck',
  classic: 'Classic Car',
  exotic: 'Exotic / Sports',
  van: 'Van / Minivan',
  coupe: 'Coupe',
  convertible: 'Convertible',
  wagon: 'Wagon / Hatchback',
  electric: 'Electric',
  other: 'Other',
}

const REQUIRED_FIELDS = ['title', 'make', 'model', 'yearMin', 'yearMax', 'budgetMin', 'budgetMax']

export default function ListingPreview({ data = {} }) {
  const filled = REQUIRED_FIELDS.filter(f => {
    const val = data[f]
    return val !== undefined && val !== null && val !== ''
  })
  const progress = filled.length

  return (
    <div className="listing-preview card">
      <div className="listing-preview-progress">
        <span className="listing-preview-progress-text">{progress} of {REQUIRED_FIELDS.length} fields complete</span>
        <div className="listing-preview-progress-bar">
          <div
            className="listing-preview-progress-fill"
            style={{ width: `${(progress / REQUIRED_FIELDS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="listing-preview-header">
        <VehicleTypeIcon type={data.vehicleType} size={40} />
        <div>
          <h3 className={`listing-preview-title${data.title ? '' : ' placeholder'}`}>
            {data.title || 'Untitled Listing'}
          </h3>
          {data.vehicleType && (
            <span className="listing-preview-type-label">
              {vehicleTypeLabels[data.vehicleType] || data.vehicleType}
            </span>
          )}
        </div>
      </div>

      <div className="listing-preview-section">
        <span className={`listing-preview-vehicle-info${data.make ? '' : ' placeholder'}`}>
          {data.make || '—'} {data.model || ''}{data.yearMin || data.yearMax ? `, ${data.yearMin || '?'}–${data.yearMax || '?'}` : ''}
        </span>
      </div>

      <div className="listing-preview-section">
        <span className={`listing-preview-budget${data.budgetMin || data.budgetMax ? '' : ' placeholder'}`}>
          {data.budgetMin || data.budgetMax
            ? `$${Number(data.budgetMin || 0).toLocaleString()} – $${Number(data.budgetMax || 0).toLocaleString()}`
            : '—'}
        </span>
      </div>

      <div className="listing-preview-section">
        <span className={data.zipCode ? '' : 'placeholder'}>
          {data.zipCode
            ? `Within ${data.radius || data.radiusMiles || '50'}mi of ${data.zipCode}`
            : '—'}
        </span>
      </div>

      <div className="listing-preview-specs">
        {[
          data.mileageMax ? `Under ${Number(data.mileageMax).toLocaleString()} mi` : null,
          data.transmission && data.transmission !== 'Any' ? data.transmission : null,
          data.drivetrain && data.drivetrain !== 'Any' ? data.drivetrain.toUpperCase() : null,
          data.condition && data.condition !== 'Any' ? data.condition : null,
        ].filter(Boolean).map((spec) => (
          <span key={spec} className="tag-pill">{spec}</span>
        ))}
      </div>

      {data.features && data.features.length > 0 && (
        <div className="listing-preview-features">
          {data.features.map((f) => (
            <span key={f} className="tag-pill">{f}</span>
          ))}
        </div>
      )}

      {data.description && (
        <div className="listing-preview-description">
          {data.description}
        </div>
      )}
    </div>
  )
}
