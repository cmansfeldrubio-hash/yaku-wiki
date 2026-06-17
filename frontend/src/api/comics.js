import { API_URL, apiFetch, getToken } from './client'

async function multipartFetch(path, method, fields, file, fileField = 'cover') {
  const formData = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) formData.append(k, v)
  }
  if (file) formData.append(fileField, file)
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

export const comicsApi = {
  list: () => apiFetch('/comics'),

  getBySlug: (slug) => apiFetch(`/comics/${slug}`),

  create: ({ title, format, description, cover }) =>
    multipartFetch('/comics', 'POST', { title, format, description }, cover),

  update: (id, { title, format, description, cover }) =>
    multipartFetch(`/comics/${id}`, 'PUT', { title, format, description }, cover),

  remove: (id) => apiFetch(`/comics/${id}`, { method: 'DELETE' }),

  addPage: (comicId, file) =>
    multipartFetch(`/comics/${comicId}/pages`, 'POST', {}, file, 'image'),

  removePage: (comicId, pageId) =>
    apiFetch(`/comics/${comicId}/pages/${pageId}`, { method: 'DELETE' }),

  reorderPages: (comicId, order) =>
    apiFetch(`/comics/${comicId}/pages/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ order }),
    }),
}
