import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getUsers, updateUserRole } from '../api/auth'
import styles from './UsersPage.module.css'

const ROLES = [
  { value: 'viewer', label: 'lector' },
  { value: 'editor', label: 'editor' },
  { value: 'admin', label: 'administrador' },
]

function initials(name) {
  return (name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function UsersPage() {
  const { user, isOwner, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { users } = await getUsers()
      setUsers(users)
      setError(null)
    } catch (e) {
      setError(e.message || 'Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner) load()
  }, [isOwner])

  if (authLoading) return null
  if (!user || !isOwner) return <Navigate to="/" replace />

  const handleRoleChange = async (id, role) => {
    try {
      const { user: updated } = await updateUserRole(id, role)
      setUsers(prev => prev.map(u => u.id === id ? updated : u))
      showToast('Rol actualizado', 'success')
    } catch (e) {
      showToast(e.message || 'Error actualizando el rol', 'error')
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.breadcrumb}>
        <span className={styles.breadcrumbArrow}>←</span>
        <span>volver a la wiki</span>
      </Link>

      <h1 className={styles.title}>gestionar usuarios</h1>

      {loading && <div className={styles.loading}>cargando usuarios...</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {!loading && !error && (
        <div className={styles.list}>
          {users.map(u => (
            <div key={u.id} className={styles.row}>
              {u.picture
                ? <img src={u.picture} alt={u.name} className={styles.avatar} />
                : <span className={styles.avatarFallback}>{initials(u.name)}</span>
              }
              <div className={styles.info}>
                <div className={styles.name}>{u.name}</div>
                <div className={styles.email}>{u.email}</div>
              </div>
              <select
                className={styles.roleSelect}
                value={u.role}
                onChange={e => handleRoleChange(u.id, e.target.value)}
                disabled={u.id === user.id}
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
