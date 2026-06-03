export function DatasetInfo() {
  return (
    <section className="dataset-info">
      <div>
        <span className="eyebrow">Acerca del dataset</span>
        <h2>Preparado para Walmart.csv</h2>
        <p>
          El diseno usa los campos reales del archivo: pagos, genero, categoria,
          tienda, inventario, demanda proyectada y demanda real. Los ingresos se
          calculan como cantidad vendida por precio unitario.
        </p>
      </div>
      <div className="field-tags" aria-label="Campos principales">
        <span>payment_method</span>
        <span>customer_gender</span>
        <span>category</span>
        <span>store_location</span>
        <span>quantity_sold</span>
        <span>unit_price</span>
        <span>actual_demand</span>
      </div>
    </section>
  )
}
