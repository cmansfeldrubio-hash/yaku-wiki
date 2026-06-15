#!/usr/bin/env node
// Harness for the Lore agent — the ONLY way it may talk to the Yakutown
// wiki API. It exposes a tiny CRUD CLI over the resources listed in
// RESOURCES and nothing else: no arbitrary URLs, no other HTTP methods,
// no endpoints outside this allowlist. This keeps the agent's writes
// confined to what the API itself accepts/validates.

const fs = require('fs')
const path = require('path')

// --- load .env (no external deps) ---
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
  }
}
loadEnv()

const API_URL = process.env.API_URL || 'http://localhost:3001/api'
const TOKEN = process.env.LORE_AGENT_TOKEN || ''

// Resource name -> API path. The agent can only address these.
const RESOURCES = {
  characters: '/characters',
  locations: '/locations',
  events: '/events',
  glossary: '/glosario',
  factions: '/factions', // read-only reference data
}

// Resources the agent may only read (used to validate references).
const READONLY = new Set(['factions'])

const [, , resource, action, ...rest] = process.argv

function usage(msg) {
  if (msg) console.error(msg + '\n')
  console.error(`Uso:
  node tools/api.js <resource> list [search]
  node tools/api.js <resource> get <id>
  node tools/api.js <resource> get-by-slug <slug>
  node tools/api.js <resource> create '<json>'
  node tools/api.js <resource> update <id> '<json>'
  node tools/api.js <resource> delete <id>

resource: ${Object.keys(RESOURCES).join(', ')}
  (${[...READONLY].join(', ')} son de solo lectura)`)
  process.exit(1)
}

if (!resource || !RESOURCES[resource]) usage(`Recurso desconocido: ${resource || '(ninguno)'}`)
if (!action) usage('Falta la acción')

async function call(method, urlPath, body) {
  const res = await fetch(`${API_URL}${urlPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  if (!res.ok) {
    console.error(JSON.stringify({ error: true, status: res.status, data }, null, 2))
    process.exit(1)
  }
  console.log(JSON.stringify(data, null, 2))
}

function parseJson(str, label) {
  try {
    return JSON.parse(str)
  } catch {
    usage(`${label} debe ser JSON válido`)
  }
}

const base = RESOURCES[resource]

switch (action) {
  case 'list': {
    const search = rest[0]
    call('GET', `${base}${search ? `?search=${encodeURIComponent(search)}` : ''}`)
    break
  }
  case 'get': {
    const id = rest[0]
    if (!id) usage('Falta <id>')
    call('GET', `${base}/${id}`)
    break
  }
  case 'get-by-slug': {
    const slug = rest[0]
    if (!slug) usage('Falta <slug>')
    call('GET', `${base}/by-slug/${slug}`)
    break
  }
  case 'create': {
    if (READONLY.has(resource)) usage(`${resource} es de solo lectura`)
    const [json] = rest
    if (!json) usage('Falta el JSON del recurso a crear')
    call('POST', base, parseJson(json, 'El body'))
    break
  }
  case 'update': {
    if (READONLY.has(resource)) usage(`${resource} es de solo lectura`)
    const [id, json] = rest
    if (!id || !json) usage('Falta <id> o el JSON con los cambios')
    call('PUT', `${base}/${id}`, parseJson(json, 'El body'))
    break
  }
  case 'delete': {
    if (READONLY.has(resource)) usage(`${resource} es de solo lectura`)
    const [id] = rest
    if (!id) usage('Falta <id>')
    call('DELETE', `${base}/${id}`)
    break
  }
  default:
    usage(`Acción desconocida: ${action}`)
}
