import type { SalesRecord } from '../types/sales'
import { formatCurrency, getRevenue } from '../utils/analytics'

type DataTableProps = {
  records: SalesRecord[]
}

export function DataTable({ records }: DataTableProps) {
  return (
    <section className="data-table-card">
      <div className="chart-heading">
        <div>
          <h2>Datos filtrados</h2>
          <p>Vista previa de registros con columnas del CSV real.</p>
        </div>
        <span className="status-pill">Mock</span>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Transaccion</th>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Ciudad</th>
              <th>Pago</th>
              <th>Revenue</th>
              <th>Stockout</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 7).map((record) => (
              <tr key={record.transaction_id}>
                <td>#{record.transaction_id}</td>
                <td>{record.product_name}</td>
                <td>{record.category}</td>
                <td>{record.store_location}</td>
                <td>{record.payment_method}</td>
                <td>{formatCurrency(getRevenue(record))}</td>
                <td>
                  <span className={record.stockout_indicator ? 'table-pill alert' : 'table-pill'}>
                    {record.stockout_indicator ? 'Riesgo' : 'Ok'}
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
