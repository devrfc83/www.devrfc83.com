import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { initI18n } from '../src/i18n/index.ts'
import { parsePath, prerenderPaths } from '../src/i18n/routes.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const templatePath = path.join(distDir, 'index.html')
const serverEntry = path.join(distDir, 'server', 'entry-server.js')

const template = fs.readFileSync(templatePath, 'utf-8')

const { render } = await import(pathToFileURL(serverEntry).href)

function routeToFile(route: string) {
  if (route === '/' || route.match(/^\/[a-z]{2}$/)) {
    const locale = route === '/' ? 'es' : route.slice(1)
    return path.join(distDir, locale, 'index.html')
  }
  return path.join(distDir, route.slice(1), 'index.html')
}

const paths = prerenderPaths()

for (const routePath of paths) {
  const parsed = parsePath(routePath)
  const locale = parsed?.locale ?? 'es'
  await initI18n(locale)

  const appHtml = await render(routePath)
  const html = template
    .replace('lang="es"', `lang="${locale}"`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

  const file = routeToFile(routePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  console.log(`  ${routePath} → ${path.relative(distDir, file)}`)
}

console.log(`\nPre-renderizadas ${paths.length} rutas.`)
