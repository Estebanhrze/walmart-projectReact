import type { SalesRecord } from '../data/mockSales'

export type SeriesPoint = {
  label: string
  value: number
}

export type ScatterPoint = {
  x: number
  y: number
  label: string
}

export type DemandPoint = {
  label: string
  forecast: number
  actual: number
  inventory: number
}

export const getRevenue = (record: SalesRecord) => record.quantity_sold * record.unit_price

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })

export const getMonthLabel = (dateValue: string) => monthFormatter.format(new Date(dateValue))

export const sumRevenue = (records: SalesRecord[]) =>
  records.reduce((total, record) => total + getRevenue(record), 0)

export const averageTicket = (records: SalesRecord[]) =>
  records.length === 0 ? 0 : sumRevenue(records) / records.length

export const groupRevenueBy = <K extends keyof SalesRecord>(
  records: SalesRecord[],
  key: K,
): SeriesPoint[] => {
  const grouped = records.reduce<Map<string, number>>((map, record) => {
    const label = String(record[key])
    map.set(label, (map.get(label) ?? 0) + getRevenue(record))
    return map
  }, new Map())

  return Array.from(grouped, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value,
  )
}

export const groupCountBy = <K extends keyof SalesRecord>(
  records: SalesRecord[],
  key: K,
): SeriesPoint[] => {
  const grouped = records.reduce<Map<string, number>>((map, record) => {
    const label = String(record[key])
    map.set(label, (map.get(label) ?? 0) + 1)
    return map
  }, new Map())

  return Array.from(grouped, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value,
  )
}

export const getTrendSeries = (records: SalesRecord[]): SeriesPoint[] => {
  const grouped = records.reduce<Map<string, number>>((map, record) => {
    const label = getMonthLabel(record.transaction_date)
    map.set(label, (map.get(label) ?? 0) + getRevenue(record))
    return map
  }, new Map())

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return Array.from(grouped, ([label, value]) => ({ label, value })).sort(
    (a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label),
  )
}

export const getScatterSeries = (records: SalesRecord[]): ScatterPoint[] =>
  records.map((record) => ({
    x: record.quantity_sold,
    y: getRevenue(record),
    label: record.product_name,
  }))

export const getDemandSeries = (records: SalesRecord[]): DemandPoint[] =>
  records.slice(0, 7).map((record) => ({
    label: record.store_location.split(',')[0],
    forecast: record.forecasted_demand,
    actual: record.actual_demand,
    inventory: record.inventory_level,
  }))

export const getDemandHealth = (records: SalesRecord[]) => {
  const actual = records.reduce((total, record) => total + record.actual_demand, 0)
  const forecast = records.reduce((total, record) => total + record.forecasted_demand, 0)
  const stockoutCount = records.filter((record) => record.stockout_indicator).length
  const variance = forecast === 0 ? 0 : ((actual - forecast) / forecast) * 100

  return {
    actual,
    forecast,
    stockoutCount,
    variance,
  }
}

export const getTopLabel = (series: SeriesPoint[]) => series[0]?.label ?? 'N/A'
