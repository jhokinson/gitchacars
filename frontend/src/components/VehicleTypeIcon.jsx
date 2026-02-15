import './VehicleTypeIcon.css'

const icons = {
  sedan: (
    <g>
      <path d="M3 14l2-4h4l2-3h6l2 3h2l2 4" />
      <path d="M3 14v3h2" />
      <path d="M19 14v3h2v-3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </g>
  ),
  suv: (
    <g>
      <path d="M3 13l1-3h5l2-4h8l1 4h1l1 3" />
      <path d="M3 13v4h2" />
      <path d="M19 13v4h2v-4" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
      <path d="M9 6v4" />
    </g>
  ),
  truck: (
    <g>
      <path d="M2 14h6V7h6l3 4h2l2 3" />
      <path d="M2 14v3h3" />
      <path d="M19 14v3h3v-3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
      <path d="M8 7H2v7" />
    </g>
  ),
  classic: (
    <g>
      <path d="M4 14q0-3 2-5h3q1-2 3-2h2q2 0 3 2h3q2 2 2 5" />
      <path d="M4 14v3h2" />
      <path d="M18 14v3h2v-3" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
      <path d="M9.5 17h5" />
      <circle cx="12" cy="11" r="1" />
    </g>
  ),
  exotic: (
    <g>
      <path d="M2 15l3-2 3-4h8l3 4 3 2" />
      <path d="M2 15v2h3" />
      <path d="M19 15v2h3v-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
      <path d="M8 9l4-1 4 1" />
    </g>
  ),
  van: (
    <g>
      <path d="M3 15V8a1 1 0 011-1h10l4 4v4" />
      <path d="M3 15v2h3" />
      <path d="M18 15v2h3v-2" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
      <path d="M9.5 17h5" />
      <path d="M14 7v4h4" />
    </g>
  ),
  coupe: (
    <g>
      <path d="M3 14l2-3h4l3-4h5l3 4h1l1 3" />
      <path d="M3 14v3h2" />
      <path d="M19 14v3h2v-3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </g>
  ),
  convertible: (
    <g>
      <path d="M3 14l2-3h5l2-2h4l1 2h3l2 3" />
      <path d="M3 14v3h2" />
      <path d="M19 14v3h2v-3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
      <path d="M10 9l6 0" strokeDasharray="2 2" />
    </g>
  ),
  wagon: (
    <g>
      <path d="M3 14l2-4h4l2-3h9v7" />
      <path d="M3 14v3h2" />
      <path d="M18 14v3h2v-3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
      <path d="M20 7v7" />
    </g>
  ),
  electric: (
    <g>
      <path d="M3 14l2-4h4l2-3h6l2 3h2l2 4" />
      <path d="M3 14v3h2" />
      <path d="M19 14v3h2v-3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
      <path d="M13 4l-2 3h3l-2 3" strokeWidth="2" />
    </g>
  ),
}

// Default generic car icon (same as ListingCard placeholder)
const defaultIcon = (
  <g>
    <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H9m-6-6h15m-6-5v5" />
  </g>
)

export default function VehicleTypeIcon({ type, size = 48 }) {
  const icon = type && icons[type] ? icons[type] : defaultIcon

  return (
    <svg
      className="vehicle-type-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon}
    </svg>
  )
}
