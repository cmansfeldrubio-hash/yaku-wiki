import { apiFetch } from './client'

export const getFactions = () => apiFetch('/factions')

export const createFaction = (data) =>
  apiFetch('/factions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
