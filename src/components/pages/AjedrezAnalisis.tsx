import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesLeft,
  faAnglesRight,
  faAngleLeft,
  faAngleRight,
  faCamera,
  faClipboard,
  faDownload,
  faFileLines,
  faRotate,
} from '@fortawesome/free-solid-svg-icons'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import Pagina from '../partials/Pagina'
import LocalizedLink from '../partials/LocalizedLink'
import AnalysisCharts from '../chess/AnalysisCharts'
import AnalysisMoveLegend from '../chess/AnalysisMoveLegend'
import { evaluationPositionSymbol, parsePgnResult } from '../../lib/chessAnnotations'
import {
  analyzePgn,
  buildFensFromPgn,
  emptyAnalysisSummary,
  loadPgnMoves,
  moveAtPly,
  MOVE_QUALITY_SYMBOL,
  type GameAnalysis,
  type MoveQuality,
} from '../../lib/chessAnalysis'
import {
  ANALYSIS_DEPTH_OPTIONS,
  buildBoardArrows,
  parsePgnHeaders,
  readStoredAnalysisDepth,
  storeAnalysisDepth,
  type AnalysisDepth,
  type PgnPlayers,
} from '../../lib/chessAnalysisCharts'
import { analyzedPgnFilename, buildAnalyzedPgn } from '../../lib/chessAnalysisPgn'
import { downloadBoardPng } from '../../lib/chessBoardImage'
import { downloadPgnFile } from '../../lib/chessPgn'
import { consumePgnForAnalysis } from '../../lib/chessPgnTransfer'
import { historyToMovePairs } from '../../lib/chessMoves'
import { createStockfishEngine, formatEvaluation, type StockfishEngine } from '../../lib/stockfishEngine'

const FEN_INICIAL = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const QUALITY_BADGE: Record<MoveQuality, string> = {
  brilliant: 'badge-info',
  best: 'badge-success',
  good: 'badge-ghost',
  interesting: 'badge-info badge-outline',
  dubious: 'badge-warning badge-outline',
  bad: 'badge-warning',
  veryBad: 'badge-error',
}

const QUALITY_SYMBOL_CLASS: Record<MoveQuality, string> = {
  brilliant: 'text-info',
  best: 'text-success',
  good: '',
  interesting: 'text-info',
  dubious: 'text-warning',
  bad: 'text-warning',
  veryBad: 'text-error',
}

const SUMMARY_QUALITIES: MoveQuality[] = [
  'brilliant',
  'best',
  'good',
  'interesting',
  'dubious',
  'bad',
  'veryBad',
]

