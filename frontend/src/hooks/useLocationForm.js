import { useState, useEffect } from 'react'
import { createLocation, updateLocation, uploadLocationImage } from '../api/locations'

const EMPTY = {
  name: '', description: '', type: '', tags: '',
}

export function useLocationForm(location) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (location) {
      setFields({
        name: location.name || '',
        description: location.description || '',
        type: location.type || '',
        tags: (location.tags || []).join(', '),
      })
      setPreviewUrl(location.image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [location])

  const set = (key, value) => setFields(f => ({ ...f, [key]: value }))

  const setImageFile = (file, url) => {
    setPendingImage(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!fields.name.trim()) throw new Error('El nombre es requerido')
    setSaving(true)
    try {
      const payload = {
        ...fields,
        tags: fields.tags ? fields.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      let saved
      if (location?.id) {
        saved = await updateLocation(location.id, payload)
        if (pendingImage) await uploadLocationImage(location.id, pendingImage)
      } else {
        saved = await createLocation(payload)
        if (pendingImage && saved.id) {
          try { await uploadLocationImage(saved.id, pendingImage) } catch (_) {}
        }
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, previewUrl, setImageFile, handleSubmit, saving }
}
