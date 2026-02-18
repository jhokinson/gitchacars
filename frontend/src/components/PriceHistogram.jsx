import './PriceHistogram.css'

export default function PriceHistogram({ buckets = [], min = 0, max = 200000, valueMin = 0, valueMax = 200000 }) {
  if (!buckets || buckets.length === 0) return null

  const maxCount = Math.max(...buckets.map(b => b.count), 1)
  const bucketWidth = (max - min) / buckets.length

  return (
    <div className="price-histogram">
      {buckets.map((b, i) => {
        const bucketStart = min + i * bucketWidth
        const bucketEnd = bucketStart + bucketWidth
        const inRange = bucketEnd > valueMin && bucketStart < valueMax
        const heightPct = (b.count / maxCount) * 100

        return (
          <div
            key={i}
            className={`price-histogram-bar${inRange ? ' in-range' : ''}`}
            style={{ height: `${Math.max(heightPct, 2)}%` }}
            title={`$${bucketStart.toLocaleString()}–$${bucketEnd.toLocaleString()}: ${b.count} listing${b.count !== 1 ? 's' : ''}`}
          />
        )
      })}
    </div>
  )
}
