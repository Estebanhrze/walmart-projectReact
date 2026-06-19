import type { DemandPoint, ScatterPoint, SeriesPoint } from '../utils/analytics'
import { formatCompactCurrency, formatCurrency, formatNumber } from '../utils/analytics'
import { translateValue } from '../utils/translations'

const maxValue = (series: SeriesPoint[]) => Math.max(...series.map((item) => item.value), 1)

export function TrendChart({ data }: { data: SeriesPoint[] }) {
  const max = maxValue(data)
  const chartMax = max * 1.12
  const width = 760
  const height = 290
  const margin = { top: 36, right: 50, bottom: 44, left: 46 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const baseline = margin.top + plotHeight
  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : margin.left + (index / (data.length - 1)) * plotWidth
    const y = baseline - (item.value / chartMax) * plotHeight
    return { ...item, x, y }
  })
  const path = points.reduce((line, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const previous = points[index - 1]
    const controlX = (previous.x + point.x) / 2

    return `${line} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`
  }, '')
  const area = `${path} L ${points.at(-1)?.x ?? margin.left} ${baseline} L ${points[0]?.x ?? margin.left} ${baseline} Z`

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Línea de tendencia de ventas">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0071ce" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0071ce" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path className="trend-axis" d={`M ${margin.left} ${baseline} H ${width - margin.right}`} />
        <path className="trend-area" d={area} />
        <path className="trend-line" d={path} />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" />
            <text className="trend-value" x={point.x} y={point.y - 12}>
              {formatCompactCurrency(point.value)}
            </text>
            <text className="trend-month" x={point.x} y={height - 11}>{point.label}</text>
          </g>
        ))}
      </svg>
      <div className="chart-caption">
        <strong>{formatCurrency(data.reduce((total, item) => total + item.value, 0))}</strong>
        <span>Ingresos calculados como cantidad vendida por precio unitario</span>
      </div>
    </div>
  )
}

