import { Navigate, useParams } from 'react-router-dom'

import { DEFAULT_LOCALE, getPageIdFromSlug, isLocale, normalizeSlugPath } from '../../i18n/routes'
import Acerca from '../pages/Acerca'
import Productos from '../pages/Productos'
import Servicios from '../pages/Servicios'
import Proyectos from '../pages/Proyectos'
import Tecnologia from '../pages/Tecnologia'
import Calidad from '../pages/Calidad'
import Cafe from '../pages/Cafe'
import Blog from '../pages/Blog'
import Contacto from '../pages/Contacto'
import Terminos from '../pages/Terminos'
import Privacidad from '../pages/Privacidad'
import Ajedrez from '../pages/Ajedrez'
import AjedrezAnalisis from '../pages/AjedrezAnalisis'
import NotFound from '../pages/NotFound'

const PAGE_COMPONENTS = {
  about: Acerca,
  products: Productos,
  services: Servicios,
  projects: Proyectos,
  technology: Tecnologia,
  quality: Calidad,
  coffee: Cafe,
  blog: Blog,
  contact: Contacto,
  terms: Terminos,
  privacy: Privacidad,
  chess: Ajedrez,
  chessAnalysis: AjedrezAnalisis,
} as const

const LocalizedPage = () => {
  const { locale: localeParam, '*': pathRest } = useParams<{
    locale: string
    '*': string
  }>()

  if (!localeParam || !isLocale(localeParam)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />
  }

  const slugPath = normalizeSlugPath(pathRest ?? '')

  if (!slugPath) {
    return <Navigate to={`/${localeParam}`} replace />
  }

  const pageId = getPageIdFromSlug(localeParam, slugPath)

  if (!pageId || pageId === 'home') {
    return <NotFound />
  }

  const Page = PAGE_COMPONENTS[pageId]
  return <Page />
}

export default LocalizedPage
