'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { TermPanel } from '@/components/ui/TermPanel'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRelative, formatTokens, humanCron, nextRunCountdown } from '@/lib/formatters'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ── Boot sequence lines ──────────────────────────────────────────────────────
const BOOT_LINES = [
  'OPENCLAW TERMINAL v2026.3.8',
  'Copyright (c) 2026 OpenClaw Systems. All rights reserved.',
  '',
  'Loading kernel modules...',
  '  [OK] memory.ko',
  '  [OK] cron.ko',
  '  [OK] telegram.ko',
  '  [OK] gateway.ko',
  '',
  'Mounting agent workspace... /Users/DavidLiu/.openclaw',
  'Loading identity: Shirmp (claude-haiku-4-5)',
  'Connecting to gateway: ws://127.0.0.1:18789',
  '',
  '>>> SYSTEM READY <<<',
]

function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    const next = () => {
      if (cancelled) return
      if (i >= BOOT_LINES.length) {
        const t = setTimeout(() => { if (!cancelled) { setDone(true); onDone() } }, 400)
        timers.push(t)
        return
      }
      const line = BOOT_LINES[i]
      if (typeof line === 'string') setLines(prev => [...prev, line])
      i++
      const t = setTimeout(next, i === BOOT_LINES.length ? 300 : 60)
      timers.push(t)
    }

    const t0 = setTimeout(next, 100)
    timers.push(t0)
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [onDone])

  return (
    <div style={{ padding: '32px 24px', fontFamily: 'inherit', fontSize: 13 }}>
      {lines.map((line, i) => {
        const safe = typeof line === 'string' ? line : ''
        return (
        <div
          key={i}
          style={{
            color: safe.includes('[OK]') ? 'var(--green)'
                 : safe.includes('>>>') ? 'var(--green)'
                 : safe === '' ? undefined
                 : 'var(--green-mid)',
            fontWeight: safe.includes('>>>') ? 700 : 400,
            textShadow: safe.includes('>>>') || safe.includes('[OK]')
              ? '0 0 6px var(--green)' : undefined,
            lineHeight: '1.6',
          }}
        >
          {safe || '\u00A0'}
        </div>
        )
      })}
      {!done && <div className="cursor" style={{ marginTop: 2, color: 'var(--green)' }}>&nbsp;</div>}
    </div>
  )
}

