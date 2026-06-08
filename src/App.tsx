import { useMemo, useState } from 'react'
import './App.css'
import { BarChart, CustomerSplitChart, DemandChart, DonutChart, ScatterChart, TrendChart } from './components/Charts'
import { ChartCard } from './components/ChartCard'
import { DataTable } from './components/DataTable'
import { FilterPanel, type DashboardFilterOptions, type DashboardFilters } from './components/FilterPanel'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { KpiCard } from './components/KpiCard'
import { Sidebar } from './components/Sidebar'
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

const defaultFilters: DashboardFilters = {
  category: 'All',
  customer_gender: 'All',
  customer_loyalty_level: 'All',
  dateRange: '2024',
  payment_method: 'All',
  store_location: 'All',
}

const getUniqueOptions = <K extends keyof SalesRecord>(records: SalesRecord[], key: K) => [
  'All',
  ...Array.from(new Set(records.map((record) => String(record[key])).filter(Boolean))).sort(),
]

const getQuarter = (dateValue: string) => {
  const month = new Date(dateValue).getMonth()

  if (!Number.isFinite(month)) {
    return ''
  }

  if (month >= 0 && month <= 2) {
    return 'Q1 2024'
  }

  if (month >= 3 && month <= 5) {
    return 'Q2 2024'
  }

  if (month >= 6 && month <= 8) {
    return 'Q3 2024'
  }

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
    filters.dateRange,
    filters.store_location === 'All' ? 'Todas las ciudades' : filters.store_location,
    filters.payment_method === 'All' ? 'Todos los pagos' : filters.payment_method,
    filters.category === 'All' ? 'Todas las categorias' : filters.category,
  ].filter(Boolean)

function App() {
  const { error, isLoading, records: salesRecords, status } = useSalesRecords()
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(defaultFilters)
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

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setDraftFilters((currentFilters) => ({ ...currentFilters, [key]: value }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters)
  }

  const handleResetFilters = () => {
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  return (
    <div className="app-shell" id="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <section className="active-filter-strip" aria-label="Filtros activos">
          {activeFilterLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
          <button type="button">{formatNumber(filteredRecords.length)} resultados</button>
        </section>

        <section className="kpi-grid" aria-label="Indicadores principales">
          <KpiCard
            detail="quantity_sold x unit_price"
            icon={<Icon name="chart" />}
            label="Ventas totales"
            tone="blue"
            value={formatCurrency(totalRevenue)}
          />
          <KpiCard
            detail={`${formatNumber(filteredRecords.length)} de ${formatNumber(salesRecords.length)} transacciones`}
            icon={<Icon name="bar" />}
            label="Ticket promedio"
            tone="green"
            value={formatCurrency(averageTicket(filteredRecords))}
          />
          <KpiCard
            detail="Mayor frecuencia de uso"
            icon={<Icon name="wallet" />}
            label="Pago principal"
            tone="yellow"
            value={getTopLabel(paymentUsage)}
          />
          <KpiCard
            detail={formatCompactCurrency(categoryRevenue[0]?.value ?? 0)}
            icon={<Icon name="box" />}
            label="Categoria top"
            tone="blue"
            value={getTopLabel(categoryRevenue)}
          />
          <KpiCard
            detail={formatCompactCurrency(storeRevenue[0]?.value ?? 0)}
            icon={<Icon name="shop" />}
            label="Sucursal lider"
            tone="green"
            value={getTopLabel(storeRevenue)}
          />
          <KpiCard
            detail={`${demandHealth.stockoutCount} alertas de stockout`}
            icon={<Icon name="filter" />}
            label="Demanda"
            tone="coral"
            value={`${demandHealth.variance > 0 ? '+' : ''}${demandHealth.variance.toFixed(1)}%`}
          />
        </section>

        <section
          className={error ? 'dashboard-status error' : 'dashboard-status'}
          aria-live="polite"
        >
          <strong>{isLoading ? 'Cargando datos desde Firebase...' : status}</strong>
          <span>
            {error ??
              (hasSourceRecords
                ? `${formatNumber(salesRecords.length)} registros cargados; ${formatNumber(filteredRecords.length)} visibles con filtros.`
                : 'La coleccion sales_transactions no tiene documentos para visualizar.')}
          </span>
        </section>

        <FilterPanel
          filters={draftFilters}
          onApply={handleApplyFilters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          options={filterOptions}
        />

        {hasFilteredRecords ? (
          <section className="analytics-grid">
          <ChartCard
            className="wide"
            subtitle="Ingreso mensual calculado desde documentos de Firestore."
            title="Evolucion de ventas"
          >
            <TrendChart data={getTrendSeries(filteredRecords)} />
          </ChartCard>

          <ChartCard
            subtitle="Compara cuanto revenue genera cada forma de pago."
            title="Ventas por metodo de pago"
          >
            <BarChart data={paymentRevenue} />
          </ChartCard>

          <ChartCard
            subtitle="Frecuencia de uso de efectivo, tarjeta y billetera digital."
            title="Metodo de pago mas usado"
          >
            <DonutChart data={paymentUsage} />
          </ChartCard>

          <ChartCard
            subtitle="Ranking horizontal de lineas de producto."
            title="Ventas por categoria"
          >
            <BarChart compact data={categoryRevenue.slice(0, 6)} />
          </ChartCard>

          <ChartCard
            subtitle="Lectura preparada para comparar grupos de clientes."
            title="Customer & Demand"
          >
            <CustomerSplitChart data={genderRevenue} />
          </ChartCard>

          <ChartCard
            subtitle="Rendimiento por ciudad o sucursal."
            title="Ventas por ubicacion"
          >
            <BarChart compact data={storeRevenue.slice(0, 6)} />
          </ChartCard>

          <ChartCard
            subtitle="Relacion entre unidades compradas e ingreso generado."
            title="Cantidad vs revenue"
          >
            <ScatterChart data={getScatterSeries(filteredRecords)} />
          </ChartCard>

          <ChartCard
            className="wide"
            subtitle="Forecast, demanda real e inventario en la misma lectura operacional."
            title="Inventario vs demanda"
          >
            <DemandChart data={getDemandSeries(filteredRecords)} />
          </ChartCard>
          </section>
        ) : (
          <section className="empty-state">
            <Icon name="chart" />
            <h2>No hay datos para graficar</h2>
            <p>
              {hasSourceRecords
                ? 'Cambia o limpia los filtros para volver a mostrar registros.'
                : 'Configura Firebase y carga datos para alimentar el dashboard.'}
            </p>
          </section>
        )}

        <DataTable records={filteredRecords} />
      </main>
    </div>
  )
}

export default App
