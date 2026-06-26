import { useState, useEffect } from 'react'
import { createGame, updateGame, uploadGameImage } from '../api/games'

const EMPTY = {
  name: '', description: '', url: '',
}

export function useGameForm(game) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (game) {
      setFields({
        name: game.name || '',
        description: game.description || '',
        url: game.url || '',
      })
      setPreviewUrl(game.image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [game])

  const set = (key, value) => setFields(f => ({ ...f, [key]: value }))

  const setImageFile = (file, url) => {
    setPendingImage(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!fields.name.trim()) throw new Error('El nombre es requerido')
    if (!fields.url.trim()) throw new Error('La URL es requerida')
    setSaving(true)
    try {
      let saved
      if (game?.id) {
        saved = await updateGame(game.id, fields)
        if (pendingImage) await uploadGameImage(game.id, pendingImage)
      } else {
        saved = await createGame(fields)
        if (pendingImage && saved.id) {
          try { await uploadGameImage(saved.id, pendingImage) } catch (_) {}
        }
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, previewUrl, setImageFile, handleSubmit, saving }
}
