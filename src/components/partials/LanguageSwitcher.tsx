import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LOCALE_LABELS,
  LOCALES,
  parsePath,
  pathFor,
  type Locale,
} from '../../i18n/routes'

const LanguageSwitcher = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const parsed = parsePath(location.pathname)
  const currentLocale = parsed?.locale ?? 'es'
  const pageId = parsed?.pageId ?? 'home'

  return (
    <div className='dropdown dropdown-end'>
      <div
        tabIndex={0}
        role='button'
        className='btn btn-ghost btn-sm gap-1 min-h-8 h-8 px-2 text-sm uppercase'
        aria-label={`${t('common.language')}: ${LOCALE_LABELS[currentLocale]}`}
        title={LOCALE_LABELS[currentLocale]}
      >
        {currentLocale}
        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className='dropdown-content menu z-[1] mt-2 max-h-64 w-44 flex-nowrap overflow-y-auto rounded-box bg-base-100 p-2 shadow'
      >
        {LOCALES.map((locale: Locale) => (
          <li key={locale}>
            <a
              href={pathFor(locale, pageId)}
              className={locale === currentLocale ? 'active font-semibold' : ''}
              hrefLang={locale}
              lang={locale}
            >
              {LOCALE_LABELS[locale]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LanguageSwitcher
