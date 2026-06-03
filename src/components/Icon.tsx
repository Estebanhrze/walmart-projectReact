type IconName =
  | 'bar'
  | 'box'
  | 'chart'
  | 'chevron'
  | 'download'
  | 'filter'
  | 'grid'
  | 'menu'
  | 'refresh'
  | 'search'
  | 'shop'
  | 'users'
  | 'wallet'

type IconProps = {
  name: IconName
}

export function Icon({ name }: IconProps) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === 'menu' && (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
      {name === 'search' && (
        <path d="m20 20-4.2-4.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
      )}
      {name === 'refresh' && (
        <path d="M20 6v5h-5M4 18v-5h5M18.2 9A7 7 0 0 0 6.6 6.6L4 9m16 6-2.6 2.4A7 7 0 0 1 5.8 15" />
      )}
      {name === 'download' && (
        <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" />
      )}
      {name === 'filter' && (
        <path d="M4 6h16M7 12h10M10 18h4" />
      )}
      {name === 'chart' && (
        <path d="M5 19V5m0 14h14M8 15l3-4 3 2 4-6" />
      )}
      {name === 'wallet' && (
        <path d="M4 7h15v12H4a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h13M16 13h3" />
      )}
      {name === 'users' && (
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5M3 19a6 6 0 0 1 12 0m3 0a5 5 0 0 0-4-4.8" />
      )}
      {name === 'box' && (
        <path d="m12 3 8 4-8 4-8-4 8-4Zm-8 4v10l8 4 8-4V7M12 11v10" />
      )}
      {name === 'shop' && (
        <path d="M5 10v10h14V10M4 10l2-6h12l2 6M9 20v-6h6v6" />
      )}
      {name === 'grid' && (
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
      )}
      {name === 'bar' && (
        <path d="M5 20V9m7 11V4m7 16v-7" />
      )}
      {name === 'chevron' && (
        <path d="m9 6 6 6-6 6" />
      )}
    </svg>
  )
}
