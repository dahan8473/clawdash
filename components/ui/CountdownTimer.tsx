'use client'
import { useState, useEffect } from 'react'
import { nextRunCountdown } from '@/lib/formatters'

export function CountdownTimer({ targetMs, className }: { targetMs: number; className?: string }) {
  const [display, setDisplay] = useState(nextRunCountdown(targetMs))
  useEffect(() => {
    const id = setInterval(() => setDisplay(nextRunCountdown(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])
  return <span className={className ?? 'font-mono'}>{display}</span>
}
