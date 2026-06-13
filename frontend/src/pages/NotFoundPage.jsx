import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '5rem',
        fontWeight: 700,
        color: 'var(--yakuma)',
        lineHeight: 1,
      }}>404</span>

      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--text)',
        marginTop: '1rem',
      }}>Página no encontrada</h1>

      <p style={{
        color: 'var(--text2)',
        fontSize: '0.95rem',
        marginTop: '0.5rem',
        maxWidth: '360px',
      }}>
        La ruta que buscas no existe o fue movida.
      </p>

      <Link to="/" style={{
        marginTop: '1.5rem',
        padding: '10px 24px',
        borderRadius: 'var(--radius)',
        background: 'var(--yakuma)',
        color: '#0d0d0f',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
