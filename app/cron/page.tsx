'use client'
import useSWR from 'swr'
import { TermPanel } from '@/components/ui/TermPanel'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { humanCron, formatDuration, formatRelative, formatTokens } from '@/lib/formatters'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface CronRun {
  ts: number
  status: string
  summary?: string
  error?: string
  durationMs: number
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number }
}

interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: { expr: string; tz: string }
  state: {
    nextRunAtMs: number
    lastRunAtMs: number
    lastRunStatus: string
    lastDurationMs: number
    consecutiveErrors: number
  }
  runs: CronRun[]
}

export default function CronPage() {
  const { data, isLoading } = useSWR('/api/cron', fetcher, { refreshInterval: 30000 })
  const jobs: CronJob[] = data?.jobs ?? []

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid var(--green-dim)', paddingBottom: 8 }}>
        <span className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>
          CRON_JOBS
        </span>
        <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>
          // SCHEDULED AGENT TASKS
        </span>
        {isLoading && <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>LOADING...</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {jobs.map(job => (
          <TermPanel
            key={job.id}
            title={job.name.toUpperCase().replace(/\s+/g, '_')}
            titleRight={
              <span style={{ fontSize: 11 }}>
                <StatusBadge status={job.enabled ? 'ok' : 'idle'} label={job.enabled ? 'ENABLED' : 'DISABLED'} />
                &nbsp;&nbsp;
                <StatusBadge status={job.state.lastRunStatus} />
              </span>
            }
          >
            {/* Schedule info row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 12, fontSize: 12 }}>
              <div>
                <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 2 }}>SCHEDULE</div>
                <div>{humanCron(job.schedule.expr, job.schedule.tz)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 2 }}>NEXT RUN</div>
                <div style={{ color: 'var(--term-amber, #FFAA00)' }}>
                  T-<CountdownTimer targetMs={job.state.nextRunAtMs} />
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 2 }}>LAST RUN</div>
                <div>{formatRelative(job.state.lastRunAtMs)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 2 }}>DURATION</div>
                <div style={{ fontFamily: 'inherit' }}>{formatDuration(job.state.lastDurationMs)}</div>
              </div>
            </div>

            {job.state.consecutiveErrors > 0 && (
              <div style={{ color: 'var(--term-red, #FF3333)', fontSize: 12, marginBottom: 8 }} className="glow-red">
                [ERR] {job.state.consecutiveErrors} CONSECUTIVE ERRORS
              </div>
            )}

            {/* Run history */}
            <div style={{ borderTop: '1px solid var(--green-dark)', paddingTop: 8 }}>
              <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 6 }}>RUN_HISTORY</div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table className="term-table" style={{ fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th>STATUS</th>
                      <th>TIMESTAMP</th>
                      <th>DURATION</th>
                      <th>TOKENS</th>
                      <th style={{ width: '50%' }}>SUMMARY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.runs.map((run, i) => (
                      <tr key={i}>
                        <td>
                          {run.status === 'ok'
                            ? <span className="badge-ok">[OK]</span>
                            : <span className="badge-err glow-red">[ERR]</span>
                          }
                        </td>
                        <td style={{ color: 'var(--green-dim)', whiteSpace: 'nowrap' }}>
                          {new Date(run.ts).toISOString().replace('T', ' ').slice(0, 16)}
                        </td>
                        <td style={{ fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          {formatDuration(run.durationMs)}
                        </td>
                        <td style={{ color: 'var(--term-cyan, #00FFFF)', whiteSpace: 'nowrap' }}>
                          {run.usage ? formatTokens(run.usage.total_tokens) : '—'}
                        </td>
                        <td style={{ color: 'var(--green-dim)', maxWidth: 300 }}>
                          {run.summary
                            ? run.summary.replace(/^---\n/, '').split('\n').filter(Boolean).slice(0, 1).join(' ')
                            : run.error
                            ? <span style={{ color: 'var(--term-red, #FF3333)' }}>{run.error}</span>
                            : '—'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TermPanel>
        ))}

        {jobs.length === 0 && !isLoading && (
          <div style={{ color: 'var(--green-dim)', fontSize: 12 }}>// no cron jobs configured</div>
        )}
      </div>
    </div>
  )
}
