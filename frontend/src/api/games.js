import { createResourceApi } from './client'

export const gamesApi = createResourceApi('games')

export const getGames       = gamesApi.getAll
export const getGame        = gamesApi.getById
export const createGame     = gamesApi.create
export const updateGame     = gamesApi.update
export const deleteGame     = gamesApi.remove
export const uploadGameImage = gamesApi.uploadImage
