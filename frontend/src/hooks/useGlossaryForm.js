import { useState, useEffect } from 'react'
import { createTerm, updateTerm, uploadTermImage } from '../api/glossary'

const EMPTY = {
  name: '', description: '', tags: [],
}

export function useGlossaryForm(term) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (term) {
      setFields({
        name: term.name || '',
        description: term.description || '',
        tags: term.tags ? [...term.tags] : [],
      })
      setPreviewUrl(term.image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [term])

  const set = (key, value) => setFields(f => ({ ...f, [key]: value }))

  const toggleTag = (tag) => setFields(f => ({
    ...f,
    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
  }))

  const addTag = (tag) => {
    const clean = tag.trim()
    if (!clean) return
    setFields(f => f.tags.includes(clean) ? f : { ...f, tags: [...f.tags, clean] })
  }

  const removeTagFromFields = (tag) => setFields(f => ({
    ...f,
    tags: f.tags.filter(t => t !== tag),
  }))

  const setImageFile = (file, url) => {
    setPendingImage(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!fields.name.trim()) throw new Error('El nombre es requerido')
    setSaving(true)
    try {
      const payload = { ...fields }
      let saved
      if (term?.id) {
        saved = await updateTerm(term.id, payload)
        if (pendingImage) await uploadTermImage(term.id, pendingImage)
      } else {
        saved = await createTerm(payload)
        if (pendingImage && saved.id) {
          try { await uploadTermImage(saved.id, pendingImage) } catch (_) {}
        }
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, toggleTag, addTag, removeTagFromFields, previewUrl, setImageFile, handleSubmit, saving }
}
