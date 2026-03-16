'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',         cmd: 'status',    label: 'COMMAND_CENTER' },
  { href: '/workshop', cmd: 'workshop',  label: 'WORKSHOP' },
  { href: '/costs',    cmd: 'costs',     label: 'API_COSTS' },
  { href: '/cron',     cmd: 'cron',      label: 'CRON_JOBS' },
  { href: '/skills',   cmd: 'skills',    label: 'SKILLS' },
  { href: '/docs',     cmd: 'docs',      label: 'DOCS' },
  { href: '/agents',   cmd: 'agents',    label: 'AGENTS' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 'var(--topbar-h)',
        width: 'var(--sidebar-w)',
        height: 'calc(100vh - var(--topbar-h))',
        borderRight: '1px solid var(--green-dim)',
        background: 'var(--bg)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo block */}
      <div style={{
        padding: '14px 12px 10px',
        borderBottom: '1px solid var(--green-dim)',
      }}>
        <div className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>
          🦐 CLAWDASH
        </div>
        <div style={{ color: 'var(--green-dim)', fontSize: 11, marginTop: 2 }}>
          OPENCLAW v2026.3.8
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        <div style={{ color: 'var(--green-dim)', fontSize: 11, padding: '8px 12px 4px', letterSpacing: '0.08em' }}>
          COMMANDS
        </div>
        {NAV.map(({ href, cmd, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}>
              <div
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  color: active ? 'var(--green)' : 'var(--green-dim)',
                  background: active ? 'var(--green-dark)' : 'transparent',
                  borderLeft: active ? '2px solid var(--green)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--green-mid)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--green-dim)'
                }}
              >
                <span style={{ color: active ? 'var(--green)' : 'var(--green-dim)', marginRight: 6 }}>
                  {active ? '▶' : '>'}
                </span>
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--green-dark)',
        color: 'var(--green-dim)',
        fontSize: 11,
      }}>
        SHIRMP@OPENCLAW
      </div>
    </aside>
  )
}
