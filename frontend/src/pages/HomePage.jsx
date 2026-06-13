import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useHome } from '../hooks/useHome'
import { useWikiIndex } from '../hooks/useWikiIndex'
import { useToast } from '../hooks/useToast'
import Modal from '../components/ui/Modal'
import HomeForm from '../components/home/HomeForm'
import RichText from '../components/wiki/RichText'
import styles from './HomePage.module.css'

const TYPE_LABELS = {
  character: 'personaje',
  location: 'ubicación',
  event: 'evento',
  glossary: 'la palabra',
}

const RECOMMENDED_COUNT = 6

export default function HomePage() {
  const { isOwner } = useAuth()
  const { home, loading, reload } = useHome()
  const index = useWikiIndex()
  const { showToast } = useToast()

  const [editing, setEditing] = useState(false)

  const recommended = useMemo(() => {
    return [...index]
      .filter(e => e.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, RECOMMENDED_COUNT)
  }, [index])

  const handleEditSuccess = async () => {
    setEditing(false)
    await reload()
    showToast('Página de inicio actualizada', 'success')
  }

  if (loading) return null

  const sections = home?.sections || []
  const bannerUrl = home?.banner_image_url || ''

  return (
    <div className={styles.page}>
      {(bannerUrl || isOwner) && (
        <div className={styles.bannerWrap}>
          {bannerUrl
            ? <img src={bannerUrl} alt="" className={styles.bannerImg} />
            : (
              <button type="button" className={styles.bannerEmpty} onClick={() => setEditing(true)} style={{ width: '100%', height: '100%', border: 'none', background: 'none' }}>
                click para subir un banner (proporción 3:1)
              </button>
            )
          }
        </div>
      )}

      {isOwner && (
        <div className={styles.topBar}>
          <button className={styles.btnEdit} onClick={() => setEditing(true)}>editar inicio</button>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          {sections.length > 0 ? (
            <div className={styles.sections}>
              {sections.map((section, i) => (
                <div key={i} className={styles.section}>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <RichText text={section.content} as="div" className={styles.sectionText} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              {isOwner
                ? 'Esta página aún no tiene contenido. Usa "editar inicio" para agregar secciones.'
                : 'Esta página aún no tiene contenido.'}
            </div>
          )}
        </div>

        {recommended.length > 0 && (
          <aside className={styles.recommended}>
            <div className={styles.recommendedTitle}>artículos recomendados</div>
            <div className={styles.articleList}>
              {recommended.map(entry => (
                <Link key={`${entry.type}-${entry.slug}`} to={entry.path} className={styles.articleCard}>
                  {entry.image_url
                    ? <img src={entry.image_url} alt="" className={styles.articleImg} />
                    : <div className={styles.articleImgFallback}>◇</div>
                  }
                  <div className={styles.articleBody}>
                    <div className={styles.articleType}>{TYPE_LABELS[entry.type] || entry.type}</div>
                    <div className={styles.articleTitle}>{entry.names[0]}</div>
                    {entry.excerpt && <div className={styles.articleExcerpt}>{entry.excerpt}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Editar página de inicio">
        <HomeForm home={home} onSuccess={handleEditSuccess} onCancel={() => setEditing(false)} showToast={showToast} />
      </Modal>
    </div>
  )
}
