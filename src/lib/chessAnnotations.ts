import { Chess } from 'chess.js'
import type { StockfishEvaluation } from './stockfishEngine'

/** Símbolos de evaluación (perspectiva blancas, tras la jugada). */
export const EVAL_SYMBOL = {
  equal: '=',
  whiteSlight: '±',
  blackSlight: '∓',
  whiteDecisive: '+-',
  blackDecisive: '-+',
} as const

const CP_EQUAL = 30
const CP_SLIGHT = 150

export function evaluationPositionSymbol(eval_: StockfishEvaluation | null): string {
  if (!eval_) return ''

  if (eval_.kind === 'mate') {
    return eval_.plies > 0 ? EVAL_SYMBOL.whiteDecisive : EVAL_SYMBOL.blackDecisive
  }

  const cp = eval_.centipawns
  if (Math.abs(cp) < CP_EQUAL) return EVAL_SYMBOL.equal
  if (cp >= CP_SLIGHT) return EVAL_SYMBOL.whiteDecisive
  if (cp > CP_EQUAL) return EVAL_SYMBOL.whiteSlight
  if (cp <= -CP_SLIGHT) return EVAL_SYMBOL.blackDecisive
  if (cp < -CP_EQUAL) return EVAL_SYMBOL.blackSlight
  return EVAL_SYMBOL.equal
}

const VALID_RESULTS = new Set(['1-0', '0-1', '1/2-1/2', '*'])

export function parsePgnResult(pgn: string, finalFen?: string): string {
  try {
    const game = new Chess()
    game.loadPgn(pgn.trim())
    const header = game.getHeaders().Result?.trim()
    if (header && VALID_RESULTS.has(header)) return header

    const probe = finalFen ? new Chess(finalFen) : game
    if (!probe.isGameOver()) return '*'

    if (probe.isCheckmate()) {
      return probe.turn() === 'w' ? '0-1' : '1-0'
    }
    if (probe.isDraw()) return '1/2-1/2'
    return '*'
  } catch {
    return '*'
  }
}

export const MOVE_SYMBOL_LEGEND = ['!!', '!', '!?', '?!', '?', '??'] as const

export const EVAL_SYMBOL_LEGEND = [
  EVAL_SYMBOL.equal,
  EVAL_SYMBOL.whiteSlight,
  EVAL_SYMBOL.blackSlight,
  EVAL_SYMBOL.whiteDecisive,
  EVAL_SYMBOL.blackDecisive,
] as const

export const RESULT_LEGEND = ['1-0', '0-1', '1/2-1/2', '*'] as const
