import { useState } from 'react'
import Modal from './Modal'

export default function DeleteConfirmModal({ characterName, onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const ready = input.trim().toLowerCase() === 'eliminar'

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title="Eliminar personaje"
      maxWidth="420px"
      footer={
        <>
          <button onClick={onCancel} style={{
            padding: '9px 20px', borderRadius: 'var(--radius)',
            border: '1px solid var(--border2)', background: 'transparent',
            color: 'var(--text2)', fontSize: 14, cursor: 'pointer',
          }}>cancelar</button>
          <button
            onClick={ready ? onConfirm : undefined}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius)',
              border: '1px solid var(--siniestro)',
              background: ready ? 'var(--siniestro)' : 'transparent',
              color: ready ? '#fff' : 'var(--siniestro)',
              fontSize: 14, fontWeight: 600,
              cursor: ready ? 'pointer' : 'not-allowed',
              opacity: ready ? 1 : 0.5,
              transition: 'all 0.15s',
            }}
          >eliminar</button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.5 }}>
        Vas a eliminar a <strong style={{ color: 'var(--text)' }}>{characterName}</strong> de la wiki.
        Esta acción no se puede deshacer.
      </p>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
        escribe "eliminar" para confirmar
      </p>
      <input
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ready && onConfirm()}
        style={{
          width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '9px 12px', color: 'var(--text)',
          fontSize: 14, outline: 'none',
        }}
        placeholder="eliminar"
      />
    </Modal>
  )
}
