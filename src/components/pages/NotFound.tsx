import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Pagina from '../partials/Pagina'
import { DEFAULT_LOCALE, pathFor } from '../../i18n/routes'

const NotFound = () => {
  const { t } = useTranslation()

  return (
    <Pagina centrado className='text-center animate-page-in'>
      <h2 className='text-2xl font-bold mb-2'>{t('common.notFound.title')}</h2>
      <p className='text-base-content/70 mb-4'>{t('common.notFound.body')}</p>
      <Link to={pathFor(DEFAULT_LOCALE, 'home')} className='link link-motion link-primary'>
        {t('common.notFound.back')}
      </Link>
    </Pagina>
  )
}

export default NotFound
