import { useMemo, useState } from 'react'
import './App.css'
import { BarChart, CustomerSplitChart, DemandChart, DonutChart, ScatterChart, TrendChart } from './components/Charts'
import { ChartCard } from './components/ChartCard'
import { DataTable, type TableMode } from './components/DataTable'
import { FilterPanel, type DashboardFilterOptions, type DashboardFilters } from './components/FilterPanel'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { KpiCard } from './components/KpiCard'
import { Sidebar, type DashboardView } from './components/Sidebar'
import { useSalesRecords } from './hooks/useSalesRecords'
import type { SalesRecord } from './types/sales'
import {
  averageTicket,
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  getDemandHealth,
  getDemandSeries,
  getScatterSeries,
  getTopLabel,
  getTrendSeries,
  groupCountBy,
  groupRevenueBy,
  sumRevenue,
} from './utils/analytics'
import { translateValue } from './utils/translations'

const defaultFilters: DashboardFilters = {
  category: 'All',
  customer_gender: 'All',
  customer_loyalty_level: 'All',
  dateRange: '2024',
  payment_method: 'All',
  store_location: 'All',
}

const viewTitle: Record<DashboardView, string> = {
  clientes: 'Clientes',
  demanda: 'Demanda',
  inicio: 'Resumen general',
  pagos: 'Métodos de pago',
  productos: 'Productos',
  sucursales: 'Sucursales',
  ventas: 'Ventas generales',
}

const getUniqueOptions = <K extends keyof SalesRecord>(records: SalesRecord[], key: K) => [
  'All',
  ...Array.from(new Set(records.map((record) => String(record[key])).filter(Boolean))).sort(),
]

const getQuarter = (dateValue: string) => {
  const month = new Date(dateValue).getMonth()

  if (!Number.isFinite(month)) return ''
  if (month <= 2) return 'Q1 2024'
  if (month <= 5) return 'Q2 2024'
  if (month <= 8) return 'Q3 2024'
  return 'Q4 2024'
}

const matchesFilter = (value: string, filterValue: string) => filterValue === 'All' || value === filterValue

const applyDashboardFilters = (records: SalesRecord[], filters: DashboardFilters) =>
  records.filter((record) => {
    const transactionYear = String(new Date(record.transaction_date).getFullYear())
    const matchesDate =
      filters.dateRange === 'All' ||
      filters.dateRange === transactionYear ||
      filters.dateRange === getQuarter(record.transaction_date)

    return (
      matchesDate &&
      matchesFilter(record.payment_method, filters.payment_method) &&
      matchesFilter(record.customer_gender, filters.customer_gender) &&
      matchesFilter(record.category, filters.category) &&
      matchesFilter(record.customer_loyalty_level, filters.customer_loyalty_level) &&
      matchesFilter(record.store_location, filters.store_location)
    )
  })

const getActiveFilterLabels = (filters: DashboardFilters) =>
  [
    translateValue(filters.dateRange),
    filters.store_location === 'All' ? 'Todas las ciudades' : filters.store_location,
    filters.payment_method === 'All' ? 'Todos los pagos' : translateValue(filters.payment_method),
    filters.category === 'All' ? 'Todas las categorías' : translateValue(filters.category),
  ].filter(Boolean)

