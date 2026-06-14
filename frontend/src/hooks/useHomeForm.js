import { useState, useEffect } from 'react'
import { updateHome, uploadHomeImage, uploadHomeAdImage } from '../api/home'

const EMPTY = { sections: [], ad_link_url: '' }

export function useHomeForm(home) {
  const [fields, setFields] = useState(EMPTY)
  const [pendingImage, setPendingImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [pendingAdImage, setPendingAdImage] = useState(null)
  const [adPreviewUrl, setAdPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (home) {
      setFields({
        sections: (home.sections || []).map(s => ({ title: s.title || '', content: s.content || '' })),
        ad_link_url: home.ad_link_url || '',
      })
      setPreviewUrl(home.banner_image_url || null)
      setAdPreviewUrl(home.ad_image_url || null)
    } else {
      setFields(EMPTY)
      setPreviewUrl(null)
      setAdPreviewUrl(null)
    }
    setPendingImage(null)
    setPendingAdImage(null)
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

  const setAdImageFile = (file, url) => {
    setPendingAdImage(file)
    setAdPreviewUrl(url)
  }

  const setAdLinkUrl = (value) => setFields(f => ({ ...f, ad_link_url: value }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let saved = await updateHome(fields)
      if (pendingImage) saved = await uploadHomeImage(pendingImage)
      if (pendingAdImage) saved = await uploadHomeAdImage(pendingAdImage)
      return saved
    } finally {
      setSaving(false)
    }
  }

  return {
    fields,
    previewUrl,
    adPreviewUrl,
    setImageFile,
    setAdImageFile,
    setAdLinkUrl,
    handleSubmit,
    saving,
    addSection,
    updateSection,
    removeSection,
  }
}
