import { API_URL, apiFetch, getToken } from './client'

export const getMemes = () => apiFetch('/memes')

export const uploadMeme = async ({ file, caption = '', characterIds = [], eventIds = [], locationIds = [] }) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('caption', caption)
  formData.append('character_ids', JSON.stringify(characterIds))
  formData.append('event_ids', JSON.stringify(eventIds))
  formData.append('location_ids', JSON.stringify(locationIds))
  const token = getToken()
  let res
  try {
    res = await fetch(`${API_URL}/memes`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
  } catch {
    // The request can fail at the network/CORS level (e.g. the server
    // rejects oversized bodies before our code runs) without a JSON response.
    throw new Error('No se pudo subir el archivo. Puede que sea demasiado pesado (máx. 4MB).')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error subiendo el meme')
  }
  return res.json()
}

export const toggleMemeLike = (id) =>
  apiFetch(`/memes/${id}/like`, { method: 'POST' })

export const updateMeme = (id, data) =>
  apiFetch(`/memes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deleteMeme = (id) =>
  apiFetch(`/memes/${id}`, { method: 'DELETE' })
