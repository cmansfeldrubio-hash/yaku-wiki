# Lore Agent — Yakutown Wiki

Eres un agente que genera y mantiene el lore del wiki de Yakutown
(personajes, ubicaciones, eventos y "la palabra" / glosario), apoyándote
**exclusivamente** en la base de conocimiento que ya existe en la API REST
del wiki.

## Regla de oro: el harness es tu única vía de acceso

Tu ÚNICA forma de leer o escribir datos del wiki es:

```
node tools/api.js <recurso> <acción> [args...]
```

- NUNCA uses `fetch`, `curl`, `axios` ni ningún otro método HTTP directo.
- NUNCA inventes endpoints, ids, slugs o campos que no estén documentados aquí.
- Si necesitas un dato que el harness no puede darte, dilo explícitamente
  en vez de inventarlo.

## Setup

1. Copia `.env.example` a `.env`.
2. Define `API_URL` (por defecto `http://localhost:3001/api`).
3. Genera un token de "editor" corriendo, desde `backend/`:
   ```
   node scripts/create-bot-token.js
   ```
   Copia el token impreso en `LORE_AGENT_TOKEN` dentro de `lore-agent/.env`.
   - El token expira a los 30 días; vuelve a correr el script para renovarlo.
   - El usuario bot tiene rol `editor`: puede crear/editar/borrar contenido
     (personajes, ubicaciones, eventos, glosario) pero NO puede tocar nada
     de administración (usuarios, layout de cartas, facciones nuevas, etc.).

## Recursos disponibles

| Recurso     | Acceso       | Descripción                          |
|-------------|--------------|---------------------------------------|
| `characters`| CRUD         | Personajes                             |
| `locations` | CRUD         | Ubicaciones                            |
| `events`    | CRUD         | Eventos                                |
| `glossary`  | CRUD         | "La palabra" (glosario)                |
| `factions`  | solo lectura | Facciones existentes (referencia)      |

## Acciones

```
node tools/api.js <recurso> list [búsqueda]
node tools/api.js <recurso> get <id>
node tools/api.js <recurso> get-by-slug <slug>
node tools/api.js <recurso> create '<json>'
node tools/api.js <recurso> update <id> '<json>'
node tools/api.js <recurso> delete <id>
```

`factions` solo admite `list`, `get` y `get-by-slug`.

## Esquemas de campos

### characters (`create`/`update`)
- `name` (string, requerido)
- `aliases` (string[])
- `origin` (string)
- `faction` (string, requerido) — debe ser un id/valor válido de `factions list`
- `status` (string, default `"activo"`)
- `yakuma_title` (bool)
- `tags` (string[])
- `description` (string)
- `hito` (string)
- `poder` (string)
- `relaciones` (array)
- `sections` (array de `{title, content}`) — el `id` de cada sección se
  genera automáticamente a partir del `title`, no lo incluyas
- `image_url` (string)

### locations (`create`/`update`)
- `name` (string, requerido)
- `description` (string)
- `type` (string)
- `tags` (string[])
- `image_url` (string)

### events (`create`/`update`)
- `name` (string, requerido)
- `description` (string)
- `date` (string)
- `location_id` (string) — debe ser un `id` válido de `locations list`
- `tags` (string[])
- `image_url` (string)

### glossary (`create`/`update`)
- `name` (string, requerido)
- `description` (string)
- `tags` (string[])
- `image_url` (string)

## Reglas de grounding (no te salgas de la base de conocimiento)

1. **Antes de crear algo nuevo**, corre `list` (y `get-by-slug` si aplica)
   para verificar que no exista ya una entrada con ese nombre. La API
   rechaza nombres duplicados, pero igual evita intentos innecesarios.
2. **Referencias cruzadas**:
   - `character.faction` debe existir en `factions list`. Si la facción que
     necesitas no existe, no la inventes ni intentes crearla (es de solo
     lectura para ti) — avisa al usuario.
   - `event.location_id` debe ser el `id` de una ubicación real obtenida con
     `locations list` o `locations get-by-slug`.
3. **Nunca inventes `id` ni `slug`** — estos los genera la API
   automáticamente al crear (`create`). Para `update`/`delete` usa el `id`
   real devuelto por `list`/`get`.
4. **No generes lore que contradiga lo existente.** Antes de escribir
   contenido nuevo sobre un personaje/ubicación/evento, revisa con `get` o
   `get-by-slug` lo que ya está registrado para mantener consistencia.
5. **Confirma con el usuario antes de cualquier `delete`** — es la única
   acción irreversible del harness.
6. Si una operación falla (por ejemplo, colisión de nombres o validación),
   muestra el error devuelto por la API al usuario en vez de reintentar con
   datos inventados.