const AjedrezAnalisis = () => {
  const { t } = useTranslation()
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const engineRef = useRef<StockfishEngine | null>(null)
  const abortRef = useRef(false)

  const [motorListo, setMotorListo] = useState(false)
  const [errorMotor, setErrorMotor] = useState<string | null>(null)
  const [pgnInput, setPgnInput] = useState('')
  const [previewFens, setPreviewFens] = useState<string[] | null>(null)
  const [players, setPlayers] = useState<PgnPlayers>({ white: '', black: '' })
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null)
  const [ply, setPly] = useState(0)
  const [analizando, setAnalizando] = useState(false)
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const [errorPgn, setErrorPgn] = useState<string | null>(null)
  const [copiadoFen, setCopiadoFen] = useState(false)
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>(() => readStoredAnalysisDepth())
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [pgnDesdeJuego, setPgnDesdeJuego] = useState(false)
  const [analysisSourcePgn, setAnalysisSourcePgn] = useState('')
  const [inputMode, setInputMode] = useState<'pgn' | 'editor'>('pgn')
  const editorGameRef = useRef(new Chess())
  const [editorSans, setEditorSans] = useState<string[]>([])

  const fens = analysis?.fens ?? previewFens
  const maxPly = Math.max(0, (fens?.length ?? 1) - 1)
  const fen = fens ? fens[Math.min(ply, maxPly)] : FEN_INICIAL
  const jugadaActual = analysis ? moveAtPly(analysis, ply) : null

  const previewSans = useMemo(() => {
    if (!previewFens) return []
    try {
      return loadPgnMoves(pgnInput.trim()).map((m) => m.san)
    } catch {
      return []
    }
  }, [pgnInput, previewFens])

  const currentSans = inputMode === 'editor' ? editorSans : previewSans
  const movePairs = useMemo(() => historyToMovePairs(currentSans), [currentSans])

  const gameResult = useMemo(() => {
    const pgnForResult = inputMode === 'editor' ? editorGameRef.current.pgn() : pgnInput
    return parsePgnResult(pgnForResult, fens?.[fens.length - 1])
  }, [inputMode, pgnInput, fens])

  const boardArrows = useMemo(
    () => buildBoardArrows(ply, analysis?.moves ?? []),
    [ply, analysis?.moves],
  )

  const whiteName = players.white || t('chess.analysis.unknownPlayer')
  const blackName = players.black || t('chess.analysis.unknownPlayer')

  const actualizarVistaPrevia = useCallback(
    (texto: string) => {
      const trimmed = texto.trim()
      if (!trimmed) {
        setPreviewFens(null)
        setPlayers({ white: '', black: '' })
        return
      }
      try {
        setPreviewFens(buildFensFromPgn(trimmed))
        setPlayers(parsePgnHeaders(trimmed))
        setErrorPgn(null)
      } catch {
        setPreviewFens(null)
        setPlayers({ white: '', black: '' })
      }
    },
    [],
  )

  useEffect(() => {
    const id = window.setTimeout(() => actualizarVistaPrevia(pgnInput), 400)
    return () => window.clearTimeout(id)
  }, [pgnInput, actualizarVistaPrevia])

  useEffect(() => {
    const imported = consumePgnForAnalysis()
    if (!imported) return
    setPgnInput(imported)
    actualizarVistaPrevia(imported)
    setPgnDesdeJuego(true)
    setAnalysis(null)
    setPly(0)
    setErrorPgn(null)
  }, [actualizarVistaPrevia])

  useEffect(() => {
    const engine = createStockfishEngine()
    engineRef.current = engine
    engine
      .init()
      .then(() => setMotorListo(true))
      .catch(() => setErrorMotor(t('chess.engineError')))

    return () => {
      abortRef.current = true
      engine.quit()
      engine.destroy()
      engineRef.current = null
    }
  }, [t])

  const onDepthChange = (depth: AnalysisDepth) => {
    setAnalysisDepth(depth)
    storeAnalysisDepth(depth)
  }

  const analizar = useCallback(async () => {
    const engine = engineRef.current
    if (!engine || !motorListo) return

    const texto = inputMode === 'editor' ? editorGameRef.current.pgn().trim() : pgnInput.trim()
    if (!texto) {
      setErrorPgn(
        inputMode === 'editor' ? t('chess.analysis.editorRequired') : t('chess.analysis.pgnRequired'),
      )
      return
    }

    let fensIniciales: string[]
    try {
      fensIniciales = buildFensFromPgn(texto)
      setPlayers(parsePgnHeaders(texto))
    } catch {
      setErrorPgn(t('chess.analysis.pgnInvalid'))
      return
    }

    setErrorPgn(null)
    setAnalysisSourcePgn(texto)
    setAnalizando(true)
    setPly(0)
    abortRef.current = false
    setAnalysis({
      fens: fensIniciales,
      moves: [],
      summary: emptyAnalysisSummary(),
    })

    try {
      const result = await analyzePgn(texto, engine, {
        depth: analysisDepth,
        onProgress: ({ ply: p, total }) => setProgreso({ actual: p, total }),
        onPartialUpdate: setAnalysis,
        shouldAbort: () => abortRef.current,
      })
      if (!abortRef.current) {
        setAnalysis(result)
        setPly(0)
      }
    } catch {
      if (!abortRef.current) {
        setErrorPgn(t('chess.analysis.pgnInvalid'))
        setAnalysis(null)
      }
    } finally {
      setAnalizando(false)
    }
  }, [motorListo, pgnInput, t, analysisDepth, inputMode])

  const cancelar = () => {
    abortRef.current = true
    setAnalizando(false)
  }

  const irAPly = (nuevoPly: number) => {
    if (!fens) return
    setPly(Math.max(0, Math.min(nuevoPly, maxPly)))
  }

  const copiarFen = async () => {
    try {
      await navigator.clipboard.writeText(fen)
      setCopiadoFen(true)
      window.setTimeout(() => setCopiadoFen(false), 2000)
    } catch {
      setCopiadoFen(false)
    }
  }

  const exportarPng = async () => {
    if (!boardRef.current) return
    await downloadBoardPng(boardRef.current, `tablero-${ply}.png`)
  }

  const descargarPgnAnalisis = () => {
    if (!analysis || analysis.moves.length === 0) return

    const qualityLabels = {
      brilliant: t('chess.analysis.quality.brilliant'),
      best: t('chess.analysis.quality.best'),
      good: t('chess.analysis.quality.good'),
      interesting: t('chess.analysis.quality.interesting'),
      dubious: t('chess.analysis.quality.dubious'),
      bad: t('chess.analysis.quality.bad'),
      veryBad: t('chess.analysis.quality.veryBad'),
    } as const

    const pgn = buildAnalyzedPgn(analysisSourcePgn || pgnInput, analysis, analysisDepth, {
      quality: qualityLabels,
      bestMove: t('chess.analysis.pgnComment.bestMove'),
      depth: t('chess.analysis.pgnComment.depth'),
      startEval: t('chess.analysis.pgnComment.startEval'),
    })

    if (!pgn) return

    downloadPgnFile(pgn, analyzedPgnFilename(players.white, players.black))
  }

  const onArchivoPgn = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const texto = String(reader.result ?? '')
      setPgnInput(texto)
      actualizarVistaPrevia(texto)
    }
    reader.readAsText(file)
  }

  const actualizarEditorDesdeJuego = useCallback(() => {
    const game = editorGameRef.current
    const sans = game.history()
    const temp = new Chess()
    const editorFens = [temp.fen()]
    for (const san of sans) {
      temp.move(san)
      editorFens.push(temp.fen())
    }

    setEditorSans(sans)
    setPreviewFens(editorFens)
    setPly(editorFens.length > 1 ? editorFens.length - 1 : 0)
    setPlayers({ white: '', black: '' })
  }, [])

  const onDropEditor = (args: any) => {
    const { sourceSquare, targetSquare } = args as {
      sourceSquare: string
      targetSquare: string | null
    }
    if (!targetSquare) return false
    const game = editorGameRef.current
    const piece = game.get(sourceSquare as any)
    const requiresPromotion =
      piece?.type === 'p' &&
      ((piece.color === 'w' && targetSquare.endsWith('8')) ||
        (piece.color === 'b' && targetSquare.endsWith('1')))

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: requiresPromotion ? 'q' : undefined,
    })

    if (!move) return false

    setAnalysis(null)
    setErrorPgn(null)
    setPgnDesdeJuego(false)
    actualizarEditorDesdeJuego()
    return true
  }

  const reiniciarEditor = () => {
    editorGameRef.current = new Chess()
    setAnalysis(null)
    setAnalysisSourcePgn('')
    setErrorPgn(null)
    setPgnDesdeJuego(false)
    actualizarEditorDesdeJuego()
  }

  const reiniciar = () => {
    abortRef.current = true
    setAnalizando(false)
    setAnalysis(null)
    setPly(0)
    setProgreso({ actual: 0, total: 0 })
    setAnalysisSourcePgn('')
  }

  const evalActual =
    ply === 0
      ? analysis?.moves[0]?.evalBefore ?? null
      : jugadaActual?.evalAfter ?? analysis?.moves[ply - 1]?.evalAfter ?? null

  const totalJugadas = currentSans.length
  const summary = analysis?.summary ?? emptyAnalysisSummary()
  const hayPartida = Boolean(fens && fens.length > 1)
  const mostrarGraficos = Boolean(analysis && analysis.moves.length > 0 && !analizando)
  const puedeDescargarPgn = Boolean(analysis && analysis.moves.length > 0 && !analizando)

  const renderMoveCell = (san: string | undefined, plyNum: number, index: number) => {
    if (!san) return <td className='text-base-content/30'>—</td>

    const analizado = analysis?.moves[index]
    const esActual = ply === plyNum
    const analizandoEsta = analizando && progreso.actual === plyNum && !analizado
    const posSym = analizado ? evaluationPositionSymbol(analizado.evalAfter) : ''

    return (
      <td className='p-0'>
        <button
          type='button'
          className={`w-full text-left rounded px-2 py-1 font-mono text-sm flex items-center gap-1 min-h-[2rem] ${esActual ? 'bg-primary/20 font-semibold' : 'hover:bg-base-300'}`}
          onClick={() => irAPly(plyNum)}
        >
          <span className='flex-1 truncate min-w-0'>
            <span>{san}</span>
            {analizado && (analizado.symbol || posSym) ? (
              <span className='ms-1 inline-flex items-center gap-1 font-mono text-xs align-middle'>
                {analizado.symbol ? (
                  <span className={`font-bold ${QUALITY_SYMBOL_CLASS[analizado.quality]}`}>
                    {analizado.symbol}
                  </span>
                ) : null}
                {posSym ? (
                  <span
                    className='font-semibold text-base-content/70'
                    title={formatEvaluation(analizado.evalAfter)}
                  >
                    {posSym}
                  </span>
                ) : null}
              </span>
            ) : null}
          </span>
          {analizandoEsta ? (
            <span className='loading loading-spinner loading-xs shrink-0' />
          ) : null}
        </button>
      </td>
    )
  }

  return (
    <Pagina className='animate-page-in max-w-5xl mx-auto'>
      <p className='text-sm text-base-content/60 mb-2'>
        <LocalizedLink page='chess' className='link link-motion link-hover'>
          {t('chess.analysis.backChess')}
        </LocalizedLink>
      </p>
      <h1 className='text-3xl font-bold mb-2'>{t('chess.analysis.title')}</h1>
      <p className='text-base-content/80 mb-6'>{t('chess.analysis.intro')}</p>

      {pgnDesdeJuego && (
        <div className='alert alert-info mb-4 text-sm'>
          <span>{t('chess.analysis.pgnFromPlay')}</span>
          <button
            type='button'
            className='btn btn-ghost btn-xs'
            aria-label={t('chess.analysis.pgnFromPlayDismiss')}
            onClick={() => setPgnDesdeJuego(false)}
          >
            ×
          </button>
        </div>
      )}

      {errorMotor && <div className='alert alert-error mb-4 text-sm'>{errorMotor}</div>}

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 items-start'>
        <div className='w-full lg:flex-1 space-y-3'>
          <div className='flex flex-col items-center justify-center gap-2 w-full max-w-[min(100%,28rem)] mx-auto'>
            <p
              className='text-sm font-semibold text-center w-full truncate px-1'
              title={blackName}
            >
              <span className='text-base-content/50 block text-xs uppercase'>
                {t('chess.panel.black')}
              </span>
              {blackName}
            </p>

            <div
              ref={boardRef}
              className='relative w-full aspect-square rounded-xl overflow-hidden shadow-md shrink-0'
            >
              <Chessboard
                options={{
                  position: fen,
                  boardOrientation,
                  allowDragging: inputMode === 'editor' && !analizando,
                  onPieceDrop: inputMode === 'editor' ? onDropEditor : undefined,
                  arrows: boardArrows,
                  clearArrowsOnPositionChange: true,
                  darkSquareStyle: { backgroundColor: '#4a5568' },
                  lightSquareStyle: { backgroundColor: '#a0aec0' },
                }}
              />
              {analizando && (
                <div
                  className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-base-300/80 backdrop-blur-[2px]'
                  aria-live='polite'
                  aria-busy='true'
                >
                  <span className='loading loading-spinner loading-lg text-primary' />
                  <p className='text-sm font-medium text-base-content/90 px-4 text-center'>
                    {progreso.total > 0
                      ? t('chess.analysis.progress', {
                          current: progreso.actual,
                          total: progreso.total,
                        })
                      : t('chess.analysis.analyzing')}
                  </p>
                </div>
              )}
            </div>

            <p
              className='text-sm font-semibold text-center w-full truncate px-1'
              title={whiteName}
            >
              <span className='text-base-content/50 block text-xs uppercase'>
                {t('chess.panel.white')}
              </span>
              {whiteName}
            </p>
          </div>

          {boardArrows.length > 0 && (
            <p className='text-xs text-center text-base-content/60 flex flex-wrap justify-center gap-3'>
              <span>
                <span
                  className='inline-block w-3 h-0.5 align-middle me-1'
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.85)' }}
                />
                {t('chess.analysis.arrowBest')}
              </span>
              {ply > 0 && (
                <span>
                  <span
                    className='inline-block w-3 h-0.5 align-middle me-1'
                    style={{ backgroundColor: 'rgba(249, 115, 22, 0.85)' }}
                  />
                  {t('chess.analysis.arrowPlayed')}
                </span>
              )}
            </p>
          )}

          <div className='flex flex-wrap items-center justify-center gap-2'>
            <button
              type='button'
              className='btn btn-sm btn-outline btn-motion gap-2'
              onClick={() =>
                setBoardOrientation((o) => (o === 'white' ? 'black' : 'white'))
              }
              disabled={!hayPartida}
              aria-label={t('chess.analysis.rotateBoard')}
            >
              <FontAwesomeIcon icon={faRotate} aria-hidden />
              {t('chess.analysis.rotateBoard')}
            </button>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-1'>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              onClick={() => irAPly(0)}
              disabled={!hayPartida}
              aria-label={t('chess.analysis.goStart')}
            >
              <FontAwesomeIcon icon={faAnglesLeft} />
            </button>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              onClick={() => irAPly(ply - 1)}
              disabled={!hayPartida || ply <= 0}
              aria-label={t('chess.analysis.goPrev')}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
            <span className='text-sm font-mono px-2 tabular-nums min-w-[5rem] text-center'>
              {hayPartida ? t('chess.analysis.ply', { ply, total: totalJugadas }) : '—'}
            </span>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              onClick={() => irAPly(ply + 1)}
              disabled={!hayPartida || ply >= maxPly}
              aria-label={t('chess.analysis.goNext')}
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>
            <button
              type='button'
              className='btn btn-sm btn-ghost btn-square'
              onClick={() => irAPly(maxPly)}
              disabled={!hayPartida}
              aria-label={t('chess.analysis.goEnd')}
            >
              <FontAwesomeIcon icon={faAnglesRight} />
            </button>
          </div>

          <p className='text-center text-2xl font-mono font-semibold tabular-nums min-h-[2rem]'>
            {analizando && !evalActual ? (
              <span className='text-base text-base-content/50'>{t('chess.panel.analyzing')}</span>
            ) : (
              formatEvaluation(evalActual)
            )}
          </p>

          {jugadaActual && (
            <p className='text-center text-sm text-base-content/80'>
              {jugadaActual.san}
              {jugadaActual.symbol && (
                <span className='font-semibold ms-1'>{jugadaActual.symbol}</span>
              )}
              <span className='text-base-content/50 ms-2'>
                ({jugadaActual.evalBeforeText} → {jugadaActual.evalAfterText})
              </span>
            </p>
          )}

          <div className='flex flex-col gap-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>
              FEN
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                readOnly
                value={fen}
                className='input input-bordered input-sm font-mono text-xs flex-1'
              />
              <button
                type='button'
                className='btn btn-outline btn-sm btn-motion gap-1 shrink-0'
                onClick={() => void copiarFen()}
                disabled={!hayPartida}
              >
                <FontAwesomeIcon icon={faClipboard} aria-hidden />
                {copiadoFen ? t('chess.analysis.fenCopied') : t('chess.analysis.copyFen')}
              </button>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 justify-center'>
            <button
              type='button'
              className='btn btn-outline btn-sm btn-motion gap-2'
              onClick={() => void exportarPng()}
              disabled={!hayPartida}
            >
              <FontAwesomeIcon icon={faCamera} aria-hidden />
              {t('chess.analysis.downloadPositionImage')}
            </button>
            <button
              type='button'
              className='btn btn-outline btn-sm btn-motion gap-2'
              onClick={descargarPgnAnalisis}
              disabled={!puedeDescargarPgn}
            >
              <FontAwesomeIcon icon={faDownload} aria-hidden />
              {t('chess.analysis.downloadAnalyzedPgn')}
            </button>
            {(analysis || pgnInput.trim()) && (
              <button type='button' className='btn btn-ghost btn-sm btn-motion' onClick={reiniciar}>
                {t('chess.analysis.newAnalysis')}
              </button>
            )}
          </div>

          {mostrarGraficos && analysis && <AnalysisCharts analysis={analysis} />}
        </div>

        <aside className='card bg-base-200 shadow-sm w-full lg:w-80 shrink-0 rounded-2xl'>
          <div className='card-body gap-4 p-4 min-h-0'>
            <section className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1.5 w-full'>
                <span className='label-text font-medium'>{t('chess.analysis.inputModeLabel')}</span>
                <div className='join join-vertical w-full'>
                  <button
                    type='button'
                    className={`btn btn-sm join-item w-full ${inputMode === 'pgn' ? 'btn-primary' : 'btn-outline'}`}
                    disabled={analizando}
                    onClick={() => {
                      setInputMode('pgn')
                      setErrorPgn(null)
                      actualizarVistaPrevia(pgnInput)
                    }}
                  >
                    {t('chess.analysis.inputModePgn')}
                  </button>
                  <button
                    type='button'
                    className={`btn btn-sm join-item w-full ${inputMode === 'editor' ? 'btn-primary' : 'btn-outline'}`}
                    disabled={analizando}
                    onClick={() => {
                      setInputMode('editor')
                      setErrorPgn(null)
                      if (editorSans.length === 0) actualizarEditorDesdeJuego()
                    }}
                  >
                    {t('chess.analysis.inputModeEditor')}
                  </button>
                </div>
              </div>
              {inputMode === 'pgn' ? (
                <label className='form-control w-full gap-1.5'>
                  <span className='label-text font-medium'>{t('chess.analysis.pgnLabel')}</span>
                  <textarea
                    className={`textarea textarea-bordered min-h-28 font-mono text-sm w-full ${errorPgn ? 'textarea-error' : ''}`}
                    value={pgnInput}
                    onChange={(e) => {
                      setPgnInput(e.target.value)
                      setErrorPgn(null)
                    }}
                    placeholder={t('chess.analysis.pgnPlaceholder')}
                    disabled={analizando}
                  />
                </label>
              ) : (
                <div className='alert alert-info text-xs'>{t('chess.analysis.editorHelp')}</div>
              )}
              {errorPgn && (
                <span className='text-error text-xs' role='alert'>
                  {errorPgn}
                </span>
              )}
              <input
                ref={fileInputRef}
                type='file'
                accept='.pgn,.txt,text/plain'
                className='hidden'
                onChange={(e) => {
                  onArchivoPgn(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <label className='form-control w-full gap-1'>
                <span className='label-text text-sm'>{t('chess.analysis.depthLabel')}</span>
                <select
                  className='select select-bordered select-sm w-full'
                  value={analysisDepth}
                  onChange={(e) => onDepthChange(Number(e.target.value) as AnalysisDepth)}
                  disabled={analizando}
                >
                  {ANALYSIS_DEPTH_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <div className='flex flex-col gap-2'>
                {inputMode === 'pgn' ? (
                  <button
                    type='button'
                    className='btn btn-outline btn-sm btn-motion gap-2'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analizando}
                  >
                    <FontAwesomeIcon icon={faFileLines} aria-hidden />
                    {t('chess.analysis.uploadPgn')}
                  </button>
                ) : (
                  <button
                    type='button'
                    className='btn btn-outline btn-sm btn-motion'
                    onClick={reiniciarEditor}
                    disabled={analizando}
                  >
                    {t('chess.analysis.editorReset')}
                  </button>
                )}
                <button
                  type='button'
                  className='btn btn-primary btn-sm btn-motion'
                  onClick={() => void analizar()}
                  disabled={!motorListo || analizando}
                >
                  {analizando ? t('chess.analysis.analyzing') : t('chess.analysis.analyze')}
                </button>
                {analizando && (
                  <button type='button' className='btn btn-ghost btn-sm btn-motion' onClick={cancelar}>
                    {t('chess.analysis.cancel')}
                  </button>
                )}
              </div>
              {!motorListo && !errorMotor && (
                <p className='text-xs text-base-content/60 mt-2'>{t('chess.loadingEngine')}</p>
              )}
            </section>

            <div className='divider my-0' />

            <section>
              <h2 className='text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2'>
                {t('chess.analysis.summary')}
              </h2>
              <ul className='grid grid-cols-2 gap-2 text-sm'>
                {SUMMARY_QUALITIES.map((q) => (
                  <li key={q} className='flex items-center justify-between gap-2'>
                    <span className={`badge badge-sm ${QUALITY_BADGE[q]}`}>
                      {MOVE_QUALITY_SYMBOL[q] || '·'}
                      <span className='ms-1'>{t(`chess.analysis.quality.${q}`)}</span>
                    </span>
                    <span className='font-mono tabular-nums'>{summary[q]}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className='divider my-0' />

            <section className='min-h-0 flex flex-col'>
              <div className='flex items-baseline justify-between gap-2 mb-2'>
                <h2 className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>
                  {t('chess.panel.moveList')}
                </h2>
                {hayPartida && (
                  <span className='text-xs font-mono font-bold text-primary shrink-0'>
                    {gameResult}
                  </span>
                )}
              </div>
              {hayPartida && <AnalysisMoveLegend gameResult={gameResult} />}
              {!hayPartida ? (
                <p className='text-sm text-base-content/60'>{t('chess.panel.noMoves')}</p>
              ) : (
                <div className='overflow-y-auto max-h-64 lg:max-h-[min(24rem,55vh)] pr-1'>
                  <button
                    type='button'
                    className={`w-full text-left rounded px-2 py-1 text-sm mb-2 ${ply === 0 ? 'bg-primary/20 font-semibold' : 'hover:bg-base-300'}`}
                    onClick={() => irAPly(0)}
                  >
                    {t('chess.analysis.startPosition')}
                  </button>
                  <table className='table table-xs table-pin-rows w-full'>
                    <thead>
                      <tr className='text-base-content/60'>
                        <th className='w-8'>#</th>
                        <th>{t('chess.panel.white')}</th>
                        <th>{t('chess.panel.black')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movePairs.map((pair) => {
                        const whiteIndex = (pair.number - 1) * 2
                        const blackIndex = whiteIndex + 1
                        const whitePly = whiteIndex + 1
                        const blackPly = blackIndex + 1

                        return (
                          <tr key={pair.number}>
                            <td className='text-base-content/50 font-mono'>{pair.number}.</td>
                            {renderMoveCell(pair.white, whitePly, whiteIndex)}
                            {renderMoveCell(pair.black, blackPly, blackIndex)}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </aside>
      </div>
    </Pagina>
  )
}

export default AjedrezAnalisis
