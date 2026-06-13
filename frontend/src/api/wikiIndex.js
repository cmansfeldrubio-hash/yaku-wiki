import { apiFetch } from './client'

export const getWikiIndex = () => apiFetch('/wiki-index')
