import { useState, useEffect } from 'react'
import { createTerm, updateTerm } from '../api/glossary'

const EMPTY = {
  name: '', description: '', tags: '',
}

export function useGlossaryForm(term) {
  const [fields, setFields] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (term) {
      setFields({
        name: term.name || '',
        description: term.description || '',
        tags: (term.tags || []).join(', '),
      })
    } else {
      setFields(EMPTY)
    }
  }, [term])

  const set = (key, value) => setFields(f => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!fields.name.trim()) throw new Error('El nombre es requerido')
    setSaving(true)
    try {
      const payload = {
        ...fields,
        tags: fields.tags ? fields.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      let saved
      if (term?.id) {
        saved = await updateTerm(term.id, payload)
      } else {
        saved = await createTerm(payload)
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { fields, set, handleSubmit, saving }
}
