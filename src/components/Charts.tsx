import type { DemandPoint, ScatterPoint, SeriesPoint } from '../utils/analytics'
import { formatCompactCurrency, formatCurrency, formatNumber } from '../utils/analytics'

const maxValue = (series: SeriesPoint[]) => Math.max(...series.map((item) => item.value), 1)

export function TrendChart({ data }: { data: SeriesPoint[] }) {
  const max = maxValue(data)
  const width = 680
  const height = 240
  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width
    const y = height - (item.value / max) * 180 - 28
    return { ...item, x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${path} L ${points.at(-1)?.x ?? 0} ${height} L ${points[0]?.x ?? 0} ${height} Z`

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Linea de tendencia de ventas">
        <path className="trend-area" d={area} />
        <path className="trend-line" d={path} />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" />
            <text x={point.x} y={height - 5}>{point.label}</text>
          </g>
        ))}
      </svg>
      <div className="chart-caption">
        <strong>{formatCurrency(data.reduce((total, item) => total + item.value, 0))}</strong>
        <span>Ingresos mock calculados como quantity_sold x unit_price</span>
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
            <span>{item.label}</span>
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
      <svg className="donut" viewBox="0 0 42 42" role="img" aria-label="Participacion de metodos de pago">
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
            <span>{item.label}</span>
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
          <span className={`split-avatar segment-${index}`}>{item.label.charAt(0)}</span>
          <div>
            <strong>{item.label}</strong>
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
  const maxX = Math.max(...data.map((point) => point.x), 1)
  const maxY = Math.max(...data.map((point) => point.y), 1)

  return (
    <div className="scatter-chart">
      <svg viewBox="0 0 420 260" role="img" aria-label="Relacion entre cantidad vendida e ingresos">
        <path className="axis" d="M42 18v198h336" />
        <text className="axis-label" x="42" y="242">Cantidad</text>
        <text className="axis-label" x="275" y="242">Revenue</text>
        {data.map((point) => {
          const x = 42 + (point.x / maxX) * 320
          const y = 216 - (point.y / maxY) * 180
          return (
            <g key={`${point.label}-${point.x}`}>
              <circle cx={x} cy={y} r="7" />
              <text x={x + 9} y={y + 4}>{point.label}</text>
            </g>
          )
        })}
      </svg>
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
        <span><i /> Forecast</span>
        <span><b /> Actual</span>
        <span><em /> Inventario</span>
      </div>
    </div>
  )
}
