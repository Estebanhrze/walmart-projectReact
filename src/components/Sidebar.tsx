import { Icon } from './Icon'

export type DashboardView =
  | 'inicio'
  | 'ventas'
  | 'pagos'
  | 'clientes'
  | 'productos'
  | 'sucursales'
  | 'demanda'

const navItems = [
  { id: 'inicio', label: 'Inicio', icon: 'grid' },
  { id: 'ventas', label: 'Ventas generales', icon: 'chart' },
  { id: 'pagos', label: 'Métodos de pago', icon: 'wallet' },
  { id: 'clientes', label: 'Clientes', icon: 'users' },
  { id: 'productos', label: 'Productos', icon: 'box' },
  { id: 'sucursales', label: 'Sucursales', icon: 'shop' },
  { id: 'demanda', label: 'Demanda', icon: 'bar' },
] as const

type SidebarProps = {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand">
        <div className="brand-mark">W</div>
        <div>
          <strong>Walmart</strong>
          <span>Analítica de ventas</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            aria-current={activeView === item.id ? 'page' : undefined}
            className={activeView === item.id ? 'nav-item active' : 'nav-item'}
            key={item.id}
            onClick={() => onViewChange(item.id)}
            type="button"
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
