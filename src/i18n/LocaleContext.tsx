import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { initI18n } from './index'
import { DEFAULT_LOCALE, parsePath, type Locale } from './routes'

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

/** Provee el locale según la URL actual a toda la app (header, footer, páginas). */
export function AppLocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const parsed = parsePath(location.pathname)
  const locale: Locale = parsed?.locale ?? DEFAULT_LOCALE
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [locale, i18n])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export async function ensureLocale(locale: Locale) {
  await initI18n(locale)
}
