'use client'
import { ReactNode } from 'react'

interface TermPanelProps {
  title: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  titleRight?: ReactNode
}

export function TermPanel({ title, children, className = '', style, titleRight }: TermPanelProps) {
  return (
    <div
      className={`term-panel ${className}`}
      style={{ padding: '20px 16px 14px', ...style }}
    >
      <div className="term-panel-title flex items-center gap-2">
        <span style={{ color: 'var(--green-dim)' }}>┤</span>
        <span className="glow" style={{ letterSpacing: '0.1em' }}>{title}</span>
        <span style={{ color: 'var(--green-dim)' }}>├</span>
        {titleRight && <span className="ml-2">{titleRight}</span>}
      </div>
      {children}
    </div>
  )
}
