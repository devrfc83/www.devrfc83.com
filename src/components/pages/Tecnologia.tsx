import { useTranslation } from 'react-i18next'
import PaginaTarjetas from '../partials/PaginaTarjetas'

const Tecnologia = () => {
  const { t } = useTranslation()
  const cards = t('technology.cards', { returnObjects: true }) as { name: string; description: string }[]

  return (
    <PaginaTarjetas
      titulo={t('technology.title')}
      descripcion={t('technology.description')}
      tarjetas={cards.map((c) => ({ nombre: c.name, descripcion: c.description }))}
    />
  )
}

export default Tecnologia
