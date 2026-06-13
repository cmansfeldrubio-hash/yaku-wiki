import { useState, useEffect } from 'react'
import { createEvent, updateEvent, uploadEventImage } from '../api/events'

const EMPTY = {
  name: '', description: '', date: '', location_id: '', tags: '',
}

export function useEventForm(event) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (event) {
      setFields({
        name: event.name || '',
        description: event.description || '',
        date: event.date || '',
        location_id: event.location_id || '',
        tags: (event.tags || []).join(', '),
      })
      setPreviewUrl(event.image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [event])

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
      if (event?.id) {
        saved = await updateEvent(event.id, payload)
        if (pendingImage) await uploadEventImage(event.id, pendingImage)
      } else {
        saved = await createEvent(payload)
        if (pendingImage && saved.id) {
          try { await uploadEventImage(saved.id, pendingImage) } catch (_) {}
        }
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, previewUrl, setImageFile, handleSubmit, saving }
}
