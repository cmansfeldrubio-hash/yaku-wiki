import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LoginSlider from '../auth/LoginSlider'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: '/', label: 'inicio' },
  { to: '/yakumeadas', label: 'yakumeadas' },
  { to: '/personajes', label: 'personajes' },
  { to: '/eventos', label: 'eventos' },
  { to: '/ubicaciones', label: 'ubicaciones' },
  { to: '/la-palabra', label: 'la palabra' },
  { to: '/galeria', label: 'galería' },
  { to: '/memes', label: 'los memes' },
  { to: '/cards', label: 'cartas' },
]

export default function Header({ stats }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Toggle body scroll lock
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  const toggleMenu = () => setMenuOpen(prev => !prev)

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src="/logo.png" alt="Yakutown" className={styles.logoMark} />
        <div>
          <div className={styles.logoText}>Yakutown Wiki</div>
          <div className={styles.logoSub}>Santiago · Década 2010</div>
        </div>
      </Link>

      {/* Desktop nav */}
      <nav className={styles.nav}>
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`${styles.navLink} ${location.pathname === link.to ? styles.navLinkActive : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className={styles.right}>
        {/* Desktop stats */}
        <div className={styles.stats}>
          <span className={styles.stat}><strong>{stats.total}</strong> personajes</span>
          <span className={styles.stat}><strong>{stats.yakumas}</strong> yakumas</span>
          <span className={styles.stat}><strong>{stats.siniestros}</strong> siniestros</span>
        </div>

        <LoginSlider />

        {/* Hamburger button — mobile only */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} ref={menuRef}>
        <nav className={styles.drawerNav}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.drawerLink} ${location.pathname === link.to ? styles.drawerLinkActive : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.drawerStats}>
          <span className={styles.drawerStat}><strong>{stats.total}</strong> personajes</span>
          <span className={styles.drawerStat}><strong>{stats.yakumas}</strong> yakumas</span>
          <span className={styles.drawerStat}><strong>{stats.siniestros}</strong> siniestros</span>
        </div>

        <div className={styles.drawerFooter}>
          <LoginSlider />
        </div>
      </div>
    </header>
  )
}
