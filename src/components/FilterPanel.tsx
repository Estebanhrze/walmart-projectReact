import { filterOptions } from '../data/mockSales'
import { Icon } from './Icon'

export function FilterPanel() {
  return (
    <section className="filter-panel" aria-label="Filtros del dashboard">
      <div className="filter-title">
        <Icon name="filter" />
        <div>
          <strong>Filtros</strong>
          <span>Vista visual preparada para datos conectados</span>
        </div>
      </div>

      <div className="filter-grid">
        <label>
          Fecha
          <select defaultValue="2024">
            {filterOptions.dateRange.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Metodo de pago
          <select defaultValue="All">
            {filterOptions.payment_method.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Genero
          <select defaultValue="All">
            {filterOptions.customer_gender.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Categoria
          <select defaultValue="All">
            {filterOptions.category.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Lealtad
          <select defaultValue="All">
            {filterOptions.customer_loyalty_level.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Ciudad
          <select defaultValue="All">
            {filterOptions.store_location.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-actions">
        <button className="action-button" type="button">Aplicar filtros</button>
        <button className="ghost-button" type="button">Limpiar</button>
      </div>
    </section>
  )
}
