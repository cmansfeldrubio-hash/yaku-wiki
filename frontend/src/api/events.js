import { createResourceApi } from './client'

export const eventsApi = createResourceApi('events')

export const getEvents       = eventsApi.getAll
export const getEvent        = eventsApi.getById
export const getEventBySlug  = eventsApi.getBySlug
export const createEvent     = eventsApi.create
export const updateEvent     = eventsApi.update
export const deleteEvent     = eventsApi.remove
export const uploadEventImage = eventsApi.uploadImage
