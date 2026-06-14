import { apiFetch, createResourceApi } from './client'

export const glossaryApi = createResourceApi('glosario')

export const getTerms       = glossaryApi.getAll
export const getTerm        = glossaryApi.getById
export const getTermBySlug  = glossaryApi.getBySlug
export const createTerm     = glossaryApi.create
export const updateTerm     = glossaryApi.update
export const deleteTerm     = glossaryApi.remove
export const uploadTermImage = glossaryApi.uploadImage

export const deleteTag = (tag) =>
  apiFetch(`/glosario/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' })
