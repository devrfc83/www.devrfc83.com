export const LOCALES = ['es', 'en', 'de', 'fr', 'it', 'nl', 'pt', 'ca'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
  ca: 'Català',
}

export const PAGE_IDS = [
  'home',
  'about',
  'products',
  'services',
  'projects',
  'technology',
  'quality',
  'coffee',
  'blog',
  'contact',
  'terms',
  'privacy',
  'chess',
  'chessAnalysis',
] as const

export type PageId = (typeof PAGE_IDS)[number]

/** Slug URL por idioma (home = cadena vacía). */
export const PAGE_SLUGS: Record<PageId, Record<Locale, string>> = {
  home: {
    es: '',
    en: '',
    de: '',
    fr: '',
    it: '',
    nl: '',
    pt: '',
    ca: '',
  },
  about: {
    es: 'acerca',
    en: 'about',
    de: 'ueber-mich',
    fr: 'a-propos',
    it: 'chi-sono',
    nl: 'over-mij',
    pt: 'sobre',
    ca: 'sobre',
  },
  products: {
    es: 'productos',
    en: 'products',
    de: 'produkte',
    fr: 'produits',
    it: 'prodotti',
    nl: 'producten',
    pt: 'produtos',
    ca: 'productes',
  },
  services: {
    es: 'servicios',
    en: 'services',
    de: 'dienstleistungen',
    fr: 'services',
    it: 'servizi',
    nl: 'diensten',
    pt: 'servicos',
    ca: 'serveis',
  },
  projects: {
    es: 'proyectos',
    en: 'projects',
    de: 'projekte',
    fr: 'projets',
    it: 'progetti',
    nl: 'projecten',
    pt: 'projetos',
    ca: 'projectes',
  },
  technology: {
    es: 'tecnologia',
    en: 'technology',
    de: 'technologie',
    fr: 'technologie',
    it: 'tecnologia',
    nl: 'technologie',
    pt: 'tecnologia',
    ca: 'tecnologia',
  },
  quality: {
    es: 'calidad',
    en: 'quality',
    de: 'qualitaet',
    fr: 'qualite',
    it: 'qualita',
    nl: 'kwaliteit',
    pt: 'qualidade',
    ca: 'qualitat',
  },
  coffee: {
    es: 'cafe',
    en: 'coffee',
    de: 'kaffee',
    fr: 'cafe',
    it: 'caffe',
    nl: 'koffie',
    pt: 'cafe',
    ca: 'cafe',
  },
  blog: {
    es: 'blog',
    en: 'blog',
    de: 'blog',
    fr: 'blog',
    it: 'blog',
    nl: 'blog',
    pt: 'blog',
    ca: 'blog',
  },
  contact: {
    es: 'contacto',
    en: 'contact',
    de: 'kontakt',
    fr: 'contact',
    it: 'contatto',
    nl: 'contact',
    pt: 'contato',
    ca: 'contacte',
  },
  terms: {
    es: 'terminos',
    en: 'terms',
    de: 'nutzungsbedingungen',
    fr: 'conditions',
    it: 'termini',
    nl: 'voorwaarden',
    pt: 'termos',
    ca: 'termes',
  },
  privacy: {
    es: 'privacidad',
    en: 'privacy',
    de: 'datenschutz',
    fr: 'confidentialite',
    it: 'privacy',
    nl: 'privacy',
    pt: 'privacidade',
    ca: 'privacitat',
  },
  chess: {
    es: 'ajedrez',
    en: 'chess',
    de: 'schach',
    fr: 'echecs',
    it: 'scacchi',
    nl: 'schaken',
    pt: 'xadrez',
    ca: 'escacs',
  },
  chessAnalysis: {
    es: 'ajedrez/analisis',
    en: 'chess/analysis',
    de: 'schach/analyse',
    fr: 'echecs/analyse',
    it: 'scacchi/analisi',
    nl: 'schaken/analyse',
    pt: 'xadrez/analise',
    ca: 'escacs/analisi',
  },
}

const SITE_ORIGIN = 'https://www.devrfc83.com'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function pathFor(locale: Locale, pageId: PageId): string {
  const slug = PAGE_SLUGS[pageId][locale]
  if (slug === '') return `/${locale}`
  return `/${locale}/${slug}`
}

/** Quita barras sobrantes para comparar slugs (p. ej. `ajedrez/analisis/`). */
export function normalizeSlugPath(slug: string): string {
  return slug
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
}

export function getPageIdFromSlug(locale: Locale, slug: string): PageId | null {
  const normalized = normalizeSlugPath(slug)
  for (const pageId of PAGE_IDS) {
    if (PAGE_SLUGS[pageId][locale] === normalized) {
      return pageId
    }
  }
  return null
}

export function parsePath(pathname: string): { locale: Locale; pageId: PageId } | null {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  if (segments.length === 0) return null

  const localeCandidate = segments[0]
  if (!isLocale(localeCandidate)) return null

  const locale = localeCandidate
  const slugPath = normalizeSlugPath(segments.slice(1).join('/'))

  for (const pageId of PAGE_IDS) {
    if (PAGE_SLUGS[pageId][locale] === slugPath) {
      return { locale, pageId }
    }
  }

  return null
}

export function prerenderPaths(): string[] {
  const paths: string[] = []
  for (const locale of LOCALES) {
    for (const pageId of PAGE_IDS) {
      paths.push(pathFor(locale, pageId))
    }
  }
  return paths
}

/** Rutas legacy sin prefijo de idioma → /es/… */
export const LEGACY_REDIRECTS: { from: string; to: string }[] = PAGE_IDS.filter(
  (id) => id !== 'home',
).map((pageId) => ({
  from: `/${PAGE_SLUGS[pageId].es}`,
  to: pathFor(DEFAULT_LOCALE, pageId),
}))

export function absoluteUrl(locale: Locale, pageId: PageId): string {
  return `${SITE_ORIGIN}${pathFor(locale, pageId)}`
}

export type HreflangLink = { hreflang: string; href: string }

export function hreflangLinks(pageId: PageId): HreflangLink[] {
  const links: HreflangLink[] = LOCALES.map((locale) => ({
    hreflang: locale,
    href: absoluteUrl(locale, pageId),
  }))
  links.push({ hreflang: 'x-default', href: absoluteUrl(DEFAULT_LOCALE, pageId) })
  return links
}
