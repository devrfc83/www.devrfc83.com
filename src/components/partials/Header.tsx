import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faHouse, faUser, faBriefcase, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { pathFor, type PageId } from '../../i18n/routes'
import { useLocale } from '../../i18n/LocaleContext'
import LanguageSwitcher from './LanguageSwitcher'

const NAV_PAGES: { page: PageId; icon: IconDefinition; labelKey: string }[] = [
  { page: 'home', icon: faHouse, labelKey: 'common.nav.home' },
  { page: 'about', icon: faUser, labelKey: 'common.nav.about' },
  { page: 'services', icon: faBriefcase, labelKey: 'common.nav.services' },
  { page: 'contact', icon: faEnvelope, labelKey: 'common.nav.contact' },
]

const Header = () => {
  const { t } = useTranslation()
  const locale = useLocale()
  const homePath = pathFor(locale, 'home')

  const EnlaceMenu = ({ page, icon, labelKey }: (typeof NAV_PAGES)[number]) => (
    <Link to={pathFor(locale, page)} className='nav-link-motion gap-1.5 text-sm whitespace-nowrap px-2'>
      <FontAwesomeIcon icon={icon} className='w-3.5 shrink-0' />
      {t(labelKey)}
    </Link>
  )

  return (
    <header className='w-full bg-base-100 shadow-sm'>
      <div className='navbar w-full max-w-5xl mx-auto px-4 min-h-14'>
        <div className='navbar-start'>
          <div className='dropdown'>
            <div tabIndex={0} role='button' className='btn btn-ghost lg:hidden'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h8m-8 6h16' />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow'
            >
              {NAV_PAGES.map((item) => (
                <li key={item.page}>
                  <EnlaceMenu {...item} />
                </li>
              ))}
            </ul>
          </div>
          <Link to={homePath} className='btn btn-ghost btn-sm nav-brand-motion text-base font-semibold px-2'>
            @devrfc83
          </Link>
        </div>
        <div className='navbar-end min-w-0 flex-1 justify-end gap-0'>
          <ul className='menu menu-horizontal menu-sm px-0 hidden lg:flex flex-nowrap'>
            {NAV_PAGES.map((item) => (
              <li key={item.page}>
                <EnlaceMenu {...item} />
              </li>
            ))}
          </ul>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

export default Header
