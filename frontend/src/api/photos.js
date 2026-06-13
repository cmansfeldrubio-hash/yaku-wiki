import { API_URL, apiFetch, getToken } from './client'

export const getPhotos = ({ characterId = '', eventId = '', locationId = '' } = {}) => {
  const params = new URLSearchParams()
  if (characterId) params.set('characterId', characterId)
  if (eventId) params.set('eventId', eventId)
  if (locationId) params.set('locationId', locationId)
  const qs = params.toString()
  return apiFetch(`/photos${qs ? '?' + qs : ''}`)
}

export const uploadPhoto = async ({ file, caption = '', characterIds = [], eventIds = [], locationIds = [] }) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('caption', caption)
  formData.append('character_ids', JSON.stringify(characterIds))
  formData.append('event_ids', JSON.stringify(eventIds))
  formData.append('location_ids', JSON.stringify(locationIds))
  const token = getToken()
  const res = await fetch(`${API_URL}/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error subiendo la foto')
  }
  return res.json()
}

export const updatePhoto = (id, data) =>
  apiFetch(`/photos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deletePhoto = (id) =>
  apiFetch(`/photos/${id}`, { method: 'DELETE' })
