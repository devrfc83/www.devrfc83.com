import { Route, Routes } from 'react-router-dom'
import LocaleLayout from './LocaleLayout'
import LocalizedPage from './LocalizedPage'
import RootRedirect from './RootRedirect'
import Inicio from '../pages/Inicio'
import NotFound from '../pages/NotFound'

const Content = () => {
  return (
    <div className='w-full max-w-5xl mx-auto px-4 grow flex flex-col'>
      <Routes>
        <Route path='/' element={<RootRedirect />} />
        <Route path='/:locale' element={<LocaleLayout />}>
          <Route index element={<Inicio />} />
          <Route path='*' element={<LocalizedPage />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default Content
