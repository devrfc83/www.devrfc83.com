import { Navigate } from 'react-router-dom'
import { DEFAULT_LOCALE } from '../../i18n/routes'

const RootRedirect = () => <Navigate to={`/${DEFAULT_LOCALE}`} replace />

export default RootRedirect
