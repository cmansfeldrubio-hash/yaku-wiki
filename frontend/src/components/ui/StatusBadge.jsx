import { STATUS_STYLES } from '../../constants/factions'

export default function StatusBadge({ status, yakuma_title }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.desconocido
  const yakumaS = STATUS_STYLES.activo
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      <span style={{
        fontSize: 11,
        fontFamily: "'Space Mono', monospace",
        padding: '3px 8px',
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}>{status}</span>
      {yakuma_title && (
        <span style={{
          fontSize: 11,
          fontFamily: "'Space Mono', monospace",
          padding: '3px 8px',
          borderRadius: 4,
          background: yakumaS.bg,
          color: yakumaS.color,
          border: `1px solid ${yakumaS.border}`,
        }}>yakuma</span>
      )}
    </span>
  )
}
