import { Trans, useTranslation } from 'react-i18next'
import LocalizedLink from './LocalizedLink'

const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className='footer footer-horizontal footer-center bg-base-200 text-base-content mt-auto w-full'>
      <nav className='w-full max-w-5xl mx-auto px-4 py-8'>
        <p>{t('common.footer.copyright', { year })}</p>
        <p>
          <Trans
            i18nKey='common.footer.legal'
            components={{
              termsLink: <LocalizedLink page='terms' className='link link-motion link-primary' />,
              privacyLink: <LocalizedLink page='privacy' className='link link-motion link-primary' />,
            }}
          />
        </p>
      </nav>
    </footer>
  )
}

export default Footer