// ── Log-style line renderer ──────────────────────────────────────────────────
function LogLine({ line }: { line: string }) {
  const isHeader  = line.startsWith('# ')
  const isSection = line.startsWith('### ')
  const isBullet  = line.startsWith('- ') || line.startsWith('* ')

  if (isHeader) return (
    <div className="glow" style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12, marginTop: 4 }}>
      {line}
    </div>
  )
  if (isSection) return (
    <div style={{ color: 'var(--green-mid)', fontWeight: 600, fontSize: 12, marginTop: 6 }}>
      {line}
    </div>
  )
  if (isBullet) return (
    <div style={{ color: 'var(--green-dim)', fontSize: 12, paddingLeft: 12 }}>
      {'>'} {line.slice(2)}
    </div>
  )
  return <div style={{ color: 'var(--green-dim)', fontSize: 12 }}>{line}</div>
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CommandCenter() {
  const [booted, setBooted] = useState(false)

  const { data: tokenData } = useSWR('/api/gateway-token', fetcher)
  const token = tokenData?.token ?? ''
  const { status: wsStatus, messages: wsMessages } = useWebSocket(token ? 'ws://127.0.0.1:18789' : '', token || undefined)

  const { data } = useSWR('/api/status', fetcher, { refreshInterval: 10000, isPaused: () => !booted })
  const { data: cronData } = useSWR('/api/cron',   fetcher, { refreshInterval: 30000, isPaused: () => !booted })
  const { data: costData } = useSWR('/api/costs',  fetcher, { refreshInterval: 60000, isPaused: () => !booted })

  const config       = data?.config as Record<string, unknown> | undefined
  const agentDef     = (config?.agents as Record<string, unknown> | undefined)?.defaults as Record<string, unknown> | undefined
  const channels     = config?.channels as Record<string, { enabled: boolean }> | undefined ?? {}
  const activeChans  = Object.entries(channels).filter(([, v]) => v.enabled).map(([k]) => k)

  const memoryLines   = (data?.memory   as string ?? '').split('\n').filter(Boolean)
  const changelogLines= (data?.changelog as string ?? '').split('\n').filter(Boolean)
  const gatewayLog    = (data?.gatewayLog as string[] ?? []).slice(-15)

  const cronJobs = cronData?.jobs ?? []

  const todayCost = costData?.todayCost ?? 0
  const monthCost = costData?.monthCost ?? 0

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto', gap: 8 }}>

      {/* ── CURRENT ACTIVITY ─ spans 2 cols ── */}
      <TermPanel
        title="CURRENT_ACTIVITY"
        style={{ gridColumn: '1 / 3', minHeight: 220 }}
        titleRight={
          <StatusBadge status={wsStatus === 'connected' ? 'ok' : 'error'} />
        }
      >
        <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
          {memoryLines.length > 0
            ? memoryLines.slice(0, 20).map((l, i) => <LogLine key={i} line={l} />)
            : <div style={{ color: 'var(--green-dim)', fontSize: 12 }}>// no activity logged today</div>
          }
        </div>
        {data?.timestamp && (
          <div style={{ color: 'var(--green-dim)', fontSize: 11, marginTop: 8, borderTop: '1px solid var(--green-dark)', paddingTop: 6 }}>
            POLLED {formatRelative(data.timestamp as number)} &nbsp;·&nbsp; GATEWAY {wsStatus.toUpperCase()}
          </div>
        )}
      </TermPanel>

      {/* ── SYSTEM_HEALTH ── */}
      <TermPanel title="SYSTEM_HEALTH" style={{ gridRow: '1 / 3' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            {[
              { k: 'GATEWAY',    v: <StatusBadge status={wsStatus === 'connected' ? 'ok' : 'error'} label={wsStatus.toUpperCase()} /> },
              { k: 'TELEGRAM',   v: <StatusBadge status={activeChans.includes('telegram') ? 'ok' : 'idle'} label={activeChans.includes('telegram') ? 'ACTIVE' : 'OFF'} /> },
              { k: 'MODEL',      v: <span style={{ color: 'var(--term-cyan, #00FFFF)' }}>{String(agentDef?.model as Record<string,string> | undefined)?.split('/').pop() ?? 'haiku-4-5'}</span> },
              { k: 'CONCURRENCY',v: <span>{(agentDef?.maxConcurrent as number | undefined) ?? 4}</span> },
              { k: 'COST TODAY', v: <span style={{ color: 'var(--green)' }}>${todayCost.toFixed(5)}</span> },
              { k: 'COST MONTH', v: <span style={{ color: 'var(--green)' }}>${monthCost.toFixed(5)}</span> },
            ].map(({ k, v }) => (
              <tr key={k} style={{ borderBottom: '1px solid var(--green-dark)' }}>
                <td style={{ color: 'var(--green-dim)', padding: '4px 12px 4px 0', whiteSpace: 'nowrap' }}>{k}</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CRON quick view */}
        <div style={{ marginTop: 12, color: 'var(--green-dim)', fontSize: 11, marginBottom: 4 }}>CRON_JOBS</div>
        {cronJobs.slice(0, 2).map((job: Record<string, unknown>) => {
          const state = job.state as Record<string, unknown>
          return (
            <div key={job.id as string} style={{ marginBottom: 6, fontSize: 12 }}>
              <div style={{ color: 'var(--green-mid)' }}>{String(job.name).toUpperCase()}</div>
              <div style={{ color: 'var(--green-dim)', display: 'flex', justifyContent: 'space-between' }}>
                <StatusBadge status={String(state.lastRunStatus)} />
                <span>T-<CountdownTimer targetMs={state.nextRunAtMs as number} /></span>
              </div>
            </div>
          )
        })}

        {/* WS event stream */}
        {wsMessages.length > 0 && (
          <>
            <div style={{ marginTop: 12, color: 'var(--green-dim)', fontSize: 11, marginBottom: 4 }}>WS_EVENTS</div>
            <div style={{ maxHeight: 80, overflowY: 'auto' }}>
              {wsMessages.slice(0, 8).map((m, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--green-dim)', fontFamily: 'inherit' }}>
                  {`> ${String(m.type ?? 'event')}`}
                </div>
              ))}
            </div>
          </>
        )}
      </TermPanel>

      {/* ── MEMORY_LOG ── */}
      <TermPanel title="MEMORY_LOG" style={{ gridColumn: '1 / 2' }}>
        <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {memoryLines.slice(0, 20).map((l, i) => <LogLine key={i} line={l} />)}
          {memoryLines.length === 0 && (
            <div style={{ color: 'var(--green-dim)', fontSize: 12 }}>// no memory for today</div>
          )}
        </div>
      </TermPanel>

      {/* ── CHANGELOG ── */}
      <TermPanel title="CHANGELOG" style={{ gridColumn: '2 / 3' }}>
        <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {changelogLines.slice(0, 15).map((l, i) => (
            <div key={i} style={{
              fontSize: 12,
              color: l.startsWith('#') ? 'var(--green-mid)' : 'var(--green-dim)',
              lineHeight: 1.5,
            }}>
              {l}
            </div>
          ))}
          {changelogLines.length === 0 && (
            <div style={{ color: 'var(--green-dim)', fontSize: 12 }}>// no changelog found</div>
          )}
        </div>
      </TermPanel>

      {/* ── GATEWAY_LOG ── spans full width ── */}
      <TermPanel title="GATEWAY_LOG" style={{ gridColumn: '1 / 4' }}>
        <div style={{ maxHeight: 100, overflowY: 'auto' }}>
          {gatewayLog.length > 0
            ? gatewayLog.map((line, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--green-dim)', fontFamily: 'inherit', lineHeight: 1.4 }}>
                  {line}
                </div>
              ))
            : <div style={{ color: 'var(--green-dim)', fontSize: 12 }}>// no gateway log entries</div>
          }
        </div>
      </TermPanel>
    </div>
  )
}
