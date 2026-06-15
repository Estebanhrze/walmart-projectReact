import type { SalesRecord } from '../types/sales'
import { formatCurrency, getRevenue } from '../utils/analytics'
import { translateValue } from '../utils/translations'

type DataTableProps = {
  records: SalesRecord[]
}

export function DataTable({ records }: DataTableProps) {
  return (
    <section className="data-table-card">
      <div className="chart-heading">
        <div>
          <h2>Datos filtrados</h2>
          <p>Vista previa de los registros recibidos desde Firebase.</p>
        </div>
        <span className="status-pill">Firebase</span>
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
            {records.slice(0, 7).map((record) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
