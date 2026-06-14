import { forwardRef } from 'react'
import cardFont from '../../cards-specs/card-font.png'
import badgeComun from '../../cards-specs/rarities/badge_comun.png'
import badgeInfrecuente from '../../cards-specs/rarities/badge_infrecuente.png'
import badgeRara from '../../cards-specs/rarities/badge_rara.png'
import badgeEpica from '../../cards-specs/rarities/badge_epica.png'
import badgeLegendaria from '../../cards-specs/rarities/badge_legendaria.png'
import { IMAGE_AREA, TEXT_AREAS, COST_AREA, getBadgeStyle } from '../../utils/cardLayout'
import styles from './CardCanvas.module.css'

const BADGE_IMAGES = {
  comun: badgeComun,
  infrecuente: badgeInfrecuente,
  rara: badgeRara,
  epica: badgeEpica,
  legendaria: badgeLegendaria,
}

const pct = (v) => `${v}%`

const CardCanvas = forwardRef(function CardCanvas(
  { name, subtype, rarity = 'comun', cost, effectText, imageUrl },
  ref
) {
  const badgeStyle = getBadgeStyle(rarity)
  const badgeSrc = BADGE_IMAGES[rarity] || BADGE_IMAGES.comun

  return (
    <div ref={ref} className={styles.card}>
      {/* Capa 1: imagen de fondo / placeholder */}
      <div
        className={styles.imageLayer}
        style={{
          left: pct(IMAGE_AREA.leftPct),
          top: pct(IMAGE_AREA.topPct),
          width: pct(IMAGE_AREA.widthPct),
          height: pct(IMAGE_AREA.heightPct),
        }}
      >
        {imageUrl
          ? <img src={imageUrl} alt="" className={styles.image} crossOrigin="anonymous" />
          : <div className={styles.imagePlaceholder}>colocar imagen</div>
        }
      </div>

      {/* Capa 2: frame */}
      <img src={cardFont} alt="" className={styles.frame} />

      {/* Capa 3: badge de rareza */}
      <img
        src={badgeSrc}
        alt=""
        className={styles.badge}
        style={{
          left: pct(badgeStyle.leftPct),
          top: pct(badgeStyle.topPct),
          width: pct(badgeStyle.widthPct),
          height: pct(badgeStyle.heightPct),
        }}
      />

      {/* Capa 4: textos */}
      <div
        className={styles.text}
        style={{
          left: pct(TEXT_AREAS.name.leftPct),
          top: pct(TEXT_AREAS.name.topPct),
          width: pct(TEXT_AREAS.name.widthPct),
          height: pct(TEXT_AREAS.name.heightPct),
          fontFamily: TEXT_AREAS.name.fontFamily,
          color: TEXT_AREAS.name.color,
          textAlign: TEXT_AREAS.name.align,
        }}
      >
        <span className={styles.nameText}>{name}</span>
      </div>

      <div
        className={styles.text}
        style={{
          left: pct(TEXT_AREAS.subtype.leftPct),
          top: pct(TEXT_AREAS.subtype.topPct),
          width: pct(TEXT_AREAS.subtype.widthPct),
          height: pct(TEXT_AREAS.subtype.heightPct),
          fontFamily: TEXT_AREAS.subtype.fontFamily,
          fontWeight: TEXT_AREAS.subtype.fontWeight,
          color: TEXT_AREAS.subtype.color,
          textAlign: TEXT_AREAS.subtype.align,
        }}
      >
        <span className={styles.subtypeText}>{subtype}</span>
      </div>

      <div
        className={styles.text}
        style={{
          left: pct(TEXT_AREAS.effectText.leftPct),
          top: pct(TEXT_AREAS.effectText.topPct),
          width: pct(TEXT_AREAS.effectText.widthPct),
          height: pct(TEXT_AREAS.effectText.heightPct),
          fontFamily: TEXT_AREAS.effectText.fontFamily,
          fontWeight: TEXT_AREAS.effectText.fontWeight,
          color: TEXT_AREAS.effectText.color,
          textAlign: TEXT_AREAS.effectText.align,
        }}
      >
        <span className={styles.effectTextContent}>{effectText}</span>
      </div>

      {/* Costo, centrado sobre el badge de rareza */}
      {(cost !== undefined && cost !== null && cost !== '') && (
        <div
          className={styles.costText}
          style={{
            left: pct(COST_AREA.xPct),
            top: pct(COST_AREA.yPct),
          }}
        >
          {cost}
        </div>
      )}
    </div>
  )
})

export default CardCanvas
