import { Icon } from './Icon'

export function Header() {
  return (
    <header className="dashboard-header">
      <div className="mobile-bar">
        <button className="icon-button" type="button" aria-label="Abrir menu">
          <Icon name="menu" />
        </button>
        <strong>Walmart Analytics</strong>
        <button className="icon-button" type="button" aria-label="Buscar">
          <Icon name="search" />
        </button>
      </div>

      <div className="header-copy">
        <span className="eyebrow">Dashboard comercial</span>
        <h1>Dashboard de Ventas Walmart</h1>
        <p>
          Analisis visual de ingresos, metodos de pago, clientes, productos,
          ubicaciones y demanda operativa.
        </p>
      </div>

      <div className="header-actions" aria-label="Acciones del dashboard">
        <button className="search-control" type="button">
          <Icon name="search" />
          <span>Buscar producto o ciudad</span>
        </button>
        <button className="icon-button" type="button" aria-label="Actualizar datos">
          <Icon name="refresh" />
        </button>
        <button className="action-button" type="button">
          <Icon name="download" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  )
}
