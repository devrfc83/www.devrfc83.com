import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, type Locale } from './routes'
import { allResources } from './resources'

let initialized = false

export async function initI18n(locale: Locale = DEFAULT_LOCALE) {
  if (initialized && i18n.language === locale) {
    return i18n
  }

  if (!initialized) {
    await i18n.use(initReactI18next).init({
      resources: allResources,
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      interpolation: { escapeValue: false },
      returnNull: false,
    })
    initialized = true
    return i18n
  }

  await i18n.changeLanguage(locale)
  return i18n
}

export default i18n
