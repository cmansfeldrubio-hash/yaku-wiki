import { useState, useEffect } from 'react'
import { createCharacter, updateCharacter, uploadImage } from '../api/characters'

const EMPTY = {
  name: '', alias: '', origin: '', faction: 'yakuma',
  status: 'activo', tags: '', yakuma_title: false,
  description: '', hito: '', poder: '', sections: [],
}

export function useCharacterForm(character) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (character) {
      setFields({
        name: character.name || '',
        alias: character.alias || '',
        origin: character.origin || '',
        faction: character.faction || 'yakuma',
        status: character.status || 'activo',
        tags: (character.tags || []).join(', '),
        yakuma_title: !!character.yakuma_title,
        description: character.description || '',
        hito: character.hito || '',
        poder: character.poder || '',
        sections: (character.sections || []).map(s => ({ title: s.title || '', content: s.content || '' })),
      })
      setPreviewUrl(character.image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [character])

  const set = (key, value) => setFields(f => ({ ...f, [key]: value }))

  const addSection = () => setFields(f => ({ ...f, sections: [...f.sections, { title: '', content: '' }] }))

  const updateSection = (index, key, value) => setFields(f => ({
    ...f,
    sections: f.sections.map((s, i) => i === index ? { ...s, [key]: value } : s),
  }))

  const removeSection = (index) => setFields(f => ({
    ...f,
    sections: f.sections.filter((_, i) => i !== index),
  }))

  const setImageFile = (file, url) => {
    setPendingImage(file)
    setPreviewUrl(url)
  }

  const reset = () => {
    setFields(EMPTY)
    setPendingImage(null)
    setPreviewUrl(null)
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
      if (character?.id) {
        saved = await updateCharacter(character.id, payload)
        if (pendingImage) await uploadImage(character.id, pendingImage)
      } else {
        saved = await createCharacter(payload)
        if (pendingImage && saved.id) {
          try { await uploadImage(saved.id, pendingImage) } catch (_) {}
        }
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, previewUrl, setImageFile, handleSubmit, saving, reset, addSection, updateSection, removeSection }
}
