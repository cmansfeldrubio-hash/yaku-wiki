import { getFactionColor, getFactionBg } from '../../constants/factions'

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Avatar({ name, faction, size = 44, fontSize = 14, style = {} }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Mono', monospace",
      fontWeight: 700,
      fontSize,
      flexShrink: 0,
      background: getFactionBg(faction),
      color: getFactionColor(faction),
      ...style,
    }}>
      {initials(name)}
    </div>
  )
}
