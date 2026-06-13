// Feature: character-page, Property 1: Character page displays all non-empty fields
// **Validates: Requirements 2.1**

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CharacterPage from './CharacterPage'

// Mock the useCharacterBySlug hook
const mockCharacterData = { character: null, loading: false, error: null, retry: vi.fn() }
vi.mock('../hooks/useCharacterBySlug', () => ({
  useCharacterBySlug: () => mockCharacterData,
}))

// Mock useToast
vi.mock('../hooks/useToast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'editor' }, canEdit: true, isOwner: false }),
}))

// Valid factions and statuses from the project constants
const VALID_FACTIONS = ['yakuma', 'seis-siniestros', 'npc', 'otro']
const VALID_STATUSES = ['activo', 'leyenda', 'antagonista', 'sospechoso', 'desconocido']

// Faction labels as they appear in the UI
const FACTION_LABELS = {
  yakuma: 'Yakuma',
  'seis-siniestros': 'Los Seis Siniestros',
  npc: 'NPC',
  otro: 'Otro',
}

/**
 * Arbitrary that generates a non-empty alphanumeric string (no special chars that
 * could cause matching issues in the DOM).
 */
const nonEmptyString = () =>
  fc.stringMatching(/^[a-zA-Z0-9 ]{1,30}$/).filter(s => s.trim().length > 0).map(s => s.trim())

/**
 * Arbitrary that generates a valid slug (lowercase letters, digits, hyphens).
 */
const slugArbitrary = () =>
  fc.stringMatching(/^[a-z][a-z0-9-]{2,19}$/)

/**
 * Arbitrary that generates a valid character object with all display fields non-empty.
 */
const characterArbitrary = () =>
  fc.record({
    id: fc.uuid(),
    slug: slugArbitrary(),
    name: nonEmptyString(),
    alias: nonEmptyString(),
    origin: nonEmptyString(),
    faction: fc.constantFrom(...VALID_FACTIONS),
    status: fc.constantFrom(...VALID_STATUSES),
    yakuma_title: fc.boolean(),
    description: nonEmptyString(),
    hito: nonEmptyString(),
    poder: nonEmptyString(),
    tags: fc.array(nonEmptyString(), { minLength: 1, maxLength: 5 }),
    image_url: fc.constant(''),
    relaciones: fc.constant([]),
    created_at: fc.constant(new Date().toISOString()),
    updated_at: fc.constant(new Date().toISOString()),
  })

function renderCharacterPage(character) {
  // Set the mock data for this render
  mockCharacterData.character = character
  mockCharacterData.loading = false
  mockCharacterData.error = null

  return render(
    <MemoryRouter initialEntries={[`/personaje/${character.slug}`]}>
      <Routes>
        <Route path="/personaje/:slug" element={<CharacterPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Property 1: Character page displays all non-empty fields', () => {
  it('should display all non-empty character fields in the rendered output', () => {
    fc.assert(
      fc.property(characterArbitrary(), (character) => {
        const { container } = renderCharacterPage(character)
        const textContent = container.textContent

        // Name must appear
        expect(textContent).toContain(character.name)

        // Alias must appear
        expect(textContent).toContain(character.alias)

        // Origin must appear
        expect(textContent).toContain(character.origin)

        // Faction label must appear (rendered as the label, not the key)
        const factionLabel = FACTION_LABELS[character.faction]
        expect(textContent).toContain(factionLabel)

        // Status must appear (rendered directly as the status string)
        expect(textContent).toContain(character.status)

        // Description must appear
        expect(textContent).toContain(character.description)

        // Hito must appear
        expect(textContent).toContain(character.hito)

        // Poder must appear
        expect(textContent).toContain(character.poder)

        // All tags must appear
        for (const tag of character.tags) {
          expect(textContent).toContain(tag)
        }
      }),
      { numRuns: 100 }
    )
  })
})
