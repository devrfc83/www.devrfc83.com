import { Trans, useTranslation } from 'react-i18next'
import Pagina from '../partials/Pagina'
import LocalizedLink from '../partials/LocalizedLink'
import ProfileAvatar from '../partials/ProfileAvatar'

const interestLinkClass = 'link link-motion link-hover'
const QRZ_PROFILE_URL = 'https://www.qrz.com/db/CA4NFS'
const RADIO_CLUB_URL = 'https://www.ce4ly.cl/'
const BRUTAL_STRIKER_URL = 'https://www.brutalstrikertalca.cl/'

const Acerca = () => {
  const { t } = useTranslation()
  const interests = t('about.interests', { returnObjects: true }) as string[]

  return (
    <Pagina className='animate-page-in flex flex-col gap-8'>
      <header className='flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left'>
        <ProfileAvatar alt={t('common.profileAltShort')} size='md' className='shrink-0' />
        <div>
          <h1 className='text-3xl font-bold'>{t('meta.siteName')}</h1>
          <p className='text-base-content/70 mt-2'>{t('about.subtitle')}</p>
        </div>
      </header>

      <section>
        <h2 className='text-xl font-semibold mb-3'>{t('about.historyTitle')}</h2>
        <p className='text-base-content/80 leading-relaxed'>
          <Trans i18nKey='about.history' components={{ em: <span className='italic' /> }} />
        </p>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-3'>{t('about.experienceTitle')}</h2>
        <p className='text-base-content/80 leading-relaxed'>{t('about.experience')}</p>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-3'>{t('about.interestsTitle')}</h2>
        <p className='text-base-content/80 leading-relaxed mb-3'>{t('about.interestsIntro')}</p>
        <ul className='list-disc list-inside text-base-content/80 leading-relaxed space-y-2 mb-3'>
          <li>
            <LocalizedLink page='chess' className={interestLinkClass}>
              {t('chess.title')}
            </LocalizedLink>{' '}
            <Trans
              i18nKey='about.interestChessNote'
              components={{
                analysisLink: (
                  <LocalizedLink page='chessAnalysis' className={interestLinkClass} />
                ),
              }}
            />
          </li>
          {interests.slice(0, -1).map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            <Trans
              i18nKey='about.kickboxingNote'
              components={{
                brutalStrikerLink: (
                  <a
                    href={BRUTAL_STRIKER_URL}
                    className={interestLinkClass}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                ),
              }}
            />
          </li>
          <li>{t('about.interestElectronicsPlain')}</li>
          <li>
            <Trans
              i18nKey='about.radioClubNote'
              components={{
                radioLink: (
                  <a
                    href={QRZ_PROFILE_URL}
                    className={interestLinkClass}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                ),
                radioClubLink: (
                  <a
                    href={RADIO_CLUB_URL}
                    className={interestLinkClass}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                ),
              }}
            />
          </li>
          <li>
            <LocalizedLink page='coffee' className={interestLinkClass}>
              {t('coffee.title')}
            </LocalizedLink>.
          </li>
          <li key={interests[interests.length - 1]}>{interests[interests.length - 1]}</li>
        </ul>
      </section>
    </Pagina>
  )
}

export default Acerca
