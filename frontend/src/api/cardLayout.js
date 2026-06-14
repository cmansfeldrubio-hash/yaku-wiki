import { apiFetch } from './client'

export const getCardLayout = () => apiFetch('/card-layout')

export const updateCardLayout = (overrides) =>
  apiFetch('/card-layout', {
    method: 'PUT',
    body: JSON.stringify({ overrides }),
  })
