// Feature: character-page, Property 2: Slug lookup returns the correct character
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Validates: Requirements 6.1
 *
 * Property 2: Slug lookup returns the correct character (round-trip)
 * For any character in the database, findBySlug(character.slug) returns
 * an object identical to the original.
 */

// Generate a slug from a name (mirrors CharacterService.toSlug)
function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Set up CJS require so we can inject our mock db into the module cache
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Resolve the real db module path
const dbModulePath = require.resolve('../../data/db')

// Create our mock db with an in-memory store
let characters = []
const mockDb = {
  getCharacters: () => characters,
  getCharacter: (id) => characters.find(c => c.id === id) || null,
  addCharacter: (char) => { characters.push(char); return char },
  removeCharacter: (id) => {
    const i = characters.findIndex(c => c.id === id)
    if (i === -1) return null
    const [removed] = characters.splice(i, 1)
    return removed
  },
  updateCharacter: (id, data) => {
    const i = characters.findIndex(c => c.id === id)
    if (i === -1) return null
    characters[i] = data
    return data
  },
  getFactions: () => [],
  getFaction: () => null,
  addFaction: (f) => f,
}

// Inject mock into require cache BEFORE loading CharacterRepository
require.cache[dbModulePath] = {
  id: dbModulePath,
  filename: dbModulePath,
  loaded: true,
  exports: mockDb,
}

// Now load CharacterRepository - it will get our mock db
const CharacterRepository = require('../CharacterRepository')

// Arbitrary that generates valid character objects ready for insertion
const arbitraryCharacter = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 })
    .filter(n => toSlug(n.trim()).length > 0)
    .map(n => n.trim()),
  aliases: fc.array(fc.string({ minLength: 1, maxLength: 40 }), { maxLength: 3 }),
  origin: fc.string({ maxLength: 40 }),
  faction: fc.constantFrom('yakuma', 'seis-siniestros', 'npc', 'otro'),
  status: fc.constantFrom('activo', 'leyenda', 'antagonista', 'sospechoso', 'desconocido'),
  yakuma_title: fc.boolean(),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  description: fc.string({ maxLength: 200 }),
  hito: fc.string({ maxLength: 100 }),
  poder: fc.string({ maxLength: 100 }),
  relaciones: fc.constant([]),
  image_url: fc.constant(''),
}).map(raw => {
  const now = new Date().toISOString()
  return {
    ...raw,
    id: crypto.randomUUID(),
    slug: toSlug(raw.name),
    created_at: now,
    updated_at: now,
  }
})

describe('Property 2: Slug lookup returns the correct character (round-trip)', () => {
  it('findBySlug(character.slug) returns the same character that was inserted', async () => {
    await fc.assert(
      fc.asyncProperty(arbitraryCharacter, async (character) => {
        // Clear the store for this property iteration
        characters.length = 0

        // Insert the character into the mock db
        characters.push(character)

        // Look it up by slug via the real CharacterRepository
        const found = await CharacterRepository.findBySlug(character.slug)

        // Verify round-trip: found object must be identical to original
        expect(found).not.toBeNull()
        expect(found.id).toBe(character.id)
        expect(found.slug).toBe(character.slug)
        expect(found.name).toBe(character.name)
        expect(found.aliases).toEqual(character.aliases)
        expect(found.origin).toBe(character.origin)
        expect(found.faction).toBe(character.faction)
        expect(found.status).toBe(character.status)
        expect(found.yakuma_title).toBe(character.yakuma_title)
        expect(found.description).toBe(character.description)
        expect(found.hito).toBe(character.hito)
        expect(found.poder).toBe(character.poder)
        expect(found.image_url).toBe(character.image_url)
        expect(found.tags).toEqual(character.tags)
        expect(found.relaciones).toEqual(character.relaciones)
        expect(found.created_at).toBe(character.created_at)
        expect(found.updated_at).toBe(character.updated_at)
      }),
      { numRuns: 100 }
    )
  })
})
