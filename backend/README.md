# Yakutown API

Backend de la wiki de Yakutown. Node.js + Express, organizado en capas. Mismo contrato de endpoints que el backend original, con persistencia en disco y arquitectura que separa responsabilidades.

---

## Stack

- **Node.js + Express**
- **Multer** — upload de imágenes
- **UUID** — generación de IDs
- **Persistencia**: `db.json` en disco (sin base de datos externa)

---

## Setup

```bash
npm install
npm start
```

Con hot-reload (Node 18+):

```bash
npm run dev
```

El servidor levanta en `http://localhost:3001`. Al primer arranque genera `db.json` con los 25 personajes y 4 facciones del seed. Las imágenes subidas se guardan en `uploads/`.

---

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/characters` | Listar personajes. Query: `?faction=` `?search=` |
| GET | `/api/characters/:id` | Obtener uno por ID |
| POST | `/api/characters` | Crear personaje |
| PUT | `/api/characters/:id` | Reemplazar personaje completo |
| PATCH | `/api/characters/:id` | Actualización parcial |
| DELETE | `/api/characters/:id` | Eliminar |
| POST | `/api/characters/:id/image` | Subir imagen (`multipart/form-data`, campo `image`) |
| GET | `/api/factions` | Listar facciones con conteo de personajes |
| POST | `/api/factions` | Crear facción |
| GET | `/api/stats` | Stats globales |

Las imágenes quedan accesibles en `/uploads/:filename`.

### Ejemplo — crear personaje

```json
POST /api/characters
{
  "name": "Nuevo Yakuma",
  "alias": "El Nuevo",
  "origin": "Maipú",
  "faction": "yakuma",
  "status": "activo",
  "yakuma_title": true,
  "tags": ["nuevo", "misterioso"],
  "description": "...",
  "hito": "...",
  "poder": "..."
}
```

### Ejemplo — crear facción

```json
POST /api/factions
{
  "label": "Los Inmortales",
  "color": "#ff8800"
}
```

---

## Estructura

```
yakutown-api/
├── server.js                         ← entry point, solo llama app.listen()
├── db.json                           ← base de datos (generado al primer arranque)
├── uploads/                          ← imágenes subidas
│
└── src/
    ├── app.js                        ← Express app, middleware global, monta rutas
    │
    ├── data/                         ← capa de persistencia
    │   ├── db.js                     ← singleton en memoria + lectura/escritura a db.json
    │   └── seed.js                   ← 25 personajes y 4 facciones iniciales
    │
    ├── repositories/                 ← capa de acceso a datos
    │   ├── CharacterRepository.js    ← CRUD sobre db, sin lógica de negocio
    │   └── FactionRepository.js
    │
    ├── services/                     ← capa de lógica de negocio
    │   ├── CharacterService.js       ← validación, sanitización, slugs, imagen
    │   ├── FactionService.js         ← validación, control de duplicados
    │   └── StatsService.js           ← cómputo de métricas
    │
    ├── controllers/                  ← capa HTTP
    │   ├── CharacterController.js    ← parsea request, llama service, envía response
    │   ├── FactionController.js
    │   └── StatsController.js
    │
    ├── routes/                       ← declaración de rutas
    │   ├── characters.js             ← monta upload middleware en POST /:id/image
    │   ├── factions.js
    │   └── stats.js
    │
    └── middleware/
        ├── upload.js                 ← configuración de multer (storage, fileFilter, límite 5MB)
        └── errorHandler.js           ← captura errores y responde JSON consistente
```

---

## Capas

El proyecto sigue un flujo unidireccional: cada capa solo conoce a la que está inmediatamente abajo, nunca hacia arriba.

```
routes → controllers → services → repositories → data/db
```

**`data/`** — persistencia pura. `db.js` es un singleton que carga `db.json` al arrancar y lo reescribe en cada mutación. `seed.js` tiene los datos iniciales sin ids ni timestamps — esos los agrega `db.js` al primer arranque.

**`repositories/`** — acceso a datos sin lógica de negocio. Las queries (filtrar, buscar) viven acá, pero no la validación ni la construcción de entidades. Si mañana se reemplaza `db.json` por SQLite o Postgres, solo cambia esta capa.

**`services/`** — toda la lógica de negocio. Validaciones, construcción de entidades, reglas como "no se puede crear una facción duplicada" o "el slug se deriva del nombre". Los servicios lanzan errores con `.status` para que el error handler los convierta en respuestas HTTP correctas.

**`controllers/`** — capa HTTP delgada. Extrae parámetros del request, llama al service, responde. No tiene lógica propia. El helper `wrap()` convierte handlers async en middleware compatible con Express sin try/catch en cada función.

**`routes/`** — declaración de URLs y verbos HTTP. Monta middlewares específicos por ruta (ej: `upload.single('image')` solo en el endpoint de imagen).

**`middleware/`** — piezas transversales. El `errorHandler` centraliza todas las respuestas de error: cualquier error lanzado en cualquier capa llega acá y sale como `{ error: "mensaje" }` con el status correcto.

---

## Agregar un nuevo endpoint

1. Si tiene lógica nueva → agregar método en el Service correspondiente
2. Agregar método en el Controller (extraer params, llamar service, `res.json`)
3. Agregar la ruta en el archivo de routes

Si es un recurso completamente nuevo (ej: `arcos`):

1. Agregar colección en `data/db.js` y seed opcional en `data/seed.js`
2. Crear `repositories/ArcoRepository.js`
3. Crear `services/ArcoService.js`
4. Crear `controllers/ArcoController.js`
5. Crear `routes/arcos.js`
6. Montar en `app.js`: `app.use('/api/arcos', arcoRoutes)`

---

## Persistencia

`db.json` se crea automáticamente al primer arranque. Es un archivo JSON plano — editable a mano si es necesario. Se reescribe completo en cada mutación (create, update, delete, imagen).

Para migrar a una base de datos real en el futuro, el único cambio necesario está en `repositories/` — los servicios y controladores no necesitan modificarse.
