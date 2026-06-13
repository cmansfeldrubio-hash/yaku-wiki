import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, msg: '', type: 'success' })

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ visible: true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        background: 'var(--bg4)',
        border: `1px solid var(--border2)`,
        borderLeft: `3px solid ${toast.type === 'success' ? 'var(--yakuma)' : 'var(--siniestro)'}`,
        borderRadius: 'var(--radius)',
        padding: '12px 20px',
        fontSize: '14px',
        color: 'var(--text)',
        zIndex: 999,
        transform: toast.visible ? 'translateY(0)' : 'translateY(100px)',
        opacity: toast.visible ? 1 : 0,
        transition: 'all 0.25s',
        pointerEvents: 'none',
      }}>
        {toast.msg}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
