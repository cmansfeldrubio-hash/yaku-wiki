import { API_URL, apiFetch, getToken } from './client'

export const getCharacters = ({ faction = '', search = '' } = {}) => {
  const params = new URLSearchParams()
  if (faction) params.set('faction', faction)
  if (search)  params.set('search', search)
  const qs = params.toString()
  return apiFetch(`/characters${qs ? '?' + qs : ''}`)
}

export const getCharacter = (id) =>
  apiFetch(`/characters/${id}`)

export const getCharacterBySlug = (slug) =>
  apiFetch(`/characters/by-slug/${slug}`)

export const createCharacter = (data) =>
  apiFetch('/characters', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateCharacter = (id, data) =>
  apiFetch(`/characters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteCharacter = (id) =>
  apiFetch(`/characters/${id}`, { method: 'DELETE' })

export const uploadImage = async (id, file) => {
  const formData = new FormData()
  formData.append('image', file)
  const token = getToken()
  const res = await fetch(`${API_URL}/characters/${id}/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error subiendo imagen')
  }
  return res.json()
}
