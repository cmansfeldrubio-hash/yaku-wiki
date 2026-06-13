import { Link } from 'react-router-dom'
import LoginSlider from '../auth/LoginSlider'
import styles from './Header.module.css'

export default function Header({ stats }) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <div className={styles.logoMark}>YT</div>
        <div>
          <div className={styles.logoText}>Yakutown Wiki</div>
          <div className={styles.logoSub}>Santiago · Década 2010</div>
        </div>
      </Link>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>inicio</Link>
        <Link to="/personajes" className={styles.navLink}>personajes</Link>
        <Link to="/eventos" className={styles.navLink}>eventos</Link>
        <Link to="/ubicaciones" className={styles.navLink}>ubicaciones</Link>
        <Link to="/la-palabra" className={styles.navLink}>la palabra</Link>
        <Link to="/galeria" className={styles.navLink}>galería</Link>
      </nav>
      <div className={styles.right}>
        <div className={styles.stats}>
          <span className={styles.stat}><strong>{stats.total}</strong> personajes</span>
          <span className={styles.stat}><strong>{stats.yakumas}</strong> yakumas</span>
          <span className={styles.stat}><strong>{stats.siniestros}</strong> siniestros</span>
        </div>
        <LoginSlider />
      </div>
    </header>
  )
}
