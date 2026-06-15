import { Icon } from './Icon'
import { translateValue } from '../utils/translations'

export type DashboardFilters = {
  category: string
  customer_gender: string
  customer_loyalty_level: string
  dateRange: string
  payment_method: string
  store_location: string
}

export type DashboardFilterOptions = {
  category: string[]
  customer_gender: string[]
  customer_loyalty_level: string[]
  dateRange: string[]
  payment_method: string[]
  store_location: string[]
}

type FilterPanelProps = {
  filters: DashboardFilters
  onApply: () => void
  onChange: (key: keyof DashboardFilters, value: string) => void
  onReset: () => void
  options: DashboardFilterOptions
}

export function FilterPanel({ filters, onApply, onChange, onReset, options }: FilterPanelProps) {
  return (
    <section className="filter-panel" aria-label="Filtros del dashboard">
      <div className="filter-title">
        <Icon name="filter" />
        <div>
          <strong>Filtros</strong>
          <span>Explora los datos conectados</span>
        </div>
      </div>

      <div className="filter-grid">
        <label>
          Fecha
          <select
            value={filters.dateRange}
            onChange={(event) => onChange('dateRange', event.target.value)}
          >
            {options.dateRange.map((option) => (
              <option key={option} value={option}>{translateValue(option)}</option>
            ))}
          </select>
        </label>
        <label>
          Método de pago
          <select
            value={filters.payment_method}
            onChange={(event) => onChange('payment_method', event.target.value)}
          >
            {options.payment_method.map((option) => (
              <option key={option} value={option}>{translateValue(option)}</option>
            ))}
          </select>
        </label>
        <label>
          Género
          <select
            value={filters.customer_gender}
            onChange={(event) => onChange('customer_gender', event.target.value)}
          >
            {options.customer_gender.map((option) => (
              <option key={option} value={option}>{translateValue(option)}</option>
            ))}
          </select>
        </label>
        <label>
          Categoría
          <select
            value={filters.category}
            onChange={(event) => onChange('category', event.target.value)}
          >
            {options.category.map((option) => (
              <option key={option} value={option}>{translateValue(option)}</option>
            ))}
          </select>
        </label>
        <label>
          Lealtad
          <select
            value={filters.customer_loyalty_level}
            onChange={(event) => onChange('customer_loyalty_level', event.target.value)}
          >
            {options.customer_loyalty_level.map((option) => (
              <option key={option} value={option}>{translateValue(option)}</option>
            ))}
          </select>
        </label>
        <label>
          Ciudad
          <select
            value={filters.store_location}
            onChange={(event) => onChange('store_location', event.target.value)}
          >
            {options.store_location.map((option) => (
              <option key={option} value={option}>{translateValue(option)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-actions">
        <button className="action-button" type="button" onClick={onApply}>Aplicar filtros</button>
        <button className="ghost-button" type="button" onClick={onReset}>Limpiar</button>
      </div>
    </section>
  )
}
