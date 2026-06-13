import { apiFetch } from './client'

export const loginWithGoogle = (credential) =>
  apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })

export const getMe = () => apiFetch('/auth/me')

export const getUsers = () => apiFetch('/users')

export const updateUserRole = (id, role) =>
  apiFetch(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
