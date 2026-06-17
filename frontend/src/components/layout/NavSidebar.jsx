import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Zap, Users, CalendarDays, MapPin, BookOpen, Image, Laugh, LayoutGrid, BookMarked } from 'lucide-react'
import LoginSlider from '../auth/LoginSlider'
import styles from './NavSidebar.module.css'

const NAV_LINKS = [
  { to: '/',            label: 'inicio',      icon: Home },
  { to: '/yakumeadas',  label: 'yakumeadas',  icon: Zap },
  { to: '/personajes',  label: 'personajes',  icon: Users },
  { to: '/eventos',     label: 'eventos',     icon: CalendarDays },
  { to: '/ubicaciones', label: 'ubicaciones', icon: MapPin },
  null,
  { to: '/la-palabra',  label: 'la palabra',  icon: BookOpen },
  { to: '/galeria',     label: 'galería',     icon: Image },
  { to: '/memes',       label: 'los memes',   icon: Laugh },
  { to: '/cards',       label: 'cartas',      icon: LayoutGrid },
  null,
  { to: '/comics',      label: 'cómics',      icon: BookMarked },
]

export default function NavSidebar({ stats }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileOpen)
    return () => document.body.classList.remove('menu-open')
  }, [mobileOpen])

  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', collapsed) } catch {}
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '52px' : '220px')
  }, [collapsed])

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '52px' : '220px')
  }, [])

  const toggle = () => setCollapsed(c => !c)

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const navContent = (mobile = false) => (
    <>
      <Link to="/" className={styles.logoArea} onClick={mobile ? () => setMobileOpen(false) : undefined}>
        <img src="/logo.png" alt="Yakutown" className={styles.logoImg} />
        {(!collapsed || mobile) && (
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>Yakutown Wiki</div>
            <div className={styles.logoSub}>Santiago · Década 2010</div>
          </div>
        )}
      </Link>

      <nav className={styles.nav}>
        {NAV_LINKS.map((link, i) => {
          if (!link) return <div key={i} className={styles.divider} />
          const active = isActive(link.to)
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              onClick={mobile ? () => setMobileOpen(false) : undefined}
              title={collapsed && !mobile ? link.label : undefined}
            >
              <Icon size={17} className={styles.navIcon} aria-hidden="true" />
              {(!collapsed || mobile) && <span className={styles.label}>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={styles.bottom}>
        {(!collapsed || mobile) && (
          <div className={styles.stats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>personajes</span>
              <span className={styles.statVal}>{stats.total}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>yakumas</span>
              <span className={styles.statVal}>{stats.yakumas}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>siniestros</span>
              <span className={styles.statVal}>{stats.siniestros}</span>
            </div>
          </div>
        )}
        <div className={styles.loginArea}>
          <LoginSlider compact={collapsed && !mobile} panelAlign={mobile ? 'right' : 'left'} panelUp={!mobile} />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        {navContent()}
        <button
          className={styles.collapseBtn}
          onClick={toggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Mobile topbar */}
      <div className={styles.mobileBar}>
        <Link to="/" className={styles.mobileLogo}>
          <img src="/logo.png" alt="Yakutown" className={styles.mobileLogoImg} />
          <span className={styles.mobileLogoTitle}>Yakutown Wiki</span>
        </Link>
        <div className={styles.mobileRight}>
          <LoginSlider compact />
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            <span className={styles.hLine} />
            <span className={styles.hLine} />
            <span className={styles.hLine} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}
      <div className={`${styles.drawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
        {navContent(true)}
      </div>
    </>
  )
}
