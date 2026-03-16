'use client'
import useSWR from 'swr'
import { TermPanel } from '@/components/ui/TermPanel'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useWebSocket } from '@/hooks/useWebSocket'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AgentsPage() {
  const { data: tokenData } = useSWR('/api/gateway-token', fetcher)
  const token = tokenData?.token ?? ''
  const { status: wsStatus, messages } = useWebSocket(token ? 'ws://127.0.0.1:18789' : '', token || undefined)

  return (
    <div>
      <div style={{ marginBottom: 12, borderBottom: '1px solid var(--green-dim)', paddingBottom: 8 }}>
        <span className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>AGENT_HUB</span>
        <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>// ACTIVE AGENTS IN NETWORK</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {/* Shirmp agent card */}
        <TermPanel title="AGENT:MAIN">
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { k: 'ID',       v: 'main' },
                { k: 'NAME',     v: '🦐 Shirmp' },
                { k: 'ROLE',     v: 'Commander Agent' },
                { k: 'MODEL',    v: <span style={{ color: 'var(--term-cyan, #00FFFF)' }}>claude-haiku-4-5</span> },
                { k: 'CHANNEL',  v: 'Telegram' },
                { k: 'STATUS',   v: <StatusBadge status="ok" label="ACTIVE" /> },
              ].map(({ k, v }) => (
                <tr key={k} style={{ borderBottom: '1px solid var(--green-dark)' }}>
                  <td style={{ color: 'var(--green-dim)', padding: '4px 16px 4px 0', whiteSpace: 'nowrap' }}>{k}</td>
                  <td style={{ padding: '4px 0' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, color: 'var(--green-dim)', fontSize: 11, lineHeight: 1.5 }}>
            // Direct, proactive, builds on context across sessions.<br/>
            // Logs everything. Knows David&apos;s work and goals.
          </div>
        </TermPanel>

        {/* WS connection info */}
        <TermPanel title="GATEWAY_CONNECTION">
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--green-dim)' }}>ENDPOINT</span>
              <span style={{ color: 'var(--term-cyan, #00FFFF)' }}>ws://127.0.0.1:18789</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--green-dim)' }}>AUTH</span>
              <span>TOKEN</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--green-dim)' }}>STATUS</span>
              <StatusBadge status={wsStatus} label={wsStatus.toUpperCase()} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--green-dim)' }}>MESSAGES_RX</span>
              <span>{messages.length}</span>
            </div>
          </div>
        </TermPanel>
      </div>

      {/* Live message feed */}
      <TermPanel title="WS_EVENT_STREAM" titleRight={
        <StatusBadge status={wsStatus} label={wsStatus.toUpperCase()} />
      }>
        <div style={{ maxHeight: 300, overflowY: 'auto', fontFamily: 'inherit', fontSize: 11 }}>
          {messages.length > 0
            ? messages.slice(0, 50).map((m, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--green-dark)', padding: '3px 0', color: 'var(--green-dim)' }}>
                  <span style={{ color: 'var(--green-dim)', marginRight: 8 }}>[{i.toString().padStart(3, '0')}]</span>
                  <span>{JSON.stringify(m).slice(0, 120)}</span>
                </div>
              ))
            : (
                <div style={{ color: 'var(--green-dim)' }}>
                  {wsStatus === 'connected'
                    ? '// connected — waiting for events...'
                    : wsStatus === 'connecting'
                    ? '// connecting to ws://127.0.0.1:18789...'
                    : '// gateway offline — check OpenClaw is running'
                  }
                </div>
              )
          }
        </div>
      </TermPanel>
    </div>
  )
}
