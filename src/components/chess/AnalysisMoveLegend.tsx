import { useTranslation } from 'react-i18next'
import {
  EVAL_SYMBOL,
  EVAL_SYMBOL_LEGEND,
  MOVE_SYMBOL_LEGEND,
  RESULT_LEGEND,
} from '../../lib/chessAnnotations'
import type { MoveQuality } from '../../lib/chessAnalysis'

const QUALITY_FOR_SYMBOL: Record<string, MoveQuality> = {
  '!!': 'brilliant',
  '!': 'best',
  '!?': 'interesting',
  '?!': 'dubious',
  '?': 'bad',
  '??': 'veryBad',
}

const EVAL_KEYS = {
  [EVAL_SYMBOL.equal]: 'equal',
  [EVAL_SYMBOL.whiteSlight]: 'whiteSlight',
  [EVAL_SYMBOL.blackSlight]: 'blackSlight',
  [EVAL_SYMBOL.whiteDecisive]: 'whiteDecisive',
  [EVAL_SYMBOL.blackDecisive]: 'blackDecisive',
} as const

type Props = {
  gameResult: string
}

const AnalysisMoveLegend = ({ gameResult }: Props) => {
  const { t } = useTranslation()

  return (
    <div className='text-[0.65rem] leading-relaxed text-base-content/60 space-y-2 mb-2 border-b border-base-300 pb-2'>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-semibold uppercase tracking-wide shrink-0'>
          {t('chess.analysis.legend.moves')}:
        </span>
        {MOVE_SYMBOL_LEGEND.map((sym) => {
          const q = QUALITY_FOR_SYMBOL[sym]
          return (
            <span
              key={sym}
              className='font-mono font-bold text-base-content/80'
              title={t(`chess.analysis.quality.${q}`)}
            >
              {sym}
            </span>
          )
        })}
        <span
          className='whitespace-nowrap'
          title={t('chess.analysis.quality.good')}
        >
          <span className='font-mono text-base-content/50'>·</span>
          <span className='font-sans font-normal ms-0.5'>
            ({t('chess.analysis.quality.good')})
          </span>
        </span>
      </div>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-semibold uppercase tracking-wide shrink-0'>
          {t('chess.analysis.legend.eval')}:
        </span>
        {EVAL_SYMBOL_LEGEND.map((sym) => (
          <span
            key={sym}
            className='font-mono font-bold text-base-content/80'
            title={t(`chess.analysis.legend.evalHint.${EVAL_KEYS[sym]}`)}
          >
            {sym}
          </span>
        ))}
      </div>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-semibold uppercase tracking-wide shrink-0'>
          {t('chess.analysis.legend.result')}:
        </span>
        {RESULT_LEGEND.map((res) => (
          <span
            key={res}
            className={`font-mono ${res === gameResult ? 'font-bold text-primary' : ''}`}
            title={t(`chess.analysis.legend.resultHint.${res === '1/2-1/2' ? 'draw' : res === '*' ? 'ongoing' : res === '1-0' ? 'whiteWins' : 'blackWins'}`)}
          >
            {res}
          </span>
        ))}
      </div>
    </div>
  )
}

export default AnalysisMoveLegend
