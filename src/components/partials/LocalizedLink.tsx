import { Link, type LinkProps } from 'react-router-dom'
import { pathFor, type PageId } from '../../i18n/routes'
import { useLocale } from '../../i18n/LocaleContext'

type LocalizedLinkProps = Omit<LinkProps, 'to'> & {
  page: PageId
}

const LocalizedLink = ({ page, ...props }: LocalizedLinkProps) => {
  const locale = useLocale()
  return <Link to={pathFor(locale, page)} {...props} />
}

export default LocalizedLink