function App() {
  const { error, isLoading, records: salesRecords, status } = useSalesRecords()
  const [activeView, setActiveView] = useState<DashboardView>('inicio')
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(defaultFilters)
  const [tableMode, setTableMode] = useState<TableMode>('filtered')
  const filteredRecords = useMemo(
    () => applyDashboardFilters(salesRecords, appliedFilters),
    [appliedFilters, salesRecords],
  )
  const hasSourceRecords = salesRecords.length > 0
  const hasFilteredRecords = filteredRecords.length > 0
  const filterOptions = useMemo<DashboardFilterOptions>(
    () => ({
      category: getUniqueOptions(salesRecords, 'category'),
      customer_gender: getUniqueOptions(salesRecords, 'customer_gender'),
      customer_loyalty_level: getUniqueOptions(salesRecords, 'customer_loyalty_level'),
      dateRange: ['All', '2024', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
      payment_method: getUniqueOptions(salesRecords, 'payment_method'),
      store_location: getUniqueOptions(salesRecords, 'store_location'),
    }),
    [salesRecords],
  )
  const activeFilterLabels = getActiveFilterLabels(appliedFilters)
  const totalRevenue = sumRevenue(filteredRecords)
  const paymentRevenue = groupRevenueBy(filteredRecords, 'payment_method')
  const paymentUsage = groupCountBy(filteredRecords, 'payment_method')
  const categoryRevenue = groupRevenueBy(filteredRecords, 'category')
  const genderRevenue = groupRevenueBy(filteredRecords, 'customer_gender')
  const storeRevenue = groupRevenueBy(filteredRecords, 'store_location')
  const demandHealth = getDemandHealth(filteredRecords)
  const isVisible = (...views: DashboardView[]) => activeView === 'inicio' || views.includes(activeView)
  const tableRecords = tableMode === 'all' ? salesRecords : filteredRecords

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setDraftFilters((currentFilters) => ({ ...currentFilters, [key]: value }))
  }

  const handleResetFilters = () => {
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view)
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  return (
    <div className="app-shell" id="dashboard">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <main className="dashboard-main">
        <Header />

        <div
          aria-label={error ? 'Error de conexión' : isLoading ? 'Conectando a Firebase' : 'Conectado a Firebase'}
          className={error ? 'connection-chip error' : isLoading ? 'connection-chip loading' : 'connection-chip'}
          role="status"
          title={
            error ??
            (hasSourceRecords
              ? `${formatNumber(salesRecords.length)} registros cargados; ${formatNumber(filteredRecords.length)} visibles con filtros.`
              : status)
          }
        >
          <span />
        </div>

        <section className="active-filter-strip" aria-label="Filtros activos">
          {activeFilterLabels.map((label) => <span key={label}>{label}</span>)}
          <button type="button">{formatNumber(filteredRecords.length)} resultados</button>
        </section>

        <section className="kpi-grid" aria-label={`Indicadores de ${viewTitle[activeView]}`}>
          {isVisible('ventas') && (
            <KpiCard
              icon={<Icon name="chart" />}
              label="Ventas totales"
              tone="blue"
              value={formatCurrency(totalRevenue)}
            />
          )}
          {isVisible('ventas', 'clientes') && (
            <KpiCard
              detail={`${formatNumber(filteredRecords.length)} de ${formatNumber(salesRecords.length)} transacciones`}
              icon={<Icon name="bar" />}
              label="Ticket promedio"
              tone="green"
              value={formatCurrency(averageTicket(filteredRecords))}
            />
          )}
          {isVisible('pagos') && (
            <KpiCard
              detail="Mayor frecuencia de uso"
              icon={<Icon name="wallet" />}
              label="Pago principal"
              tone="yellow"
              value={translateValue(getTopLabel(paymentUsage))}
            />
          )}
          {isVisible('productos') && (
            <KpiCard
              detail={formatCompactCurrency(categoryRevenue[0]?.value ?? 0)}
              icon={<Icon name="box" />}
              label="Categoría líder"
              tone="blue"
              value={translateValue(getTopLabel(categoryRevenue))}
            />
          )}
          {isVisible('sucursales') && (
            <KpiCard
              detail={formatCompactCurrency(storeRevenue[0]?.value ?? 0)}
              icon={<Icon name="shop" />}
              label="Sucursal líder"
              tone="green"
              value={getTopLabel(storeRevenue)}
            />
          )}
          {isVisible('demanda', 'sucursales') && (
            <KpiCard
              detail={`${demandHealth.stockoutCount} alertas de agotamiento`}
              icon={<Icon name="filter" />}
              label="Demanda"
              tone="coral"
              value={`${demandHealth.variance > 0 ? '+' : ''}${demandHealth.variance.toFixed(1)}%`}
            />
          )}
        </section>


        <FilterPanel
          filters={draftFilters}
          onApply={() => setAppliedFilters(draftFilters)}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          options={filterOptions}
        />

        {hasFilteredRecords ? (
          <section className={activeView === 'inicio' ? 'analytics-grid' : 'analytics-grid focused'}>
            {isVisible('ventas') && (
              <ChartCard className="wide" subtitle="Ingreso mensual" title="Evolución de ventas">
                <TrendChart data={getTrendSeries(filteredRecords)} />
              </ChartCard>
            )}

            {isVisible('pagos') && (
              <>
                <ChartCard subtitle="" title="Ventas por método de pago">
                  <BarChart data={paymentRevenue} />
                </ChartCard>
                <ChartCard subtitle="" title="Método de pago más usado">
                  <DonutChart data={paymentUsage} />
                </ChartCard>
              </>
            )}

            {isVisible('productos') && (
              <ChartCard subtitle="" title="Ventas por categoría">
                <BarChart compact data={categoryRevenue.slice(0, 6)} />
              </ChartCard>
            )}

            {isVisible('clientes') && (
              <ChartCard subtitle="" title="Ingresos por género">
                <CustomerSplitChart data={genderRevenue} />
              </ChartCard>
            )}

            {isVisible('sucursales') && (
              <ChartCard subtitle="" title="Ventas por ubicación">
                <BarChart compact data={storeRevenue.slice(0, 6)} />
              </ChartCard>
            )}

            {isVisible('ventas', 'clientes') && (
              <ChartCard subtitle="" title="Cantidad vs ingresos">
                <ScatterChart data={getScatterSeries(filteredRecords)} />
              </ChartCard>
            )}

            {isVisible('demanda', 'sucursales') && (
              <ChartCard className={activeView === 'inicio' ? 'wide' : ''} subtitle="" title="Inventario vs demanda">
                <DemandChart data={getDemandSeries(filteredRecords)} />
              </ChartCard>
            )}
          </section>
        ) : (
          <section className="empty-state">
            <Icon name="chart" />
            <h2>No hay datos para graficar</h2>
            <p>
              {hasSourceRecords
                ? 'Cambia o limpia los filtros para volver a mostrar registros.'
                : 'Configura Firebase y carga datos para alimentar el panel.'}
            </p>
          </section>
        )}

        <DataTable
          filteredCount={filteredRecords.length}
          mode={tableMode}
          onModeChange={setTableMode}
          records={tableRecords}
          totalCount={salesRecords.length}
        />
      </main>
    </div>
  )
}

export default App
