import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import type { GameAnalysis } from '../../lib/chessAnalysis'
import {
  buildEvalSeries,
  buildMoveQualitySeries,
  type EvalPoint,
  type MoveQualityPoint,
} from '../../lib/chessAnalysisCharts'

type Props = {
  analysis: GameAnalysis
}

const CHART = {
  bg: '#fafafa',
  axis: '#171717',
  axisMuted: '#525252',
  grid: '#d4d4d4',
  whiteLine: '#0a0a0a',
  blackLine: '#737373',
  evalStroke: '#171717',
  evalFill: '#171717',
  refLine: '#a3a3a3',
} as const

const axisTick = { fontSize: 11, fill: CHART.axis }
const axisLabel = { fontSize: 11, fill: CHART.axisMuted }

const AnalysisCharts = ({ analysis }: Props) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'moves' | 'eval'>('moves')

  const qualityData = buildMoveQualitySeries(analysis)
  const evalData = buildEvalSeries(analysis)

  const qualityTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null
    const point = payload[0].payload as MoveQualityPoint
    return (
      <div className='rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 shadow-lg'>
        <p className='font-semibold mb-1'>
          {t('chess.analysis.chartMoveNumber', { n: point.moveNumber })}
        </p>
        {point.whiteSan && point.whiteQuality && (
          <p>
            {t('chess.panel.white')}: {point.whiteSan} (
            {t(`chess.analysis.quality.${point.whiteQuality}`)})
          </p>
        )}
        {point.blackSan && point.blackQuality && (
          <p>
            {t('chess.panel.black')}: {point.blackSan} (
            {t(`chess.analysis.quality.${point.blackQuality}`)})
          </p>
        )}
      </div>
    )
  }

  const evalTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null
    const { ply, evalCp } = payload[0].payload as EvalPoint
    const sign = evalCp > 0 ? '+' : ''
    return (
      <div className='rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 shadow-lg'>
        <p className='font-semibold'>{t('chess.analysis.chartPly', { ply })}</p>
        <p>
          {t('chess.analysis.chartEval')}: {sign}
          {(evalCp / 100).toFixed(2)}
        </p>
      </div>
    )
  }

  const tabClass = (active: boolean) =>
    [
      'flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200',
      active
        ? 'bg-neutral-900 text-white shadow-md ring-1 ring-neutral-700'
        : 'text-base-content/75 hover:bg-base-300/80 hover:text-base-content',
    ].join(' ')

  return (
    <div className='w-full max-w-[min(100%,28rem)] mx-auto'>
      <div
        role='tablist'
        aria-label={`${t('chess.analysis.chartTabMoves')} / ${t('chess.analysis.chartTabEval')}`}
        className='flex gap-1 p-1.5 mb-3 rounded-xl border border-base-300 bg-base-200/90 shadow-sm'
      >
        <button
          type='button'
          role='tab'
          className={tabClass(tab === 'moves')}
          aria-selected={tab === 'moves'}
          onClick={() => setTab('moves')}
        >
          {t('chess.analysis.chartTabMoves')}
        </button>
        <button
          type='button'
          role='tab'
          className={tabClass(tab === 'eval')}
          aria-selected={tab === 'eval'}
          onClick={() => setTab('eval')}
        >
          {t('chess.analysis.chartTabEval')}
        </button>
      </div>

      <div
        className='rounded-xl border border-neutral-300 bg-neutral-50 p-3 shadow-md'
        style={{ backgroundColor: CHART.bg }}
      >
        <div className='h-56 w-full'>
          {tab === 'moves' ? (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={qualityData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray='3 3' />
                <XAxis
                  dataKey='moveNumber'
                  tick={axisTick}
                  stroke={CHART.axis}
                  label={{
                    value: t('chess.analysis.chartAxisMove'),
                    position: 'insideBottom',
                    offset: -2,
                    ...axisLabel,
                  }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={axisTick}
                  stroke={CHART.axis}
                  tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                  label={{
                    value: t('chess.analysis.chartAxisQuality'),
                    angle: -90,
                    position: 'insideLeft',
                    ...axisLabel,
                  }}
                />
                <Tooltip content={qualityTooltip} />
                <Legend wrapperStyle={{ color: CHART.axis, fontSize: 12 }} />
                <Line
                  type='monotone'
                  dataKey='white'
                  name={t('chess.panel.white')}
                  stroke={CHART.whiteLine}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART.whiteLine, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART.whiteLine }}
                  connectNulls={false}
                />
                <Line
                  type='monotone'
                  dataKey='black'
                  name={t('chess.panel.black')}
                  stroke={CHART.blackLine}
                  strokeWidth={2.5}
                  strokeDasharray='6 4'
                  dot={{ r: 3, fill: CHART.blackLine, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART.blackLine }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={evalData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id='evalFillDark' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={CHART.evalFill} stopOpacity={0.35} />
                    <stop offset='95%' stopColor={CHART.evalFill} stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.grid} strokeDasharray='3 3' />
                <XAxis
                  dataKey='ply'
                  tick={axisTick}
                  stroke={CHART.axis}
                  label={{
                    value: t('chess.analysis.chartAxisPly'),
                    position: 'insideBottom',
                    offset: -2,
                    ...axisLabel,
                  }}
                />
                <YAxis
                  tick={axisTick}
                  stroke={CHART.axis}
                  tickFormatter={(v) => `${Number(v) > 0 ? '+' : ''}${(Number(v) / 100).toFixed(1)}`}
                  label={{
                    value: t('chess.analysis.chartAxisEval'),
                    angle: -90,
                    position: 'insideLeft',
                    ...axisLabel,
                  }}
                />
                <ReferenceLine y={0} stroke={CHART.refLine} strokeDasharray='4 4' />
                <Tooltip content={evalTooltip} />
                <Area
                  type='monotone'
                  dataKey='evalCp'
                  name={t('chess.analysis.chartEval')}
                  stroke={CHART.evalStroke}
                  fill='url(#evalFillDark)'
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalysisCharts
