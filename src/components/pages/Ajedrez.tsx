import { useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faChessKing,
  faDownload,
  faVolumeHigh,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { Chess, type Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import Pagina from '../partials/Pagina'
import LocalizedLink from '../partials/LocalizedLink'
import { historyToMovePairs } from '../../lib/chessMoves'
import { useLocale } from '../../i18n/LocaleContext'
import { pathFor } from '../../i18n/routes'
import { buildPgn, downloadPgnFile, pgnFilename } from '../../lib/chessPgn'
import { storePgnForAnalysis } from '../../lib/chessPgnTransfer'
import {
  initChessSoundsMuted,
  playChessMoveSound,
  setChessSoundsMuted,
  unlockChessSounds,
} from '../../lib/chessSounds'
import {
  createStockfishEngine,
  formatEvaluation,
  type StockfishEngine,
  type StockfishEvaluation,
} from '../../lib/stockfishEngine'

type ColorJugador = 'w' | 'b'

const colorMotor = (humano: ColorJugador): ColorJugador => (humano === 'w' ? 'b' : 'w')

const evalHintKey = (eval_: StockfishEvaluation | null): string => {
  if (!eval_) return 'chess.panel.analyzing'
  if (eval_.kind === 'mate') {
    return eval_.plies > 0 ? 'chess.panel.whiteAdvantage' : 'chess.panel.blackAdvantage'
  }
  if (eval_.centipawns > 30) return 'chess.panel.whiteAdvantage'
  if (eval_.centipawns < -30) return 'chess.panel.blackAdvantage'
  return 'chess.panel.equal'
}

const Ajedrez = () => {
  const { t } = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const gameRef = useRef(new Chess())
  const engineRef = useRef<StockfishEngine | null>(null)
  const searchGenRef = useRef(0)
  const colorJugadorRef = useRef<ColorJugador>('w')
  const [colorJugador, setColorJugador] = useState<ColorJugador>('w')
  const [fen, setFen] = useState(() => gameRef.current.fen())
  const [historial, setHistorial] = useState<string[]>([])
  const [evaluacion, setEvaluacion] = useState<StockfishEvaluation | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [estado, setEstado] = useState('')
  const [motorListo, setMotorListo] = useState(false)
  const [pensando, setPensando] = useState(false)
  const [errorMotor, setErrorMotor] = useState<string | null>(null)
  const [mostrarEvaluacion, setMostrarEvaluacion] = useState(false)
  const mostrarEvaluacionRef = useRef(false)
  const [modalPgnAbierto, setModalPgnAbierto] = useState(false)
  const [nombreJugadorPgn, setNombreJugadorPgn] = useState('')
  const [errorNombrePgn, setErrorNombrePgn] = useState('')
  const [sonidosSilenciados, setSonidosSilenciados] = useState(() => initChessSoundsMuted())

  useEffect(() => {
    mostrarEvaluacionRef.current = mostrarEvaluacion
  }, [mostrarEvaluacion])

  const alternarSonidos = () => {
    const silenciado = !sonidosSilenciados
    setChessSoundsMuted(silenciado)
    setSonidosSilenciados(silenciado)
    if (!silenciado) unlockChessSounds()
  }

  const mensajeEstado = useCallback(
    (game: Chess, humano: ColorJugador): string => {
      if (game.isCheckmate()) {
        return game.turn() === humano ? t('chess.status.mateLost') : t('chess.status.mateWon')
      }
      if (game.isDraw()) {
        if (game.isStalemate()) return t('chess.status.drawStalemate')
        if (game.isThreefoldRepetition()) return t('chess.status.drawRepetition')
        if (game.isInsufficientMaterial()) return t('chess.status.drawMaterial')
        return t('chess.status.draw')
      }
      if (game.isCheck()) return t('chess.status.check')
      if (game.turn() === humano) {
        return humano === 'w' ? t('chess.status.yourTurnWhite') : t('chess.status.yourTurnBlack')
      }
      return t('chess.status.engineThinking')
    },
    [t],
  )

  const actualizarTablero = useCallback(
    (humano: ColorJugador = colorJugadorRef.current, evaluation?: StockfishEvaluation | null) => {
      const game = gameRef.current
      setFen(game.fen())
      setHistorial(game.history())
      setEstado(mensajeEstado(game, humano))
      if (evaluation !== undefined) {
        setEvaluacion(evaluation)
      }
    },
    [mensajeEstado],
  )

  useEffect(() => {
    setEstado(mensajeEstado(gameRef.current, colorJugadorRef.current))
  }, [mensajeEstado])

  const partidaTerminada = useCallback(() => gameRef.current.isGameOver(), [])

  const analizarPosicion = useCallback(
    async (fen: string) => {
      const engine = engineRef.current
      if (!engine || !motorListo || !mostrarEvaluacionRef.current) return

      const gen = ++searchGenRef.current
      setAnalizando(true)
      try {
        const { evaluation } = await engine.search(fen)
        if (gen !== searchGenRef.current) return
        setEvaluacion(evaluation)
      } catch {
        if (gen === searchGenRef.current) setEvaluacion(null)
      } finally {
        if (gen === searchGenRef.current) setAnalizando(false)
      }
    },
    [motorListo],
  )

  const jugarMotor = useCallback(async () => {
    const engine = engineRef.current
    const game = gameRef.current
    const humano = colorJugadorRef.current
    const motor = colorMotor(humano)

    if (!engine || !motorListo || partidaTerminada() || game.turn() !== motor) return

    const gen = ++searchGenRef.current
    const conEval = mostrarEvaluacionRef.current
    setPensando(true)
    if (conEval) setAnalizando(true)
    try {
      const { bestMove: uci, evaluation } = await engine.search(game.fen())
      if (gen !== searchGenRef.current || !uci || partidaTerminada()) return

      const from = uci.slice(0, 2)
      const to = uci.slice(2, 4)
      const promotion = uci.length > 4 ? uci[4] : undefined
      const move = game.move({ from, to, promotion: promotion ?? 'q' })
      if (move) playChessMoveSound(move, game)
      actualizarTablero(humano, conEval ? evaluation : undefined)
    } catch {
      setErrorMotor(t('chess.moveError'))
    } finally {
      if (gen === searchGenRef.current) {
        setPensando(false)
        if (conEval) setAnalizando(false)
      }
    }
  }, [actualizarTablero, motorListo, partidaTerminada, t])

  const abrirModalPgn = () => {
    if (gameRef.current.history().length === 0) return
    setErrorNombrePgn('')
    setNombreJugadorPgn('')
    setModalPgnAbierto(true)
  }

  const obtenerPgnConNombre = (): string | null => {
    const nombre = nombreJugadorPgn.trim()
    if (!nombre) {
      setErrorNombrePgn(t('chess.pgn.nameRequired'))
      return null
    }

    const pgn = buildPgn(gameRef.current, colorJugadorRef.current, nombre)
    if (!pgn) {
      setErrorNombrePgn(t('chess.pgn.noMoves'))
      return null
    }

    return pgn
  }

  const confirmarDescargaPgn = () => {
    const pgn = obtenerPgnConNombre()
    if (!pgn) return

    downloadPgnFile(pgn, pgnFilename(nombreJugadorPgn.trim()))
    setModalPgnAbierto(false)
  }

  const confirmarIrAAnalisis = () => {
    const pgn = obtenerPgnConNombre()
    if (!pgn) return

    storePgnForAnalysis(pgn)
    setModalPgnAbierto(false)
    navigate(pathFor(locale, 'chessAnalysis'))
  }

  const alternarEvaluacion = () => {
    const visible = !mostrarEvaluacion
    setMostrarEvaluacion(visible)
    mostrarEvaluacionRef.current = visible
    if (!visible) {
      searchGenRef.current += 1
      setAnalizando(false)
      return
    }
    if (motorListo) {
      void analizarPosicion(gameRef.current.fen())
    }
  }

  useEffect(() => {
    const engine = createStockfishEngine()
    engineRef.current = engine
    engine
      .init()
      .then(() => setMotorListo(true))
      .catch(() => setErrorMotor(t('chess.engineError')))

    return () => {
      searchGenRef.current += 1
      engine.quit()
      engine.destroy()
      engineRef.current = null
    }
  }, [t])

  const iniciarPartida = useCallback(
    async (humano: ColorJugador) => {
      unlockChessSounds()
      searchGenRef.current += 1
      colorJugadorRef.current = humano
      setColorJugador(humano)
      gameRef.current = new Chess()
      setEvaluacion(null)
      setHistorial([])
      actualizarTablero(humano, null)
      setErrorMotor(null)

      if (!engineRef.current || !motorListo) return

      try {
        await engineRef.current.newGame()
        if (humano === 'b') {
          await jugarMotor()
        } else {
          void analizarPosicion(gameRef.current.fen())
        }
      } catch {
        setErrorMotor(t('chess.resetError'))
      }
    },
    [actualizarTablero, analizarPosicion, jugarMotor, motorListo, t],
  )

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) => {
    const game = gameRef.current
    const humano = colorJugadorRef.current

    if (!targetSquare || pensando || !motorListo || partidaTerminada() || game.turn() !== humano) {
      return false
    }

    unlockChessSounds()

    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      if (!move) return false
      playChessMoveSound(move, game)
      actualizarTablero(humano)
      if (partidaTerminada()) {
        void analizarPosicion(game.fen())
      } else {
        void jugarMotor()
      }
      return true
    } catch {
      return false
    }
  }

  const humano = colorJugador
  const turnoHumano =
    motorListo && !pensando && !partidaTerminada() && gameRef.current.turn() === humano
  const orientacion = humano === 'w' ? 'white' : 'black'
  const jugadas = historyToMovePairs(historial)
  const evalTexto =
    mostrarEvaluacion && analizando && !evaluacion
      ? t('chess.panel.analyzing')
      : formatEvaluation(evaluacion)

  return (
    <Pagina className='animate-page-in max-w-4xl mx-auto'>
      <p className='text-sm text-base-content/60 mb-2'>
        <LocalizedLink page='home' className='link link-motion link-hover'>
          {t('common.backHome')}
        </LocalizedLink>
      </p>
      <h1 className='text-3xl font-bold mb-2'>{t('chess.title')}</h1>
      <p className='text-base-content/80 mb-4'>{t('chess.intro')}</p>
      <p className='mb-6'>
        <LocalizedLink page='chessAnalysis' className='link link-motion link-hover text-sm'>
          {t('chess.analysisLink')}
        </LocalizedLink>
      </p>

      {errorMotor && <div className='alert alert-error mb-4 text-sm'>{errorMotor}</div>}

      {!motorListo && !errorMotor && (
        <p className='text-base-content/70 mb-4'>{t('chess.loadingEngine')}</p>
      )}

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 items-start justify-center w-full'>
        <div className='w-full max-w-[min(100%,28rem)] mx-auto lg:mx-0 lg:flex-1 aspect-square'>
          <Chessboard
            options={{
              position: fen,
              boardOrientation: orientacion,
              allowDragging: turnoHumano,
              canDragPiece: ({ square }) => {
                if (!turnoHumano || !square) return false
                const piece = gameRef.current.get(square as Square)
                return piece?.color === humano
              },
              onPieceDrop,
              darkSquareStyle: { backgroundColor: '#4a5568' },
              lightSquareStyle: { backgroundColor: '#a0aec0' },
            }}
          />
        </div>

        <aside className='card bg-base-200 shadow-sm w-full lg:w-56 xl:w-64 shrink-0 rounded-2xl'>
          <div className='card-body gap-4 p-4'>
            <section>
              <div className='flex items-center justify-between gap-2'>
                <h2 className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>
                  {t('chess.panel.evaluation')}
                </h2>
                <button
                  type='button'
                  className='btn btn-ghost btn-xs shrink-0'
                  onClick={alternarEvaluacion}
                  aria-expanded={mostrarEvaluacion}
                >
                  {mostrarEvaluacion
                    ? t('chess.panel.hideEvaluation')
                    : t('chess.panel.showEvaluation')}
                </button>
              </div>
              {mostrarEvaluacion && (
                <>
                  <p
                    className='text-2xl font-mono font-semibold mt-1 tabular-nums'
                    aria-live='polite'
                  >
                    {evalTexto}
                  </p>
                  <p className='text-xs text-base-content/60 mt-0.5'>
                    {evaluacion ? t(evalHintKey(evaluacion)) : '\u00a0'}
                  </p>
                </>
              )}
            </section>

            <div className='divider my-0' />

            <section>
              <label className='flex items-center justify-between gap-2 cursor-pointer'>
                <span className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>
                  {t('chess.sounds.label')}
                </span>
                <input
                  type='checkbox'
                  className='toggle toggle-sm toggle-primary'
                  checked={!sonidosSilenciados}
                  onChange={alternarSonidos}
                  aria-label={
                    sonidosSilenciados ? t('chess.sounds.unmute') : t('chess.sounds.mute')
                  }
                />
              </label>
              <p className='text-xs text-base-content/60 mt-1 flex items-center gap-1.5'>
                <FontAwesomeIcon
                  icon={sonidosSilenciados ? faVolumeXmark : faVolumeHigh}
                  className='opacity-70'
                  aria-hidden
                />
                {sonidosSilenciados ? t('chess.sounds.off') : t('chess.sounds.on')}
              </p>
            </section>

            <div className='divider my-0' />

            <section className='min-h-0 flex flex-col'>
              <h2 className='text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2'>
                {t('chess.panel.moveList')}
              </h2>
              {jugadas.length === 0 ? (
                <p className='text-sm text-base-content/60'>{t('chess.panel.noMoves')}</p>
              ) : (
                <ol className='text-sm font-mono space-y-1 max-h-48 lg:max-h-[min(20rem,50vh)] overflow-y-auto pr-1'>
                  {jugadas.map((par) => (
                    <li key={par.number} className='grid grid-cols-[2rem_1fr_1fr] gap-x-1 gap-y-0.5'>
                      <span className='text-base-content/50'>{par.number}.</span>
                      <span>{par.white}</span>
                      <span className='text-base-content/80'>{par.black ?? ''}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </aside>
      </div>

      <p className='mt-4 text-center font-medium min-h-[1.5rem]' aria-live='polite'>
        {estado}
      </p>

      <div className='mt-6 flex flex-col items-center gap-3'>
        <p className='text-sm text-base-content/70'>{t('chess.playAs')}</p>
        <div className='join'>
          <button
            type='button'
            className={`btn join-item btn-motion gap-2 ${humano === 'w' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => void iniciarPartida('w')}
            disabled={!motorListo && !errorMotor}
            aria-pressed={humano === 'w'}
          >
            <FontAwesomeIcon
              icon={faChessKing}
              className={humano === 'w' ? 'text-primary-content' : 'text-base-100 drop-shadow-sm'}
              aria-hidden
            />
            {t('chess.white')}
          </button>
          <button
            type='button'
            className={`btn join-item btn-motion gap-2 ${humano === 'b' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => void iniciarPartida('b')}
            disabled={!motorListo && !errorMotor}
            aria-pressed={humano === 'b'}
          >
            <FontAwesomeIcon
              icon={faChessKing}
              className={humano === 'b' ? 'text-primary-content' : 'text-base-content'}
              aria-hidden
            />
            {t('chess.black')}
          </button>
        </div>
        <div className='flex flex-wrap justify-center gap-2'>
          <button
            type='button'
            className='btn btn-outline btn-sm btn-motion gap-2'
            onClick={abrirModalPgn}
            disabled={historial.length === 0}
          >
            <FontAwesomeIcon icon={faDownload} aria-hidden />
            {t('chess.pgn.download')}
          </button>
          <button
            type='button'
            className='btn btn-primary btn-sm btn-motion gap-2'
            onClick={abrirModalPgn}
            disabled={historial.length === 0}
          >
            <FontAwesomeIcon icon={faChartLine} aria-hidden />
            {t('chess.pgn.analyze')}
          </button>
        </div>
      </div>

      {modalPgnAbierto && (
        <dialog className='modal modal-open' open>
          <div className='modal-box max-w-md'>
            <h3 className='font-bold text-lg'>{t('chess.pgn.title')}</h3>
            <p className='text-base-content/80 text-sm mt-2'>{t('chess.pgn.prompt')}</p>
            <label className='form-control w-full gap-1.5 mt-4'>
              <span className='label-text'>{t('chess.pgn.nameLabel')}</span>
              <input
                type='text'
                className={`input input-bordered input-sm w-full ${errorNombrePgn ? 'input-error' : ''}`}
                value={nombreJugadorPgn}
                onChange={(e) => {
                  setNombreJugadorPgn(e.target.value)
                  setErrorNombrePgn('')
                }}
                placeholder={t('chess.pgn.placeholder')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarDescargaPgn()
                }}
              />
              {errorNombrePgn && (
                <span className='text-error text-xs' role='alert'>
                  {errorNombrePgn}
                </span>
              )}
            </label>
            <div className='modal-action flex-wrap'>
              <button
                type='button'
                className='btn btn-ghost'
                onClick={() => setModalPgnAbierto(false)}
              >
                {t('chess.pgn.cancel')}
              </button>
              <button
                type='button'
                className='btn btn-outline gap-2'
                onClick={confirmarDescargaPgn}
              >
                <FontAwesomeIcon icon={faDownload} aria-hidden />
                {t('chess.pgn.confirm')}
              </button>
              <button type='button' className='btn btn-primary gap-2' onClick={confirmarIrAAnalisis}>
                <FontAwesomeIcon icon={faChartLine} aria-hidden />
                {t('chess.pgn.confirmAnalyze')}
              </button>
            </div>
          </div>
          <form method='dialog' className='modal-backdrop'>
            <button type='button' aria-label={t('chess.pgn.cancel')} onClick={() => setModalPgnAbierto(false)} />
          </form>
        </dialog>
      )}

      <p className='mt-8 text-xs text-base-content/50 text-center'>
        <Trans
          i18nKey='chess.stockfishCredit'
          components={{
            stockfishLink: (
              <a
                href='https://stockfishchess.org/'
                className='link link-hover'
                target='_blank'
                rel='noopener noreferrer'
              />
            ),
          }}
        />
      </p>
    </Pagina>
  )
}

export default Ajedrez
