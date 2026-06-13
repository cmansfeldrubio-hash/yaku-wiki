// Owner manages another user's role, and that user's access changes accordingly.
import { describe, it, expect, beforeEach } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Resolve the real db module path
const dbModulePath = require.resolve('../../data/db')

// In-memory mock db
let users
const mockDb = {
  getUsers:          async () => users,
  getUser:           async (id) => users.find(u => u.id === id) || null,
  getUserByGoogleId: async () => null,
  addUser:           async (user) => { users.push(user); return user },
  updateUser:        async (id, data) => {
    const i = users.findIndex(u => u.id === id)
    if (i === -1) return null
    users[i] = data
    return data
  },
}

// Inject mock into require cache BEFORE loading UserService/auth middleware
require.cache[dbModulePath] = {
  id: dbModulePath,
  filename: dbModulePath,
  loaded: true,
  exports: mockDb,
}

const UserService = require('../../services/UserService')
const { requireEditor, requireOwner, requireAuth } = require('../auth')

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

function run(middleware, user) {
  const req = { user }
  const res = mockRes()
  let nextCalled = false
  middleware(req, res, () => { nextCalled = true })
  return { res, nextCalled }
}

const OWNER_ID = 'owner-1'
const NEW_USER_ID = 'user-new'

describe('Owner editing the permissions of a new (mock) user', () => {
  beforeEach(() => {
    users = [
      { id: OWNER_ID, google_id: 'g-owner', email: 'owner@test.com', name: 'Owner', role: 'owner', created_at: 'x', updated_at: 'x' },
      { id: NEW_USER_ID, google_id: 'g-new', email: 'new@test.com', name: 'Nuevo Usuario', role: 'viewer', created_at: 'x', updated_at: 'x' },
    ]
  })

  it('a freshly registered user (viewer) cannot edit data', () => {
    const viewer = users.find(u => u.id === NEW_USER_ID)
    const { res, nextCalled } = run(requireEditor, viewer)

    expect(nextCalled).toBe(false)
    expect(res.statusCode).toBe(403)
  })

  it('a viewer cannot manage other users\' permissions', () => {
    const viewer = users.find(u => u.id === NEW_USER_ID)
    const { res, nextCalled } = run(requireOwner, viewer)

    expect(nextCalled).toBe(false)
    expect(res.statusCode).toBe(403)
  })

  it('the owner promotes the new user to editor', async () => {
    const updated = await UserService.updateRole(NEW_USER_ID, 'editor')

    expect(updated.role).toBe('editor')
    expect(users.find(u => u.id === NEW_USER_ID).role).toBe('editor')
  })

  it('once promoted to editor, the user can edit data but still cannot manage permissions', async () => {
    await UserService.updateRole(NEW_USER_ID, 'editor')
    const editor = users.find(u => u.id === NEW_USER_ID)

    const editAttempt = run(requireEditor, editor)
    expect(editAttempt.nextCalled).toBe(true)

    const permsAttempt = run(requireOwner, editor)
    expect(permsAttempt.nextCalled).toBe(false)
    expect(permsAttempt.res.statusCode).toBe(403)
  })

  it('promoted to admin, the user can edit data but still cannot manage permissions', async () => {
    await UserService.updateRole(NEW_USER_ID, 'admin')
    const admin = users.find(u => u.id === NEW_USER_ID)
    expect(admin.role).toBe('admin')

    const editAttempt = run(requireEditor, admin)
    expect(editAttempt.nextCalled).toBe(true)

    const permsAttempt = run(requireOwner, admin)
    expect(permsAttempt.nextCalled).toBe(false)
    expect(permsAttempt.res.statusCode).toBe(403)
  })

  it('the owner role cannot be assigned through updateRole', async () => {
    await expect(UserService.updateRole(NEW_USER_ID, 'owner')).rejects.toMatchObject({ status: 400 })
    expect(users.find(u => u.id === NEW_USER_ID).role).toBe('viewer')
  })

  it('the owner can always edit data and manage permissions', () => {
    const owner = users.find(u => u.id === OWNER_ID)

    expect(run(requireEditor, owner).nextCalled).toBe(true)
    expect(run(requireOwner, owner).nextCalled).toBe(true)
  })

  it('an unauthenticated request is rejected with 401', () => {
    const { res, nextCalled } = run(requireAuth, null)

    expect(nextCalled).toBe(false)
    expect(res.statusCode).toBe(401)
  })
})
