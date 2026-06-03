import type { ReactNode } from 'react'

type KpiCardProps = {
  label: string
  value: string
  detail: string
  tone?: 'blue' | 'green' | 'yellow' | 'coral'
  icon: ReactNode
}

export function KpiCard({ label, value, detail, tone = 'blue', icon }: KpiCardProps) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  )
}
