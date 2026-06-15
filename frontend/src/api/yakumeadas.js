import { createResourceApi } from './client'

export const yakumeadasApi = createResourceApi('yakumeadas')

export const getYakumeadas       = yakumeadasApi.getAll
export const getYakumeada        = yakumeadasApi.getById
export const getYakumeadaBySlug  = yakumeadasApi.getBySlug
export const createYakumeada     = yakumeadasApi.create
export const updateYakumeada     = yakumeadasApi.update
export const deleteYakumeada     = yakumeadasApi.remove
export const uploadYakumeadaImage = yakumeadasApi.uploadImage
