import { Chess } from 'chess.js'

export const PGN_SITE = 'https://www.devrfc83.com/'

export function buildPgn(
  game: Chess,
  humanColor: 'w' | 'b',
  playerName: string,
): string | null {
  if (game.history().length === 0) return null

  const exportGame = new Chess()
  try {
    exportGame.loadPgn(game.pgn())
  } catch {
    return null
  }

  const name = playerName.trim()
  const white = humanColor === 'w' ? name : 'Stockfish'
  const black = humanColor === 'b' ? name : 'Stockfish'
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('.')

  exportGame.setHeader('Event', 'Casual Game')
  exportGame.setHeader('Site', PGN_SITE)
  exportGame.setHeader('Date', date)
  exportGame.setHeader('White', white)
  exportGame.setHeader('Black', black)

  if (game.isCheckmate()) {
    exportGame.setHeader('Result', game.turn() === 'w' ? '0-1' : '1-0')
  } else if (game.isDraw()) {
    exportGame.setHeader('Result', '1/2-1/2')
  } else {
    exportGame.setHeader('Result', '*')
  }

  return exportGame.pgn()
}

export function downloadPgnFile(pgn: string, filename: string) {
  const blob = new Blob([`${pgn}\n`], { type: 'application/x-chess-pgn;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function pgnFilename(playerName: string): string {
  const slug = playerName
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 40)
  const date = new Date().toISOString().slice(0, 10)
  return slug ? `partida-${slug}-${date}.pgn` : `partida-${date}.pgn`
}
