import { createResourceApi } from './client'

export const locationsApi = createResourceApi('locations')

export const getLocations        = locationsApi.getAll
export const getLocation         = locationsApi.getById
export const getLocationBySlug   = locationsApi.getBySlug
export const createLocation      = locationsApi.create
export const updateLocation      = locationsApi.update
export const deleteLocation      = locationsApi.remove
export const uploadLocationImage = locationsApi.uploadImage
