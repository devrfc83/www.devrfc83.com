import { renderToString } from 'react-dom/server'
import { StrictMode } from 'react'
import { StaticRouter } from 'react-router-dom'
import App from './App.tsx'
import { initI18n } from './i18n/index.ts'
import { DEFAULT_LOCALE, parsePath } from './i18n/routes.ts'

export async function render(url: string) {
  const parsed = parsePath(url)
  const locale = parsed?.locale ?? DEFAULT_LOCALE
  await initI18n(locale)

  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
