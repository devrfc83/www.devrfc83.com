import Header from './components/partials/Header'
import Content from './components/partials/Content'
import Footer from './components/partials/Footer'
import { AppLocaleProvider } from './i18n/LocaleContext'

const App = () => {
  return (
    <AppLocaleProvider>
      <div className='min-h-screen w-full flex flex-col items-center justify-start text-base-content'>
        <Header />
        <Content />
        <Footer />
      </div>
    </AppLocaleProvider>
  )
}

export default App
