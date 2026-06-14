export const FACTION_COLORS = {
  yakuma: {
    accent: '#c8f060',
    bg: 'rgba(200,240,96,0.12)',
    label: 'Yakuma',
    dot: '#c8f060',
  },
  'seis-siniestros': {
    accent: '#ff4444',
    bg: 'rgba(255,68,68,0.12)',
    label: 'Los Seis Siniestros',
    dot: '#ff4444',
  },
  npc: {
    accent: '#60b8f0',
    bg: 'rgba(96,184,240,0.12)',
    label: 'NPC',
    dot: '#60b8f0',
  },
  otro: {
    accent: '#f0c040',
    bg: 'rgba(240,192,64,0.12)',
    label: 'Otro',
    dot: '#f0c040',
  },
}

export const STATUS_STYLES = {
  activo:      { color: '#c8f060', bg: 'rgba(200,240,96,0.1)',  border: 'rgba(200,240,96,0.2)' },
  leyenda:     { color: '#f0c040', bg: 'rgba(240,192,64,0.1)',  border: 'rgba(240,192,64,0.2)' },
  antagonista: { color: '#ff4444', bg: 'rgba(255,68,68,0.1)',   border: 'rgba(255,68,68,0.2)'  },
  sospechoso:  { color: '#f0c040', bg: 'rgba(240,192,64,0.1)',  border: 'rgba(240,192,64,0.2)' },
  desconocido: { color: '#9090a0', bg: 'rgba(144,144,160,0.1)', border: 'rgba(144,144,160,0.2)' },
}

export const getFactionColor = (faction) =>
  FACTION_COLORS[faction]?.accent ?? '#606070'

export const getFactionBg = (faction) =>
  FACTION_COLORS[faction]?.bg ?? 'rgba(96,96,112,0.12)'
