import { Chess, type Move } from 'chess.js'
import {
  formatEvaluation,
  STOCKFISH_ANALYSIS_DEPTH,
  type StockfishEngine,
  type StockfishEvaluation,
} from './stockfishEngine'

export type MoveQuality =
  | 'brilliant'
  | 'best'
  | 'good'
  | 'interesting'
  | 'dubious'
  | 'bad'
  | 'veryBad'

export type AnalyzedMove = {
  ply: number
  san: string
  uci: string
  color: 'w' | 'b'
  quality: MoveQuality
  symbol: string
  evalBefore: StockfishEvaluation | null
  evalAfter: StockfishEvaluation | null
  evalBeforeText: string
  evalAfterText: string
  cpLoss: number
  bestMove: string | null
  isBestMove: boolean
}

export type GameAnalysis = {
  fens: string[]
  moves: AnalyzedMove[]
  summary: Record<MoveQuality, number>
}

export const MOVE_QUALITY_SYMBOL: Record<MoveQuality, string> = {
  brilliant: '!!',
  best: '!',
  good: '',
  interesting: '!?',
  dubious: '?!',
  bad: '?',
  veryBad: '??',
}

export function evaluationToCentipawns(eval_: StockfishEvaluation | null): number {
  if (!eval_) return 0
  if (eval_.kind === 'mate') {
    const sign = eval_.plies > 0 ? 1 : -1
    return sign * (100_000 - Math.abs(eval_.plies))
  }
  return eval_.centipawns
}

function cpLossForPlayer(
  evalBefore: StockfishEvaluation | null,
  evalAfter: StockfishEvaluation | null,
  color: 'w' | 'b',
): number {
  const before = evaluationToCentipawns(evalBefore)
  const after = evaluationToCentipawns(evalAfter)
  const loss = color === 'w' ? before - after : after - before
  return Math.max(0, loss)
}

function moveToUci(move: Move): string {
  return move.lan ?? move.from + move.to + (move.promotion ?? '')
}

function isBrilliantMove(
  move: Move,
  isBestMove: boolean,
  cpLoss: number,
  evalBefore: StockfishEvaluation | null,
  evalAfter: StockfishEvaluation | null,
  color: 'w' | 'b',
): boolean {
  if (!isBestMove || cpLoss > 10) return false
  const givesCheck = move.san.includes('+') || move.san.includes('#')
  if (!move.isCapture() && !givesCheck) return false

  const before = evaluationToCentipawns(evalBefore)
  const after = evaluationToCentipawns(evalAfter)
  const swing = color === 'w' ? after - before : before - after
  return swing >= 80
}

function classifyMove(
  move: Move,
  isBestMove: boolean,
  cpLoss: number,
  evalBefore: StockfishEvaluation | null,
  evalAfter: StockfishEvaluation | null,
  ply: number,
): MoveQuality {
  if (ply < 8) return 'good'

  if (isBrilliantMove(move, isBestMove, cpLoss, evalBefore, evalAfter, move.color)) {
    return 'brilliant'
  }
  if (isBestMove || cpLoss <= 20) return 'best'
  if (cpLoss <= 45) return 'good'
  if (cpLoss <= 70 && !isBestMove) return 'interesting'
  if (cpLoss <= 110) return 'dubious'
  if (cpLoss <= 200) return 'bad'
  return 'veryBad'
}

function summarize(moves: AnalyzedMove[]): Record<MoveQuality, number> {
  const summary: Record<MoveQuality, number> = {
    brilliant: 0,
    best: 0,
    good: 0,
    interesting: 0,
    dubious: 0,
    bad: 0,
    veryBad: 0,
  }
  for (const move of moves) {
    summary[move.quality] += 1
  }
  return summary
}

export function loadPgnMoves(pgn: string): Move[] {
  const game = new Chess()
  game.loadPgn(pgn.trim())
  return game.history({ verbose: true }) as Move[]
}

export function buildFensFromPgn(pgn: string): string[] {
  const moves = loadPgnMoves(pgn)
  const replay = new Chess()
  const fens: string[] = [replay.fen()]
  for (const move of moves) {
    replay.move(move)
    fens.push(replay.fen())
  }
  return fens
}

export function emptyAnalysisSummary(): Record<MoveQuality, number> {
  return {
    brilliant: 0,
    best: 0,
    good: 0,
    interesting: 0,
    dubious: 0,
    bad: 0,
    veryBad: 0,
  }
}

export type AnalysisProgress = {
  ply: number
  total: number
}

export async function analyzePgn(
  pgn: string,
  engine: StockfishEngine,
  options?: {
    depth?: number
    onProgress?: (progress: AnalysisProgress) => void
    onPartialUpdate?: (partial: GameAnalysis) => void
    shouldAbort?: () => boolean
  },
): Promise<GameAnalysis> {
  const moves = loadPgnMoves(pgn)
  const depth = options?.depth ?? STOCKFISH_ANALYSIS_DEPTH
  const replay = new Chess()
  const fens: string[] = [replay.fen()]
  const analyzed: AnalyzedMove[] = []

  for (let i = 0; i < moves.length; i++) {
    if (options?.shouldAbort?.()) break

    const move = moves[i]
    const fenBefore = replay.fen()
    options?.onProgress?.({ ply: i + 1, total: moves.length })

    const { bestMove, evaluation: evalBefore } = await engine.search(fenBefore, depth)
    replay.move(move)
    const fenAfter = replay.fen()
    const { evaluation: evalAfter } = await engine.search(fenAfter, depth)

    const uci = moveToUci(move)
    const isBestMove = Boolean(bestMove && (uci === bestMove || uci.startsWith(bestMove)))
    const cpLoss = cpLossForPlayer(evalBefore, evalAfter, move.color)
    const quality = classifyMove(move, isBestMove, cpLoss, evalBefore, evalAfter, i)

    analyzed.push({
      ply: i + 1,
      san: move.san,
      uci,
      color: move.color,
      quality,
      symbol: MOVE_QUALITY_SYMBOL[quality],
      evalBefore,
      evalAfter,
      evalBeforeText: formatEvaluation(evalBefore),
      evalAfterText: formatEvaluation(evalAfter),
      cpLoss,
      bestMove,
      isBestMove,
    })
    fens.push(fenAfter)
    options?.onPartialUpdate?.({
      fens: [...fens],
      moves: [...analyzed],
      summary: summarize(analyzed),
    })
  }

  return {
    fens,
    moves: analyzed,
    summary: summarize(analyzed),
  }
}

export function fenAtPly(analysis: GameAnalysis, ply: number): string {
  const index = Math.max(0, Math.min(ply, analysis.fens.length - 1))
  return analysis.fens[index]
}

export function moveAtPly(analysis: GameAnalysis, ply: number): AnalyzedMove | null {
  if (ply <= 0 || ply > analysis.moves.length) return null
  return analysis.moves[ply - 1]
}
