import type { Resource } from 'i18next'

import es from '../locales/es.json'
import en from '../locales/en.json'
import de from '../locales/de.json'
import fr from '../locales/fr.json'
import it from '../locales/it.json'
import nl from '../locales/nl.json'
import pt from '../locales/pt.json'
import ca from '../locales/ca.json'

import type { Locale } from './routes'

const bundles: Record<Locale, Resource> = {
  es: { translation: es },
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  it: { translation: it },
  nl: { translation: nl },
  pt: { translation: pt },
  ca: { translation: ca },
}

export function resourcesForLocale(locale: Locale): Resource {
  return bundles[locale]
}

export const allResources: Record<Locale, Resource> = bundles
