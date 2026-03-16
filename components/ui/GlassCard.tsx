'use client'
// Terminal-mode shim — preserves import compatibility
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: string
  noPadding?: boolean
  style?: React.CSSProperties
}

export function GlassCard({ children, className = '', noPadding, style }: GlassCardProps) {
  return (
    <div
      className={`term-panel ${className}`}
      style={{ padding: noPadding ? 0 : '16px', ...style }}
    >
      {children}
    </div>
  )
}
