import { Chess } from 'chess.js'
import type { Arrow } from 'react-chessboard'
import {
  evaluationToCentipawns,
  type AnalyzedMove,
  type GameAnalysis,
  type MoveQuality,
} from './chessAnalysis'

export const ANALYSIS_DEPTH_OPTIONS = [8, 10, 12, 14, 16, 18] as const
export type AnalysisDepth = (typeof ANALYSIS_DEPTH_OPTIONS)[number]

export const ARROW_BEST_COLOR = 'rgba(34, 197, 94, 0.85)'
export const ARROW_PLAYED_COLOR = 'rgba(249, 115, 22, 0.85)'

const QUALITY_SCORE: Record<MoveQuality, number> = {
  brilliant: 1,
  best: 0.85,
  good: 0.65,
  interesting: 0.55,
  dubious: 0.45,
  bad: 0.35,
  veryBad: 0.1,
}

const EVAL_CAP_CP = 1000

export type PgnPlayers = {
  white: string
  black: string
}

export type MoveQualityPoint = {
  moveNumber: number
  white: number | null
  whiteSan: string | null
  whiteQuality: MoveQuality | null
  black: number | null
  blackSan: string | null
  blackQuality: MoveQuality | null
}

export type EvalPoint = {
  ply: number
  evalCp: number
  label: string
}

export function parsePgnHeaders(pgn: string): PgnPlayers {
  try {
    const game = new Chess()
    game.loadPgn(pgn.trim())
    const headers = game.getHeaders()
    return {
      white: headers.White?.trim() || '',
      black: headers.Black?.trim() || '',
    }
  } catch {
    return { white: '', black: '' }
  }
}

export function uciToArrow(uci: string | null, color: string): Arrow | null {
  if (!uci || uci.length < 4) return null
  return {
    startSquare: uci.slice(0, 2),
    endSquare: uci.slice(2, 4),
    color,
  }
}

export function buildBoardArrows(ply: number, moves: AnalyzedMove[]): Arrow[] {
  const arrows: Arrow[] = []

  if (ply === 0) {
    const best = moves[0]?.bestMove
    const arrow = uciToArrow(best, ARROW_BEST_COLOR)
    if (arrow) arrows.push(arrow)
    return arrows
  }

  const move = moves[ply - 1]
  if (!move) return arrows

  const played = uciToArrow(move.uci, ARROW_PLAYED_COLOR)
  const best = uciToArrow(move.bestMove, ARROW_BEST_COLOR)

  if (best && move.bestMove && move.bestMove !== move.uci) {
    arrows.push(best)
  }
  if (played) {
    arrows.push(played)
  } else if (best) {
    arrows.push(best)
  }

  return arrows
}

export function qualityToScore(quality: MoveQuality): number {
  return QUALITY_SCORE[quality]
}

export function buildMoveQualitySeries(analysis: GameAnalysis): MoveQualityPoint[] {
  const byNumber = new Map<number, MoveQualityPoint>()

  for (const move of analysis.moves) {
    const moveNumber = Math.ceil(move.ply / 2)
    let point = byNumber.get(moveNumber)
    if (!point) {
      point = {
        moveNumber,
        white: null,
        whiteSan: null,
        whiteQuality: null,
        black: null,
        blackSan: null,
        blackQuality: null,
      }
      byNumber.set(moveNumber, point)
    }

    if (move.color === 'w') {
      point.white = qualityToScore(move.quality)
      point.whiteSan = move.san
      point.whiteQuality = move.quality
    } else {
      point.black = qualityToScore(move.quality)
      point.blackSan = move.san
      point.blackQuality = move.quality
    }
  }

  return [...byNumber.values()].sort((a, b) => a.moveNumber - b.moveNumber)
}

function capEvalCp(cp: number): number {
  return Math.max(-EVAL_CAP_CP, Math.min(EVAL_CAP_CP, cp))
}

export function buildEvalSeries(analysis: GameAnalysis): EvalPoint[] {
  const points: EvalPoint[] = []

  if (analysis.moves.length > 0) {
    points.push({
      ply: 0,
      evalCp: capEvalCp(evaluationToCentipawns(analysis.moves[0].evalBefore)),
      label: '0',
    })
  } else {
    points.push({ ply: 0, evalCp: 0, label: '0' })
  }

  for (let i = 0; i < analysis.moves.length; i++) {
    const move = analysis.moves[i]
    points.push({
      ply: i + 1,
      evalCp: capEvalCp(evaluationToCentipawns(move.evalAfter)),
      label: String(i + 1),
    })
  }

  return points
}

export function readStoredAnalysisDepth(): AnalysisDepth {
  if (typeof sessionStorage === 'undefined') return 18
  const raw = sessionStorage.getItem('chess-analysis-depth')
  const n = Number(raw)
  if (ANALYSIS_DEPTH_OPTIONS.includes(n as AnalysisDepth)) return n as AnalysisDepth
  return 18
}

export function storeAnalysisDepth(depth: AnalysisDepth) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('chess-analysis-depth', String(depth))
  }
}
