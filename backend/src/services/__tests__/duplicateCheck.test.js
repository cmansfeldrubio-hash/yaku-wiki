import { describe, it, expect, afterEach } from 'vitest'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const CharacterService = require('../CharacterService')
const LocationService   = require('../LocationService')

describe('Duplicate name/alias prevention across wiki entities', () => {
  const cleanup = []

  afterEach(async () => {
    while (cleanup.length) {
      const fn = cleanup.pop()
      await fn().catch(() => {})
    }
  })

  it('rejects creating a location with the same name as an existing one', async () => {
    const location = await LocationService.create({ name: 'Plaza Dup Test', description: '' })
    cleanup.push(() => LocationService.remove(location.id))

    await expect(LocationService.create({ name: 'Plaza Dup Test', description: '' }))
      .rejects.toMatchObject({ status: 409 })
  })

  it('rejects creating a character whose name collides with another entity', async () => {
    const location = await LocationService.create({ name: 'Lugar Cruzado Test', description: '' })
    cleanup.push(() => LocationService.remove(location.id))

    await expect(CharacterService.create({ name: 'Lugar Cruzado Test', faction: 'otro' }))
      .rejects.toMatchObject({ status: 409 })
  })

  it('rejects creating a character whose alias collides with an existing name', async () => {
    const location = await LocationService.create({ name: 'Alias Cruzado Test', description: '' })
    cleanup.push(() => LocationService.remove(location.id))

    await expect(CharacterService.create({ name: 'Personaje Unico Test', faction: 'otro', aliases: ['Alias Cruzado Test'] }))
      .rejects.toMatchObject({ status: 409 })
  })

  it('rejects renaming an entity to a name already used elsewhere', async () => {
    const locationA = await LocationService.create({ name: 'Renombrar A Test', description: '' })
    cleanup.push(() => LocationService.remove(locationA.id))
    const locationB = await LocationService.create({ name: 'Renombrar B Test', description: '' })
    cleanup.push(() => LocationService.remove(locationB.id))

    await expect(LocationService.update(locationB.id, { name: 'Renombrar A Test' }))
      .rejects.toMatchObject({ status: 409 })
  })

  it('allows updating an entity without changing its name', async () => {
    const location = await LocationService.create({ name: 'Sin Cambio Test', description: 'antes' })
    cleanup.push(() => LocationService.remove(location.id))

    const updated = await LocationService.update(location.id, { name: 'Sin Cambio Test', description: 'despues' })
    expect(updated.description).toBe('despues')
  })
})
