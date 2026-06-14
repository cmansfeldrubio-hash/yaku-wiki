import styles from './CardLayoutEditor.module.css'

export default function CardLayoutEditor({ boxes, onMove, onResize, onFontSize, onScale, containerRef }) {
  const startDrag = (key, mode) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY

    const onMoveEvent = (ev) => {
      const dxPct = (ev.clientX - startX) / rect.width * 100
      const dyPct = (ev.clientY - startY) / rect.height * 100
      if (mode === 'move') onMove(key, dxPct, dyPct)
      else onResize(key, dxPct, dyPct)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMoveEvent)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMoveEvent)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className={styles.overlay}>
      {boxes.map(box => (
        <div
          key={box.key}
          className={styles.box}
          style={{
            left: `${box.leftPct}%`,
            top: `${box.topPct}%`,
            width: `${box.widthPct}%`,
            height: `${box.heightPct}%`,
          }}
          onPointerDown={startDrag(box.key, 'move')}
        >
          <span className={styles.label}>{box.label}</span>
          {box.fontSizeCqw !== undefined && (
            <div className={styles.fontControl} onPointerDown={e => e.stopPropagation()}>
              <button type="button" onClick={() => onFontSize(box.key, -0.2)}>-</button>
              <span>{box.fontSizeCqw.toFixed(1)}</span>
              <button type="button" onClick={() => onFontSize(box.key, 0.2)}>+</button>
            </div>
          )}
          {box.resizable && (
            <div className={styles.resizeHandle} onPointerDown={startDrag(box.key, 'resize')} />
          )}
          {box.scalable && (
            <div className={styles.sizeControl} onPointerDown={e => e.stopPropagation()}>
              <button type="button" onClick={() => onScale(box.key, -1)}>-</button>
              <span>tamaño</span>
              <button type="button" onClick={() => onScale(box.key, 1)}>+</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
