import { Chess } from 'chess.js'
import {
  loadPgnMoves,
  type AnalyzedMove,
  type GameAnalysis,
  type MoveQuality,
} from './chessAnalysis'
import { PGN_SITE } from './chessPgn'

export type AnalyzedPgnLabels = {
  quality: Record<MoveQuality, string>
  bestMove: string
  depth: string
  startEval: string
}

function buildMoveComment(move: AnalyzedMove, depth: number, labels: AnalyzedPgnLabels): string {
  const parts: string[] = [
    `${move.evalBeforeText} → ${move.evalAfterText}${move.symbol ? ` ${move.symbol}` : ''}`,
    labels.quality[move.quality],
  ]

  if (move.bestMove && !move.isBestMove) {
    parts.push(`${labels.bestMove}: ${move.bestMove}`)
  }

  parts.push(`${labels.depth}: ${depth}`)

  return parts.join('. ')
}

export function buildAnalyzedPgn(
  originalPgn: string,
  analysis: GameAnalysis,
  depth: number,
  labels: AnalyzedPgnLabels,
): string | null {
  if (analysis.moves.length === 0) return null

  const trimmed = originalPgn.trim()
  let headers: Record<string, string>

  try {
    const source = new Chess()
    source.loadPgn(trimmed)
    headers = source.getHeaders()
  } catch {
    return null
  }

  const moves = loadPgnMoves(trimmed)
  if (moves.length === 0) return null

  const game = new Chess()

  for (const [key, value] of Object.entries(headers)) {
    if (value) game.setHeader(key, value)
  }

  const existingAnnotator = game.getHeaders().Annotator?.trim()
  if (!existingAnnotator) {
    game.setHeader('Annotator', `Stockfish analysis — ${PGN_SITE}`)
  }

  const first = analysis.moves[0]
  if (first?.evalBeforeText) {
    game.setComment(`${labels.startEval}: ${first.evalBeforeText}. ${labels.depth}: ${depth}`)
  }

  for (let i = 0; i < moves.length; i++) {
    game.move(moves[i])
    const analyzed = analysis.moves[i]
    if (analyzed) {
      game.setComment(buildMoveComment(analyzed, depth, labels))
    }
  }

  return game.pgn()
}

function slugifyName(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 24)
}

export function analyzedPgnFilename(white: string, black: string): string {
  const w = slugifyName(white) || 'blancas'
  const b = slugifyName(black) || 'negras'
  const date = new Date().toISOString().slice(0, 10)
  return `analisis-${w}-vs-${b}-${date}.pgn`
}
