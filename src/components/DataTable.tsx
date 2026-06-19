import type { SalesRecord } from '../types/sales'
import { formatCurrency, formatNumber, getRevenue } from '../utils/analytics'
import { translateValue } from '../utils/translations'

export type TableMode = 'filtered' | 'all'

type DataTableProps = {
  filteredCount: number
  mode: TableMode
  onModeChange: (mode: TableMode) => void
  records: SalesRecord[]
  totalCount: number
}

export function DataTable({ filteredCount, mode, onModeChange, records, totalCount }: DataTableProps) {
  return (
    <section className="data-table-card">
      <div className="chart-heading table-heading">
        <div>
          <h2>{mode === 'filtered' ? 'Datos filtrados' : 'Todos los datos'}</h2>
          <p>
            {formatNumber(records.length)} registros visibles de {formatNumber(totalCount)} recibidos desde Firebase.
          </p>
        </div>

        <div className="table-toolbar" aria-label="Modo de visualización de tabla">
          <div className="table-toggle">
            <button
              className={mode === 'filtered' ? 'active' : ''}
              type="button"
              onClick={() => onModeChange('filtered')}
            >
              Filtrados
              <span>{formatNumber(filteredCount)}</span>
            </button>
            <button
              className={mode === 'all' ? 'active' : ''}
              type="button"
              onClick={() => onModeChange('all')}
            >
              Todos
              <span>{formatNumber(totalCount)}</span>
            </button>
          </div>
          <span className="status-pill">Firebase</span>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Transacción</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Ciudad</th>
              <th>Pago</th>
              <th>Ingresos</th>
              <th>Agotamiento</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7}>No hay registros para mostrar en este modo.</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.transaction_id}>
                  <td>#{record.transaction_id}</td>
                  <td>{record.product_name}</td>
                  <td>{translateValue(record.category)}</td>
                  <td>{record.store_location}</td>
                  <td>{translateValue(record.payment_method)}</td>
                  <td>{formatCurrency(getRevenue(record))}</td>
                  <td>
                    <span className={record.stockout_indicator ? 'table-pill alert' : 'table-pill'}>
                      {record.stockout_indicator ? 'Riesgo' : 'Disponible'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
