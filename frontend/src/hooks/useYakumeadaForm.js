import { useState, useEffect } from 'react'
import { createYakumeada, updateYakumeada, uploadYakumeadaImage } from '../api/yakumeadas'

const EMPTY = {
  name: '', excerpt: '', content: '', tags: '',
}

export function useYakumeadaForm(yakumeada) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (yakumeada) {
      setFields({
        name: yakumeada.name || '',
        excerpt: yakumeada.excerpt || '',
        content: yakumeada.content || '',
        tags: (yakumeada.tags || []).join(', '),
      })
      setPreviewUrl(yakumeada.image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [yakumeada])

  const set = (key, value) => setFields(f => ({ ...f, [key]: value }))

  const setImageFile = (file, url) => {
    setPendingImage(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!fields.name.trim()) throw new Error('El título es requerido')
    setSaving(true)
    try {
      const payload = {
        ...fields,
        tags: fields.tags ? fields.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      let saved
      if (yakumeada?.id) {
        saved = await updateYakumeada(yakumeada.id, payload)
        if (pendingImage) await uploadYakumeadaImage(yakumeada.id, pendingImage)
      } else {
        saved = await createYakumeada(payload)
        if (pendingImage && saved.id) {
          try { await uploadYakumeadaImage(saved.id, pendingImage) } catch (_) {}
        }
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, previewUrl, setImageFile, handleSubmit, saving }
}
