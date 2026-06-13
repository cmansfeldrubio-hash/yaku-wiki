// Feature: character-page, Property 3: Non-existent slug returns 404
// **Validates: Requirements 6.2**

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// Dynamic require for CommonJS modules
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const CharacterService = require('./CharacterService')
const CharacterRepository = require('../repositories/CharacterRepository')

describe('Property 3: Non-existent slug returns 404', () => {
  it('getBySlug(slug) throws with status 404 for any slug not matching an existing character', async () => {
    // Get all existing slugs from the repository
    const existingCharacters = await CharacterRepository.findAll()
    const existingSlugs = new Set(existingCharacters.map(c => c.slug))

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(slug => !existingSlugs.has(slug)),
        async (slug) => {
          try {
            await CharacterService.getBySlug(slug)
            // If it didn't throw, the property is violated
            expect.fail('Expected getBySlug to throw for non-existent slug: ' + slug)
          } catch (err) {
            expect(err).toBeInstanceOf(Error)
            expect(err.status).toBe(404)
            expect(err.message).toBe('Personaje no encontrado')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
