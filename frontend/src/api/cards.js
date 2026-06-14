import { API_URL, apiFetch, getToken } from './client'

export const getCards = () => apiFetch('/cards')

export const getCard = (id) => apiFetch(`/cards/${id}`)

export const createCard = async ({ file, cardType, name, subtype, rarity, cost, effectText, characterId }) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('card_type', cardType)
  formData.append('name', name)
  formData.append('subtype', subtype || '')
  formData.append('rarity', rarity)
  formData.append('cost', String(cost))
  formData.append('effect_text', effectText || '')
  if (characterId) formData.append('character_id', characterId)

  const token = getToken()
  const res = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error guardando la carta')
  }
  return res.json()
}

export const deleteCard = (id) =>
  apiFetch(`/cards/${id}`, { method: 'DELETE' })
