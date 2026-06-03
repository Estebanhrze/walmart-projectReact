import { Icon } from './Icon'

const navItems = [
  { label: 'Inicio', icon: 'grid' },
  { label: 'Ventas generales', icon: 'chart' },
  { label: 'Metodos de pago', icon: 'wallet' },
  { label: 'Clientes', icon: 'users' },
  { label: 'Productos', icon: 'box' },
  { label: 'Sucursales', icon: 'shop' },
  { label: 'Demanda', icon: 'bar' },
] as const

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegacion principal">
      <div className="brand">
        <div className="brand-mark">W</div>
        <div>
          <strong>Walmart</strong>
          <span>Sales Analytics</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <a className={index === 0 ? 'nav-item active' : 'nav-item'} href="#dashboard" key={item.label}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-note">
        <span>Estado</span>
        <strong>Mock visual</strong>
        <p>Listo para conectar Firebase o CSV.</p>
      </div>
    </aside>
  )
}
