# AGENTS.md — Sitio personal @devrfc83

Guía para agentes de IA que trabajen en este repositorio. Describe qué es el proyecto, cómo está armado y qué convenciones respetar.

## Qué es este sitio

- Sitio web personal de **Rodrigo Fuentealba Cartes** (`@devrfc83`).
- Dominio de producción: **https://www.devrfc83.com/**
- **Multilingüe:** español (por defecto), inglés, alemán, francés, italiano, neerlandés, portugués y catalán (8 idiomas).
- Tono: profesional, claro, sitio personal/portafolio — no corporativo genérico.

## Stack técnico

| Capa | Tecnología |
|------|------------|
| UI | React 19 + TypeScript |
| i18n | **i18next** + **react-i18next** (`src/locales/*.json`) |
| Build | Vite (rolldown-vite 7.x) |
| Estilos | Tailwind CSS 4 + **daisyUI** (tema `dark`) |
| Rutas | react-router-dom 7 (`/:locale/...`) |
| Iconos | Font Awesome (`@fortawesome/react-fontawesome`, solid + brands) |
| Deploy | **Netlify** (estático + Netlify Forms) |
| Render en producción | **SSG** (112 HTML: 14 páginas × 8 idiomas) |

## Arquitectura i18n

```
src/i18n/routes.ts     → LOCALES, PAGE_SLUGS, pathFor(), parsePath(), prerenderPaths()
src/i18n/index.ts      → initI18n() (cliente + SSR)
src/locales/es.json    → fuente de verdad (textos)
src/locales/{en,de,...}.json
```

- URLs: **`/{locale}/{slug-localizado}`** (ej. `/en/about`, `/de/kontakt`, `/es/acerca`).
- **`/`** y rutas legacy (`/acerca`, …) redirigen con **301** a `/es/...` (`netlify.toml`).
- Navegación interna: **`<LocalizedLink page="contact">`** (no `Link` con path fijo).
- Selector de idioma en `Header.tsx` (`LanguageSwitcher.tsx`): conserva la misma página (`pageId`), cambia locale.
- Legal: texto **completo solo en español** (`/es/terminos`, `/es/privacidad`); otros idiomas muestran **resumen** + enlace a la versión española (`LegalDocument.tsx`).

## Rutas y SSG

Registro central: `src/i18n/routes.ts`. `src/routes.ts` reexporta `prerenderPaths()`.

| pageId | ES (ejemplo) | EN (ejemplo) |
|--------|--------------|--------------|
| home | `/es` | `/en` |
| about | `/es/acerca` | `/en/about` |
| services | `/es/servicios` | `/en/services` |
| contact | `/es/contacto` | `/en/contact` |
| coffee | `/es/cafe` | `/en/coffee` |
| chess | `/es/ajedrez` | `/en/chess` |
| chessAnalysis | `/es/ajedrez/analisis` | `/en/chess/analysis` |
| … | ver `PAGE_SLUGS` | |

**Al añadir una página nueva:**

1. Crear `src/components/pages/<Nombre>.tsx` con `useTranslation()`.
2. Añadir textos en **todos** los `src/locales/*.json`.
3. Añadir `pageId` y slugs en `PAGE_SLUGS` (`src/i18n/routes.ts`).
4. Registrar en `LocalizedPage.tsx` (`PAGE_COMPONENTS`).
5. Si va en menú: `NAV_PAGES` en `Header.tsx`.

**Menú visible:** Inicio, Acerca, Servicios, Contacto (etiquetas traducidas). Otras secciones sin enlace en menú.

**Easter egg ajedrez:** Stockfish en `public/stockfish/`; ver `src/lib/stockfishEngine.ts`. Análisis de partidas (`chessAnalysis`): `src/lib/chessAnalysis.ts`, gráficos con **recharts** en `src/components/chess/AnalysisCharts.tsx`, y modo **Editor** para armar jugadas en tablero antes de analizar.

**Navegación:** `<LocalizedLink>` para rutas internas; `<a href>` solo para externos. El selector de idioma usa `<a href>` a la URL pre-renderizada.

## Build y desarrollo

```bash
npm run dev      # SPA; init i18n según URL
npm run build    # tsc + cliente + SSR + 112 prerenders
npm run preview
```

`scripts/prerender.ts`: por cada ruta, `initI18n(locale)` + `render(url)` + `lang` en `<html>`.

## Formulario de contacto (Netlify)

- Nombre del formulario: **`contacto`** (no traducir nombres de campo).
- Captcha: `CaptchaMatematico.tsx` (textos en `contact.captcha.*`).

## Contenido y legal

- Versión legal vinculante: **español** en `/es/terminos` y `/es/privacidad`.
- Placeholder Lorem en tarjetas de productos/proyectos/tecnología hasta copy definitivo.

## Qué evitar

- No hardcodear paths (`/contacto`); usar `pathFor(locale, pageId)` o `LocalizedLink`.
- No añadir slugs solo en `Content.tsx` sin `PAGE_SLUGS` y JSON en 8 idiomas.
- No quitar redirects legacy en `netlify.toml`.
- No expandir alcance sin pedido.

## Comprobación rápida

- [ ] `npm run build` → «Pre-renderizadas 112 rutas».
- [ ] Nueva página: `PAGE_SLUGS` + 8 JSON + `LocalizedPage`.
- [ ] Textos nuevos en los 8 archivos de locale.
