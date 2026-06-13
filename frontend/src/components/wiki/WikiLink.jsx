import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import styles from './WikiLink.module.css'

const TYPE_LABELS = {
  character: 'personaje',
  location: 'ubicación',
  event: 'evento',
  glossary: 'la palabra',
}

const HOVER_DELAY = 300
const POPOVER_WIDTH = 260
const POPOVER_MAX_HEIGHT = 160
const VIEWPORT_MARGIN = 12

export default function WikiLink({ entry, children }) {
  const [position, setPosition] = useState(null)
  const linkRef = useRef(null)
  const timerRef = useRef(null)

  const handleEnter = () => {
    timerRef.current = setTimeout(() => {
      const rect = linkRef.current.getBoundingClientRect()
      const left = Math.min(
        Math.max(rect.left, VIEWPORT_MARGIN),
        window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN
      )
      const placement = rect.top - POPOVER_MAX_HEIGHT < VIEWPORT_MARGIN ? 'below' : 'above'
      const top = placement === 'above' ? rect.top : rect.bottom
      setPosition({ top, left, placement })
    }, HOVER_DELAY)
  }

  const handleLeave = () => {
    clearTimeout(timerRef.current)
    setPosition(null)
  }

  return (
    <Link
      ref={linkRef}
      to={entry.path}
      className={styles.link}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {position && createPortal(
        <span
          className={`${styles.popover} ${position.placement === 'below' ? styles.popoverBelow : ''}`}
          style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
        >
          <span className={styles.popoverHeader}>
            {entry.image_url && <img src={entry.image_url} alt="" className={styles.popoverImg} />}
            <span>
              <span className={styles.popoverTitle}>{entry.names[0]}</span>
              <br />
              <span className={styles.popoverType}>{TYPE_LABELS[entry.type] || entry.type}</span>
            </span>
          </span>
          {entry.excerpt && <span className={styles.popoverExcerpt}>{entry.excerpt}</span>}
        </span>,
        document.body
      )}
    </Link>
  )
}
