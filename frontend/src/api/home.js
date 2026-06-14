import { API_URL, apiFetch, getToken } from './client'

export const getHome = () =>
  apiFetch('/home')

export const updateHome = (data) =>
  apiFetch('/home', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const uploadHomeImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const token = getToken()
  const res = await fetch(`${API_URL}/home/image`, {
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

export const uploadHomeAdImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const token = getToken()
  const res = await fetch(`${API_URL}/home/ad-image`, {
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
