import { useTranslation } from 'react-i18next'
import Pagina from '../partials/Pagina'

const Blog = () => {
  const { t } = useTranslation()

  return (
    <Pagina centrado>
      <p className='text-base-content/80'>{t('blog.underConstruction')}</p>
    </Pagina>
  )
}

export default Blog
