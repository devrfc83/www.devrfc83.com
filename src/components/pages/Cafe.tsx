import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMugHot } from '@fortawesome/free-solid-svg-icons'
import Pagina from '../partials/Pagina'

const COFFEE_ITEM_KEYS = [
  'espresso',
  'espressoDoppio',
  'ristretto',
  'lungo',
  'americano',
  'longBlack',
  'latte',
  'flatWhite',
  'macchiato',
  'caramelMacchiato',
  'cappuccino',
  'mochaccino',
  'affogato',
  'viennese',
  'irish',
  'frappe',
] as const

const Cafe = () => {
  const { t } = useTranslation()

  return (
    <Pagina>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold'>{t('coffee.title')}</h1>
        <p className='text-base-content/70 mt-2'>{t('coffee.intro')}</p>
      </header>

      <div className='grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {COFFEE_ITEM_KEYS.map((key) => (
          <div key={key} className='card card-motion bg-base-200 shadow-sm'>
            <div className='card-body'>
              <h2 className='card-title text-lg gap-3'>
                <FontAwesomeIcon icon={faMugHot} className='text-primary shrink-0' />
                {t(`coffee.items.${key}.name`)}
              </h2>
              <p className='text-base-content/80 text-sm leading-relaxed'>
                {t(`coffee.items.${key}.recipe`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Pagina>
  )
}

export default Cafe
