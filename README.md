# devrfc83.com — Sitio personal

Sitio web personal de **Rodrigo Fuentealba Cartes** ([@devrfc83](https://www.devrfc83.com/)).

- **Producción:** [https://www.devrfc83.com/](https://www.devrfc83.com/)
- **Idiomas:** español (por defecto), inglés, alemán, francés, italiano, neerlandés, portugués y catalán
- **Deploy:** Netlify (estático + formulario de contacto)

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React 19 + TypeScript |
| Build | Vite (rolldown-vite 7.x) |
| Estilos | Tailwind CSS 4 + daisyUI (tema `dark`) |
| Rutas | react-router-dom 7 (`/:locale/...`) |
| i18n | i18next + react-i18next |
| Iconos | Font Awesome |
| Ajedrez | chess.js, react-chessboard, Stockfish (WASM) |
| Gráficos (análisis) | recharts |
| SSG | Cliente + SSR + prerender por ruta |

## Contenido y secciones

- **Menú principal:** Inicio, Acerca, Servicios, Contacto (traducidos por idioma).
- **Otras páginas** (sin enlace en menú, acceso directo o desde Acerca): productos, proyectos, tecnología, calidad, blog, café, ajedrez, términos, privacidad.
- **Legal:** texto completo solo en español (`/es/terminos`, `/es/privacidad`); otros idiomas muestran resumen + enlace a la versión en español.
- **Contacto:** formulario Netlify (`contacto`) con captcha matemático.

### Ajedrez

- Jugar contra **Stockfish** en `/es/ajedrez` (y slugs equivalentes).
- **Analizador de partidas** en `/es/ajedrez/analisis`:
  - Cargar o pegar PGN (o llegar desde el tablero de juego).
  - Modo **Editor:** armar la partida moviendo piezas en el tablero y analizar el PGN generado.
  - Profundidad Stockfish configurable (8–18).
  - Navegación por jugadas, flechas (mejor jugada / jugada realizada), gráficos, descarga de imagen del tablero y PGN con comentarios de análisis.

### Café

- Página `/es/cafe` con recetas caseras (tazas, cucharadas, cucharaditas) enlazada desde Acerca.

## URLs e i18n

- Rutas con prefijo de idioma: `/{locale}/{slug}` (ej. `/en/about`, `/de/kontakt`, `/es/acerca`).
- `/` y rutas legacy (`/acerca`, `/contacto`, …) redirigen con **301** a `/es/...` (`netlify.toml`).
- Registro central de páginas y slugs: `src/i18n/routes.ts`.
- En producción se generan **112 HTML** (14 páginas × 8 idiomas).

## Desarrollo

Requisitos: Node.js (LTS recomendado), npm.

```bash
npm install
npm run dev      # http://localhost:5173 — SPA con i18n según URL
npm run build    # tsc + build cliente + SSR + prerender
npm run preview  # sirve dist/ tras build
npm run lint
```

Tras `npm run build`, la salida debe indicar **«Pre-renderizadas 112 rutas»**.

Stockfish se copia a `public/stockfish/` en `postinstall` y antes del build (`scripts/copy-stockfish.js`).

## Estructura del repo (resumen)

```
src/
  components/pages/     # Páginas (Acerca, Cafe, Ajedrez, AjedrezAnalisis, …)
  components/partials/  # Layout, Header, LocalizedLink, LocalizedPage, …
  components/chess/     # Gráficos y leyenda del analizador
  i18n/                 # Rutas localizadas e init i18n
  locales/              # es.json + 7 traducciones
  lib/                  # Ajedrez, análisis, PGN, Stockfish, …
scripts/
  prerender.ts          # SSG
  copy-stockfish.js
netlify.toml            # Build, redirects legacy, formulario
AGENTS.md               # Guía para agentes de IA y convenciones del proyecto
```

## Añadir una página nueva

1. Componente en `src/components/pages/`.
2. Textos en los **8** archivos `src/locales/*.json`.
3. `pageId` y slugs en `PAGE_SLUGS` (`src/i18n/routes.ts`).
4. Registro en `LocalizedPage.tsx` (`PAGE_COMPONENTS`).
5. Si va en menú: `NAV_PAGES` en `Header.tsx`.
6. Redirect legacy en `netlify.toml` si el slug en español debe responder sin `/es/`.

Detalle completo en [AGENTS.md](./AGENTS.md).

## Licencia

Proyecto privado; uso personal del autor salvo indicación contraria.
