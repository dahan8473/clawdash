interface StatusBadgeProps {
  status: string
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const isOk  = ['ok', 'delivered', 'connected'].includes(status)
  const isErr = status === 'error'
  const isWarn = ['idle', 'disconnected', 'connecting'].includes(status)
  const text = label ?? status.toUpperCase()

  if (isOk)   return <span className="badge-ok  font-mono text-xs">[OK]</span>
  if (isErr)  return <span className="badge-err glow-red font-mono text-xs">[ERR]</span>
  if (isWarn) return <span className="badge-warn font-mono text-xs">[{text}]</span>
  return <span className="badge-dim font-mono text-xs">[{text}]</span>
}
