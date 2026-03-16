'use client'
import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function LiveClock() {
  const [ts, setTs] = useState('')
  useEffect(() => {
    const update = () => setTs(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono" style={{ color: 'var(--green-dim)' }}>{ts}</span>
}

function HeartbeatTimer() {
  const [display, setDisplay] = useState('')
  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const rem = (30 * 60 * 1000) - (now % (30 * 60 * 1000))
      const m = Math.floor(rem / 60000)
      const s = Math.floor((rem % 60000) / 1000)
      setDisplay(`${m}m${String(s).padStart(2, '0')}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ color: 'var(--term-amber, #FFAA00)' }}>{display}</span>
}

export function TopBar() {
  const { data: tokenData } = useSWR('/api/gateway-token', fetcher)
  const token = tokenData?.token ?? ''
  // Don't connect until we have the token — avoids a failed attempt before token loads
  const { status: wsStatus } = useWebSocket(
    token ? 'ws://127.0.0.1:18789' : '',
    token || undefined
  )

  const wsColor = wsStatus === 'connected'   ? 'var(--green)'
                : wsStatus === 'connecting'  ? 'var(--term-amber, #FFAA00)'
                : wsStatus === 'disconnected' && !token ? 'var(--green-dim)'
                : 'var(--term-red, #FF3333)'
  const wsLabel = wsStatus === 'connected'   ? 'ONLINE'
                : wsStatus === 'connecting'  ? 'CONNECTING...'
                : !token                     ? 'LOADING'
                : 'OFFLINE'

  const sep = <span style={{ color: 'var(--green-dim)', margin: '0 10px' }}>│</span>

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--topbar-h)',
        background: 'var(--green-dark)',
        borderBottom: '1px solid var(--green-dim)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: 12,
        fontFamily: 'inherit',
        gap: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Agent identity */}
      <span className="glow" style={{ fontWeight: 700, letterSpacing: '0.1em', marginRight: 10 }}>
        🦐 SHIRMP
      </span>
      <span style={{ color: 'var(--green-dim)' }}>v2026.3.8</span>

      {sep}

      {/* Gateway */}
      <span style={{ color: 'var(--green-dim)', marginRight: 6 }}>GATEWAY:</span>
      <span style={{ color: wsColor, fontWeight: 600 }}>{wsLabel}</span>

      {sep}

      {/* Telegram */}
      <span style={{ color: 'var(--green-dim)', marginRight: 6 }}>TELEGRAM:</span>
      <span className="badge-ok">ACTIVE</span>

      {sep}

      {/* Model */}
      <span style={{ color: 'var(--green-dim)', marginRight: 6 }}>MODEL:</span>
      <span style={{ color: 'var(--term-cyan, #00FFFF)' }}>haiku-4-5</span>

      {sep}

      {/* Heartbeat */}
      <span style={{ color: 'var(--green-dim)', marginRight: 6 }}>HEARTBEAT:</span>
      <HeartbeatTimer />

      {/* Clock — right align */}
      <div style={{ marginLeft: 'auto' }}>
        <LiveClock />
      </div>
    </div>
  )
}
