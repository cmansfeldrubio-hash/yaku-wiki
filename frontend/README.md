# Yakutown Wiki — Frontend

Frontend de la wiki de personajes del universo Yakutown. React + Vite, organizado en capas. Santiago, década 2010.

---

## Stack

- **React 18** con Vite
- **CSS Modules** — un `.module.css` por componente
- **Sin librerías de UI externas**
- Tipografías: Space Grotesk + Space Mono (Google Fonts)

---

## Setup

```bash
npm install
npm run dev
```

Requiere el backend corriendo en `http://localhost:3001`. Si usás otro puerto, cambiá `API_URL` en `src/api/client.js`.

Para producción:

```bash
npm run build
```

La carpeta `dist/` queda lista para servir estáticamente.

---

## Estructura

```
src/
├── main.jsx                          ← entry point, monta ToastProvider + App
├── App.jsx                           ← layout raíz, orquesta modales y estado global
├── App.module.css
│
├── api/                              ← capa de datos
│   ├── client.js                     ← base URL y helper apiFetch()
│   ├── characters.js                 ← CRUD de personajes + upload de imagen
│   ├── factions.js                   ← GET y POST facciones
│   └── stats.js                      ← GET stats del header
│
├── hooks/                            ← capa de lógica
│   ├── useCharacters.js              ← lista con filtro por facción y búsqueda
│   ├── useCharacterForm.js           ← estado del formulario, validación, submit
│   ├── useFactions.js                ← facciones con conteos
│   ├── useStats.js                   ← stats para el header
│   └── useToast.jsx                  ← context + provider del sistema de notificaciones
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx                ← logo + stats globales
│   │   └── Sidebar.jsx               ← filtros de facción + acciones
│   │
│   ├── character/
│   │   ├── CharacterGrid.jsx         ← grid responsivo, maneja estados loading/error/vacío
│   │   ├── CharacterCard.jsx         ← card individual con imagen/avatar, tags y acciones
│   │   ├── CharacterDetail.jsx       ← vista completa dentro del modal de detalle
│   │   └── CharacterForm.jsx         ← formulario create/edit con preview de imagen
│   │
│   ├── faction/
│   │   └── FactionForm.jsx           ← formulario de nueva facción con color picker
│   │
│   └── ui/
│       ├── Modal.jsx                 ← wrapper genérico de modal (overlay + animación)
│       ├── SearchInput.jsx           ← input con debounce de 300ms interno
│       ├── Avatar.jsx                ← iniciales con color por facción
│       ├── StatusBadge.jsx           ← badges de estado y título yakuma
│       └── DeleteConfirmModal.jsx    ← confirmación con input de texto "eliminar"
│
├── constants/
│   └── factions.js                   ← colores, labels y helpers por facción y status
│
└── styles/
    └── global.css                    ← variables CSS, reset, body
```

---

## Capas

El proyecto separa responsabilidades en tres capas que no se mezclan entre sí.

**`api/`** — funciones puras que hablan con el backend. No tienen estado ni importan React. Si el día de mañana cambia la URL base, se agrega autenticación, o se migra a otra API, solo se toca esta capa.

**`hooks/`** — toda la lógica de estado y efectos. Los componentes no hacen fetch directamente ni manejan `loading`/`error` por su cuenta — eso es trabajo de los hooks. `useCharacterForm` en particular absorbe el flujo completo de create/edit incluyendo el upload de imagen.

**`components/`** — solo UI. Reciben props, renderizan, llaman handlers. Ningún componente hace fetch directamente.

---

## Flujos principales

**Crear personaje**
`App` abre modal `create` → `CharacterForm` usa `useCharacterForm(null)` → al guardar llama `createCharacter()` → si hay imagen pendiente llama `uploadImage(id, file)` → `onSuccess()` cierra el modal y recarga.

**Editar personaje**
`App` abre modal `edit` con el personaje seleccionado → `CharacterForm` usa `useCharacterForm(character)` que pre-carga los campos → al guardar llama `updateCharacter()` + `uploadImage()` si cambió la imagen.

**Eliminar personaje**
`App` abre `DeleteConfirmModal` → el usuario escribe "eliminar" → se habilita el botón → llama `deleteCharacter(id)` → recarga.

**Búsqueda y filtros**
`SearchInput` tiene debounce interno de 300ms y llama `onChange` con el valor procesado. El estado de `search` y `activeFaction` vive en `App` y se pasa a `useCharacters(faction, search)` que re-fetcha automáticamente cuando cambian.

---

## Agregar un nuevo campo al personaje

1. Agregar el campo al estado inicial en `hooks/useCharacterForm.js`
2. Agregar el input correspondiente en `components/character/CharacterForm.jsx`
3. Si se quiere mostrar en el detalle, agregarlo en `components/character/CharacterDetail.jsx`
4. Si se quiere mostrar en la card, agregarlo en `components/character/CharacterCard.jsx`

No hay que tocar la capa `api/` — `updateCharacter` y `createCharacter` pasan el payload completo tal como viene del form.

---

## Agregar una nueva facción con color propio

Las facciones estáticas (yakuma, seis-siniestros, npc, otro) están definidas en `src/constants/factions.js`. Para agregar una nueva:

```js
// src/constants/factions.js
export const FACTION_COLORS = {
  // ...existentes
  'nueva-faccion': {
    accent: '#ff8800',
    bg: 'rgba(255,136,0,0.12)',
    label: 'Nueva Facción',
    dot: '#ff8800',
  },
}
```

Y agregarla al array `FACTIONS_STATIC` del mismo archivo para que aparezca en el sidebar. Las facciones también se pueden crear dinámicamente desde la UI con el botón "+ nueva facción", que llama al endpoint `POST /api/factions` del backend.

---

## Variables de diseño

Todas las variables de color y espaciado viven en `src/styles/global.css` y se usan como CSS custom properties en todos los módulos.

```css
--bg: #0d0d0f          /* fondo principal */
--bg2: #141416         /* superficies (header, sidebar, cards) */
--bg3: #1c1c20         /* inputs, hover */
--bg4: #242428         /* estados activos */
--yakuma: #c8f060      /* acento principal */
--siniestro: #ff4444   /* acento de antagonistas */
--npc: #60b8f0         /* acento NPCs */
--gold: #f0c040        /* acento leyendas */
```

---

## Relación con el backend

El frontend consume la API REST del backend en `http://localhost:3001/api`. Los endpoints que usa:

| Método | Endpoint | Usado en |
|--------|----------|----------|
| GET | `/characters?faction=&search=` | `useCharacters` |
| POST | `/characters` | `useCharacterForm` |
| PUT | `/characters/:id` | `useCharacterForm` |
| DELETE | `/characters/:id` | `App` |
| POST | `/characters/:id/image` | `api/characters.uploadImage` |
| GET | `/factions` | `useFactions` |
| POST | `/factions` | `FactionForm` |
| GET | `/stats` | `useStats` |