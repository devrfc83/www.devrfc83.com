import { useTranslation } from 'react-i18next'
import LocalizedLink from './LocalizedLink'
import { DEFAULT_LOCALE, pathFor } from '../../i18n/routes'
import { useLocale } from '../../i18n/LocaleContext'

type LegalSection = {
  title: string
  paragraphs?: string[]
  list?: string[] | null
  subsections?: {
    title: string
    paragraphs?: string[]
    list?: string[]
  }[]
  contactLink?: boolean
  dataTable?: boolean
}

type LegalDocumentProps = {
  namespace: 'terms' | 'privacy'
}

const LegalDocument = ({ namespace }: LegalDocumentProps) => {
  const { t } = useTranslation()
  const locale = useLocale()
  const isFullLocale = locale === DEFAULT_LOCALE

  const full = t(`${namespace}.full`, { returnObjects: true }) as LegalSection[]
  const summary = t(`${namespace}.summary`, { returnObjects: true }) as {
    title: string
    body: string
  }[]

  const renderParagraphs = (paragraphs?: string[]) =>
    paragraphs?.map((paragraph, index) => (
      <p key={index} className='text-base-content/80 leading-relaxed mb-3 last:mb-0'>
        {paragraph}
      </p>
    ))

  const renderSection = (section: LegalSection, index: number) => (
    <section key={index}>
      <h2 className='text-xl font-semibold mb-3'>{section.title}</h2>
      {renderParagraphs(section.paragraphs)}
      {section.list && section.list.length > 0 && (
        <ul className='list-disc list-inside text-base-content/80 leading-relaxed space-y-2 mb-3'>
          {section.list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {section.subsections?.map((sub, i) => (
        <div key={i} className='mb-4'>
          <h3 className='font-semibold mb-2'>{sub.title}</h3>
          {renderParagraphs(sub.paragraphs)}
          {sub.list && (
            <ul className='list-disc list-inside text-base-content/80 leading-relaxed space-y-2'>
              {sub.list.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {section.dataTable && namespace === 'privacy' && (
        <div className='overflow-x-auto mb-4'>
          <table className='table table-zebra w-full'>
            <thead>
              <tr>
                <th>{t('privacy.table.data')}</th>
                <th>{t('privacy.table.purpose')}</th>
              </tr>
            </thead>
            <tbody>
              {(t('privacy.dataRows', { returnObjects: true }) as { data: string; purpose: string }[]).map(
                (row) => (
                  <tr key={row.data}>
                    <td>{row.data}</td>
                    <td>{row.purpose}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
      {section.contactLink && (
        <p className='text-base-content/80 leading-relaxed'>
          <LocalizedLink page='contact' className='link link-motion link-primary'>
            {t(`${namespace}.contactForm`)}
          </LocalizedLink>
        </p>
      )}
    </section>
  )

  return (
    <>
      <header>
        <h1 className='text-3xl font-bold'>{t(`${namespace}.title`)}</h1>
        <p className='text-base-content/70 mt-3'>
          {t(`${namespace}.website`)}{' '}
          <a href='https://www.devrfc83.com/' className='link link-motion link-primary'>
            https://www.devrfc83.com/
          </a>
        </p>
        <p className='text-base-content/70 mt-1'>{t(`${namespace}.updated`)}</p>
      </header>

      {!isFullLocale && (
        <div role='note' className='alert alert-info text-sm'>
          <div>
            <p>{t(`${namespace}.summaryNotice`)}</p>
            <a
              href={pathFor(DEFAULT_LOCALE, namespace)}
              className='link link-motion font-medium mt-2 inline-block'
            >
              {t(`${namespace}.summaryLink`)}
            </a>
          </div>
        </div>
      )}

      {isFullLocale && Array.isArray(full) && full.length > 0
        ? full.map(renderSection)
        : summary.map((section, index) => (
            <section key={index}>
              <h2 className='text-xl font-semibold mb-3'>{section.title}</h2>
              <p className='text-base-content/80 leading-relaxed'>{section.body}</p>
            </section>
          ))}

      <p className='text-base-content/70 text-sm border-t border-base-300 pt-6'>
        {t(`${namespace}.footer`)}
      </p>
    </>
  )
}

export default LegalDocument
