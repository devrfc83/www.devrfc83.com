const STOCKFISH_WORKER_URL = '/stockfish/stockfish.js'
export const STOCKFISH_DEPTH = 7
export const STOCKFISH_ANALYSIS_DEPTH = 18

export type StockfishEvaluation =
  | { kind: 'cp'; centipawns: number }
  | { kind: 'mate'; plies: number }

export type StockfishSearchResult = {
  bestMove: string | null
  evaluation: StockfishEvaluation | null
}

export type StockfishEngine = {
  init: () => Promise<void>
  newGame: () => Promise<void>
  search: (fen: string, depth?: number) => Promise<StockfishSearchResult>
  quit: () => void
  destroy: () => void
}

function sideToMoveFromFen(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w'
}

/** Convierte la puntuación UCI (lado al turno) a perspectiva de las blancas. */
function toWhitePerspective(
  eval_: StockfishEvaluation,
  sideToMove: 'w' | 'b',
): StockfishEvaluation {
  if (sideToMove === 'w') return eval_
  if (eval_.kind === 'cp') {
    return { kind: 'cp', centipawns: -eval_.centipawns }
  }
  return { kind: 'mate', plies: -eval_.plies }
}

function parseEvaluationFromInfoLine(line: string): StockfishEvaluation | null {
  const mate = line.match(/\bscore mate (-?\d+)\b/)
  if (mate) {
    return { kind: 'mate', plies: Number.parseInt(mate[1], 10) }
  }
  const cp = line.match(/\bscore cp (-?\d+)\b/)
  if (cp) {
    return { kind: 'cp', centipawns: Number.parseInt(cp[1], 10) }
  }
  return null
}

function latestEvaluation(infoLines: string[], fen: string): StockfishEvaluation | null {
  let last: StockfishEvaluation | null = null
  for (const line of infoLines) {
    const parsed = parseEvaluationFromInfoLine(line)
    if (parsed) last = parsed
  }
  if (!last) return null
  return toWhitePerspective(last, sideToMoveFromFen(fen))
}

export function formatEvaluation(eval_: StockfishEvaluation | null): string {
  if (!eval_) return '—'
  if (eval_.kind === 'mate') {
    if (eval_.plies === 0) return 'M0'
    const sign = eval_.plies > 0 ? '+' : '-'
    return `M${sign}${Math.abs(eval_.plies)}`
  }
  const pawns = eval_.centipawns / 100
  if (Math.abs(pawns) < 0.05) return '0.0'
  return pawns > 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1)
}

export function createStockfishEngine(): StockfishEngine {
  const worker = new Worker(STOCKFISH_WORKER_URL)
  const listeners: Array<(message: string) => void> = []

  worker.onmessage = (event: MessageEvent<string>) => {
    const message = event.data
    if (typeof message !== 'string') return
    listeners.forEach((listener) => listener(message))
  }

  const post = (command: string) => {
    worker.postMessage(command)
  }

  const waitFor = (match: (message: string) => boolean): Promise<string> =>
    new Promise((resolve) => {
      const listener = (message: string) => {
        if (!match(message)) return
        listeners.splice(listeners.indexOf(listener), 1)
        resolve(message)
      }
      listeners.push(listener)
    })

  const init = async () => {
    post('uci')
    await waitFor((message) => message === 'uciok')
    post('setoption name Skill Level value 10')
    post('isready')
    await waitFor((message) => message === 'readyok')
    post('ucinewgame')
  }

  const newGame = async () => {
    post('ucinewgame')
    post('isready')
    await waitFor((message) => message === 'readyok')
  }

  const search = async (fen: string, depth = STOCKFISH_DEPTH): Promise<StockfishSearchResult> => {
    const infoLines: string[] = []
    const collector = (message: string) => {
      if (message.startsWith('info ')) infoLines.push(message)
    }
    listeners.push(collector)

    try {
      post(`position fen ${fen}`)
      post(`go depth ${depth}`)
      const line = await waitFor((message) => message.startsWith('bestmove'))
      const move = line.split(' ')[1]
      return {
        bestMove: !move || move === '(none)' ? null : move,
        evaluation: latestEvaluation(infoLines, fen),
      }
    } finally {
      listeners.splice(listeners.indexOf(collector), 1)
    }
  }

  return {
    init,
    newGame,
    search,
    quit: () => post('quit'),
    destroy: () => worker.terminate(),
  }
}
