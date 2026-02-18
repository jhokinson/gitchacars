import './FeatureTag.css'

export default function FeatureTag({ label, priority }) {
  const cls = priority === 'must-have'
    ? 'feature-tag feature-tag-must-have'
    : priority === 'nice-to-have'
      ? 'feature-tag feature-tag-nice-to-have'
      : 'feature-tag'

  return <span className={cls}>{label}</span>
}
