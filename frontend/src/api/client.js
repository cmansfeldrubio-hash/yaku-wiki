export const API_URL = 'http://localhost:3001/api'

const TOKEN_KEY = 'yakutown_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

// Generic CRUD client for simple top-level resources (events, locations)
export function createResourceApi(resource) {
  return {
    getAll: ({ search = '' } = {}) => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const qs = params.toString()
      return apiFetch(`/${resource}${qs ? '?' + qs : ''}`)
    },

    getById: (id) => apiFetch(`/${resource}/${id}`),

    getBySlug: (slug) => apiFetch(`/${resource}/by-slug/${slug}`),

    create: (data) => apiFetch(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    update: (id, data) => apiFetch(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    remove: (id) => apiFetch(`/${resource}/${id}`, { method: 'DELETE' }),

    uploadImage: async (id, file) => {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_URL}/${resource}/${id}/image`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error subiendo imagen')
      }
      return res.json()
    },
  }
}
