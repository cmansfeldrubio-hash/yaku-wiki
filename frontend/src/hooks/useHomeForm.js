import { useState, useEffect } from 'react'
import { updateHome, uploadHomeImage } from '../api/home'

const EMPTY = { sections: [] }

export function useHomeForm(home) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (home) {
      setFields({
        sections: (home.sections || []).map(s => ({ title: s.title || '', content: s.content || '' })),
      })
      setPreviewUrl(home.banner_image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
    }
    setPendingImage(null)
  }, [home])

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

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let saved = await updateHome(fields)
      if (pendingImage) saved = await uploadHomeImage(pendingImage)
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, previewUrl, setImageFile, handleSubmit, saving, addSection, updateSection, removeSection }
}
