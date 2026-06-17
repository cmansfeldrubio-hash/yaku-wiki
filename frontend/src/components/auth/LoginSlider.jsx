import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './LoginSlider.module.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const ROLE_LABELS = { owner: 'propietario', admin: 'administrador', editor: 'editor', viewer: 'lector' }

function initials(name) {
  return (name || '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function LoginSlider({ compact = false, panelAlign = 'right' }) {
  const { user, login, logout, isOwner } = useAuth()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Render the Google Sign-In button when the panel opens and the user is logged out
  useEffect(() => {
    if (!open || user || !GOOGLE_CLIENT_ID) return

    const renderButton = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await login(response.credential)
            setOpen(false)
          } catch {
            // login errors are surfaced via the backend response; ignore here
          }
        },
      })
      if (buttonRef.current) {
        buttonRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: 232 })
      }
    }

    if (window.google?.accounts?.id) {
      renderButton()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.onload = renderButton
      document.head.appendChild(script)
    }
  }, [open, user, login])

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button className={styles.trigger} onClick={() => setOpen(o => !o)}>
        {user ? (
          user.picture
            ? <img src={user.picture} alt={user.name} className={styles.avatar} />
            : <span className={styles.avatarFallback}>{initials(user.name)}</span>
        ) : (
          <span>{compact ? '→' : 'iniciar sesión'}</span>
        )}
        {user && !compact && <span>{user.name?.split(' ')[0]}</span>}
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.panel} style={panelAlign === 'left' ? { right: 'auto', left: 0 } : undefined}>
          {user ? (
            <>
              <div className={styles.profile}>
                {user.picture
                  ? <img src={user.picture} alt={user.name} className={styles.profileAvatar} />
                  : <span className={styles.profileAvatarFallback}>{initials(user.name)}</span>
                }
                <div>
                  <div className={styles.profileName}>{user.name}</div>
                  <div className={styles.profileEmail}>{user.email}</div>
                  <div className={styles.roleBadge}>{ROLE_LABELS[user.role] || user.role}</div>
                </div>
              </div>

              {isOwner && (
                <Link to="/usuarios" className={styles.menuLink} onClick={() => setOpen(false)}>
                  gestionar usuarios
                </Link>
              )}

              <button className={styles.logoutBtn} onClick={() => { logout(); setOpen(false) }}>
                cerrar sesión
              </button>
            </>
          ) : (
            <>
              <div className={styles.title}>iniciar sesión</div>
              {GOOGLE_CLIENT_ID ? (
                <div className={styles.googleBtn} ref={buttonRef} />
              ) : (
                <p className={styles.hint}>
                  Falta configurar <code>VITE_GOOGLE_CLIENT_ID</code> en <code>frontend/.env</code>.
                </p>
              )}
              <p className={styles.hint}>
                Inicia sesión con tu cuenta de Google para sugerir ediciones a la wiki.
              </p>
            </>
          )}
          </div>
        </>
      )}
    </div>
  )
}
