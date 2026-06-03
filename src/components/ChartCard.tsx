import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  subtitle: string
  children: ReactNode
  className?: string
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <section className={`chart-card ${className}`}>
      <div className="chart-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
