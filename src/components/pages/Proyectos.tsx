import { useTranslation } from 'react-i18next'
import PaginaTarjetas from '../partials/PaginaTarjetas'

const Proyectos = () => {
  const { t } = useTranslation()
  const cards = t('projects.cards', { returnObjects: true }) as { name: string; description: string }[]

  return (
    <PaginaTarjetas
      titulo={t('projects.title')}
      descripcion={t('projects.description')}
      tarjetas={cards.map((c) => ({ nombre: c.name, descripcion: c.description }))}
    />
  )
}

export default Proyectos
