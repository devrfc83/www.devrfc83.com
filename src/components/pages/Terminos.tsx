import Pagina from '../partials/Pagina'
import LegalDocument from '../partials/LegalDocument'

const Terminos = () => (
  <Pagina className='legal-page animate-page-in flex flex-col gap-8'>
    <LegalDocument namespace='terms' />
  </Pagina>
)

export default Terminos
