import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons'
import Pagina from '../partials/Pagina'
import ProfileAvatar from '../partials/ProfileAvatar'

const redes = [
  { nombre: 'Instagram', url: 'https://www.instagram.com/devrfc83', icono: faInstagram },
  { nombre: 'GitHub', url: 'https://www.github.com/devrfc83', icono: faGithub },
]

const Inicio = () => {
  const { t } = useTranslation()

  return (
    <Pagina centrado className='animate-page-in gap-6 text-center'>
      <ProfileAvatar alt={t('common.profileAlt')} size='lg' />

      <div>
        <h1 className='text-3xl font-bold lg:text-4xl'>{t('meta.siteName')}</h1>
        <p className='text-base-content/70 mt-2 text-lg'>@devrfc83</p>
        <p className='text-base-content/80 mt-4 max-w-2xl mx-auto'>{t('home.bio')}</p>
      </div>

      <nav className='flex flex-wrap items-center justify-center gap-4' aria-label={t('common.socialNav')}>
        {redes.map((red) => (
          <a
            key={red.nombre}
            href={red.url}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-outline btn-primary btn-motion gap-2'
          >
            <FontAwesomeIcon icon={red.icono} className='text-lg' />
            {red.nombre}
          </a>
        ))}
      </nav>
    </Pagina>
  )
}

export default Inicio
