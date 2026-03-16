// Token cost per million tokens (approximate Claude pricing)
const COSTS: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5': { input: 0.80, output: 4.00 },
  'claude-haiku': { input: 0.80, output: 4.00 },
  'claude-sonnet': { input: 3.00, output: 15.00 },
  'claude-opus': { input: 15.00, output: 75.00 },
}

export function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const key = Object.keys(COSTS).find(k => model.toLowerCase().includes(k.split('-').slice(-2).join('-')))
  const rates = key ? COSTS[key] : COSTS['claude-haiku-4-5']
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return `$${(usd * 1000).toFixed(3)}m`
  return `$${usd.toFixed(4)}`
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function formatRelative(tsMs: number): string {
  const diff = Date.now() - tsMs
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export function humanCron(expr: string, tz: string): string {
  const parts = expr.split(' ')
  if (parts.length !== 5) return expr
  const [min, hour] = parts
  const tzShort = tz.includes('Vancouver') || tz.includes('Los_Angeles') ? 'PT' :
                  tz.includes('New_York') || tz.includes('Toronto') ? 'ET' : tz
  try {
    const h = parseInt(hour), m = parseInt(min)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `Daily at ${h12}:${String(m).padStart(2,'0')} ${ampm} ${tzShort}`
  } catch { return expr }
}

export function nextRunCountdown(nextRunAtMs: number): string {
  const diff = nextRunAtMs - Date.now()
  if (diff <= 0) return 'running now'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
