import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './assets/stylesheets/app.css'

import App from './App.tsx'
import ScrollToTop from './components/partials/ScrollToTop.tsx'
import { initI18n } from './i18n/index.ts'
import { DEFAULT_LOCALE, parsePath } from './i18n/routes.ts'

const container = document.getElementById('root')!

const bootstrap = async () => {
  const parsed = parsePath(window.location.pathname)
  const locale = parsed?.locale ?? DEFAULT_LOCALE
  await initI18n(locale)

  const app = (
    <StrictMode>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </StrictMode>
  )

  if (container.hasChildNodes()) {
    hydrateRoot(container, app)
  } else {
    createRoot(container).render(app)
  }
}

void bootstrap()
