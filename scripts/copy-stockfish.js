import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'node_modules', 'stockfish', 'bin')
const destDir = join(root, 'public', 'stockfish')

mkdirSync(destDir, { recursive: true })
copyFileSync(
  join(srcDir, 'stockfish-18-lite-single.js'),
  join(destDir, 'stockfish.js'),
)
copyFileSync(
  join(srcDir, 'stockfish-18-lite-single.wasm'),
  join(destDir, 'stockfish.wasm'),
)

console.log('Stockfish copiado a public/stockfish/')
