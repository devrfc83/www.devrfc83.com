import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faClipboardList,
  faDatabase,
  faDesktop,
  faClipboardCheck,
  faCode,
  faPalette,
  faShieldHalved,
  faRocket,
} from '@fortawesome/free-solid-svg-icons'
import Pagina from '../partials/Pagina'

type AnchoTarjeta = 'completo' | 'tercio' | 'mitad'

const QUALITY_ITEMS: { key: string; ancho: AnchoTarjeta; icono: IconDefinition }[] = [
  { key: 'requirements', ancho: 'completo', icono: faClipboardList },
  { key: 'testPlan', ancho: 'tercio', icono: faClipboardCheck },
  { key: 'databases', ancho: 'tercio', icono: faDatabase },
  { key: 'ui', ancho: 'tercio', icono: faDesktop },
  { key: 'logic', ancho: 'mitad', icono: faCode },
  { key: 'brand', ancho: 'mitad', icono: faPalette },
  { key: 'qa', ancho: 'completo', icono: faShieldHalved },
  { key: 'delivery', ancho: 'completo', icono: faRocket },
]

const anchoClase: Record<AnchoTarjeta, string> = {
  completo: 'md:col-span-12',
  tercio: 'md:col-span-4',
  mitad: 'md:col-span-6',
}

const Calidad = () => {
  const { t } = useTranslation()

  return (
    <Pagina>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold'>{t('quality.title')}</h1>
        <p className='text-base-content/70 mt-2'>{t('quality.intro')}</p>
      </header>

      <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-12'>
        {QUALITY_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`card card-motion bg-base-200 shadow-sm ${anchoClase[item.ancho]}`}
          >
            <div className='card-body'>
              <h2 className='card-title text-lg gap-3'>
                <FontAwesomeIcon icon={item.icono} className='text-primary shrink-0' />
                {t(`quality.items.${item.key}.name`)}
              </h2>
              <p className='text-base-content/80'>{t(`quality.items.${item.key}.description`)}</p>
            </div>
          </div>
        ))}
      </div>
    </Pagina>
  )
}

export default Calidad
