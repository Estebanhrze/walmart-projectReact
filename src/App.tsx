import './App.css'
import { BarChart, CustomerSplitChart, DemandChart, DonutChart, ScatterChart, TrendChart } from './components/Charts'
import { ChartCard } from './components/ChartCard'
import { DataTable } from './components/DataTable'
import { DatasetInfo } from './components/DatasetInfo'
import { FilterPanel } from './components/FilterPanel'
import { Header } from './components/Header'
import { Icon } from './components/Icon'
import { KpiCard } from './components/KpiCard'
import { Sidebar } from './components/Sidebar'
import { salesRecords } from './data/mockSales'
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

function App() {
  const totalRevenue = sumRevenue(salesRecords)
  const paymentRevenue = groupRevenueBy(salesRecords, 'payment_method')
  const paymentUsage = groupCountBy(salesRecords, 'payment_method')
  const categoryRevenue = groupRevenueBy(salesRecords, 'category')
  const genderRevenue = groupRevenueBy(salesRecords, 'customer_gender')
  const storeRevenue = groupRevenueBy(salesRecords, 'store_location')
  const demandHealth = getDemandHealth(salesRecords)

  return (
    <div className="app-shell" id="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <section className="active-filter-strip" aria-label="Filtros activos">
          <span>2024</span>
          <span>Todas las ciudades</span>
          <span>Todos los pagos</span>
          <button type="button">Filtros</button>
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
            detail={`${formatNumber(salesRecords.length)} transacciones mock`}
            icon={<Icon name="bar" />}
            label="Ticket promedio"
            tone="green"
            value={formatCurrency(averageTicket(salesRecords))}
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

        <FilterPanel />

        <section className="analytics-grid">
          <ChartCard
            className="wide"
            subtitle="Ingreso mensual simulado para validar el espacio del grafico temporal."
            title="Evolucion de ventas"
          >
            <TrendChart data={getTrendSeries(salesRecords)} />
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
            <ScatterChart data={getScatterSeries(salesRecords)} />
          </ChartCard>

          <ChartCard
            className="wide"
            subtitle="Forecast, demanda real e inventario en la misma lectura operacional."
            title="Inventario vs demanda"
          >
            <DemandChart data={getDemandSeries(salesRecords)} />
          </ChartCard>
        </section>

        <DataTable records={salesRecords} />
        <DatasetInfo />
      </main>
    </div>
  )
}

export default App
