import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './WikiLink.module.css'

const TYPE_LABELS = {
  character: 'personaje',
  location: 'ubicación',
  event: 'evento',
  glossary: 'la palabra',
}

const HOVER_DELAY = 300

export default function WikiLink({ entry, children }) {
  const [showPreview, setShowPreview] = useState(false)
  const timerRef = useRef(null)

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShowPreview(true), HOVER_DELAY)
  }

  const handleLeave = () => {
    clearTimeout(timerRef.current)
    setShowPreview(false)
  }

  return (
    <Link
      to={entry.path}
      className={styles.link}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {showPreview && (
        <span className={styles.popover}>
          <span className={styles.popoverHeader}>
            {entry.image_url && <img src={entry.image_url} alt="" className={styles.popoverImg} />}
            <span>
              <span className={styles.popoverTitle}>{entry.names[0]}</span>
              <br />
              <span className={styles.popoverType}>{TYPE_LABELS[entry.type] || entry.type}</span>
            </span>
          </span>
          {entry.excerpt && <span className={styles.popoverExcerpt}>{entry.excerpt}</span>}
        </span>
      )}
    </Link>
  )
}