export function BarChart({ data, compact = false }: { data: SeriesPoint[]; compact?: boolean }) {
  const max = maxValue(data)

  return (
    <div className={compact ? 'bar-chart compact' : 'bar-chart'}>
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-label">
            <span>{translateValue(item.label)}</span>
            <strong>{formatCompactCurrency(item.value)}</strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${Math.max((item.value / max) * 100, 7)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({ data }: { data: SeriesPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const segments = data.reduce<Array<SeriesPoint & { dash: string; offset: number }>>(
    (accumulator, item) => {
      const value = total === 0 ? 0 : (item.value / total) * 100
      const previousOffset = accumulator.at(-1)
      const offset = previousOffset ? previousOffset.offset - Number(previousOffset.dash.split(' ')[0]) : 25

      return [...accumulator, { ...item, dash: `${value} ${100 - value}`, offset }]
    },
    [],
  )

  return (
    <div className="donut-wrap">
      <svg className="donut" viewBox="0 0 42 42" role="img" aria-label="Participación de métodos de pago">
        <circle className="donut-base" cx="21" cy="21" r="15.9" />
        {segments.map((item, index) => (
          <circle
            className={`donut-segment segment-${index}`}
            cx="21"
            cy="21"
            key={item.label}
            r="15.9"
            strokeDasharray={item.dash}
            strokeDashoffset={item.offset}
          />
        ))}
        <text className="donut-number" x="21" y="20">{formatNumber(total)}</text>
        <text className="donut-label" x="21" y="25">ventas</text>
      </svg>
      <div className="legend-list">
        {data.map((item, index) => (
          <div className="legend-item" key={item.label}>
            <span className={`legend-dot segment-${index}`} />
            <span>{translateValue(item.label)}</span>
            <strong>{formatNumber(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CustomerSplitChart({ data }: { data: SeriesPoint[] }) {
  const max = maxValue(data)

  return (
    <div className="customer-split">
      {data.map((item, index) => (
        <div className="split-card" key={item.label}>
          <span className={`split-avatar segment-${index}`}>{translateValue(item.label).charAt(0)}</span>
          <div>
            <strong>{translateValue(item.label)}</strong>
            <p>{formatCompactCurrency(item.value)} en ingresos</p>
          </div>
          <div className="mini-meter" aria-hidden="true">
            <span style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ScatterChart({ data }: { data: ScatterPoint[] }) {
  const grouped = Array.from(
    data.reduce<Map<number, number[]>>((map, point) => {
      map.set(point.x, [...(map.get(point.x) ?? []), point.y])
      return map
    }, new Map()),
    ([quantity, values]) => ({
      average: values.reduce((total, value) => total + value, 0) / values.length,
      count: values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      quantity,
    }),
  ).sort((a, b) => a.quantity - b.quantity)
  const width = 480
  const height = 280
  const margin = { top: 24, right: 22, bottom: 48, left: 58 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const baseline = margin.top + plotHeight
  const minX = Math.min(...grouped.map((point) => point.quantity), 0)
  const maxX = Math.max(...grouped.map((point) => point.quantity), 1)
  const maxY = Math.max(...grouped.map((point) => point.max), 1)
  const maxCount = Math.max(...grouped.map((point) => point.count), 1)
  const xScale = (value: number) =>
    margin.left + ((value - minX) / Math.max(maxX - minX, 1)) * plotWidth
  const yScale = (value: number) => baseline - (value / maxY) * plotHeight
  const averageLine = grouped
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.quantity)} ${yScale(point.average)}`)
    .join(' ')
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => maxY * ratio)

  return (
    <div className="scatter-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Relación entre cantidad vendida e ingresos">
        {gridValues.map((value) => {
          const y = yScale(value)

          return (
            <g key={value}>
              <path className="scatter-gridline" d={`M ${margin.left} ${y} H ${width - margin.right}`} />
              <text className="scatter-y-label" x={margin.left - 9} y={y + 4}>
                {formatCompactCurrency(value)}
              </text>
            </g>
          )
        })}
        <path className="axis" d={`M ${margin.left} ${margin.top} V ${baseline} H ${width - margin.right}`} />
        <path className="scatter-average-line" d={averageLine} />
        {grouped.map((point) => {
          const x = xScale(point.quantity)
          const averageY = yScale(point.average)
          const minY = yScale(point.min)
          const maxPointY = yScale(point.max)
          const radius = 5 + (point.count / maxCount) * 7

          return (
            <g key={point.quantity}>
              <path className="scatter-range" d={`M ${x} ${maxPointY} V ${minY}`} />
              <path className="scatter-range-cap" d={`M ${x - 5} ${maxPointY} H ${x + 5} M ${x - 5} ${minY} H ${x + 5}`} />
              <circle className="scatter-average-dot" cx={x} cy={averageY} r={radius} />
              <text className="scatter-count" x={x} y={averageY - radius - 7}>{formatNumber(point.count)}</text>
              <text className="scatter-x-label" x={x} y={baseline + 21}>{point.quantity}</text>
            </g>
          )
        })}
        <text className="axis-title" x={margin.left + plotWidth / 2} y={height - 5}>Cantidad vendida</text>
      </svg>
      <div className="scatter-legend">
        <span><i className="legend-average" /> Promedio de ingresos</span>
        <span><i className="legend-range" /> Rango mínimo-máximo</span>
        <span>El número sobre cada punto indica transacciones</span>
      </div>
    </div>
  )
}

export function DemandChart({ data }: { data: DemandPoint[] }) {
  const max = Math.max(...data.flatMap((item) => [item.forecast, item.actual, item.inventory]), 1)

  return (
    <div className="demand-chart">
      {data.map((item) => (
        <div className="demand-row" key={`${item.label}-${item.actual}`}>
          <span>{item.label}</span>
          <div className="demand-bars">
            <i style={{ width: `${(item.forecast / max) * 100}%` }} />
            <b style={{ width: `${(item.actual / max) * 100}%` }} />
            <em style={{ width: `${(item.inventory / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className="demand-legend">
        <span><i /> Pronóstico</span>
        <span><b /> Actual</span>
        <span><em /> Inventario</span>
      </div>
    </div>
  )
}
