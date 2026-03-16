'use client'
import useSWR from 'swr'
import { TermPanel } from '@/components/ui/TermPanel'
import { formatCost, formatTokens, formatDuration, formatRelative } from '@/lib/formatters'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const MODEL_COLORS: Record<string, string> = {
  'haiku': '#00FF41',
  'sonnet': '#00FFFF',
  'opus': '#FFAA00',
}

function modelColor(model: string) {
  const key = Object.keys(MODEL_COLORS).find(k => model.includes(k))
  return MODEL_COLORS[key ?? ''] ?? '#005500'
}

const TOOLTIP_STYLE = {
  background: '#000',
  border: '1px solid #005500',
  borderRadius: 0,
  fontSize: 11,
  fontFamily: 'inherit',
  color: '#00FF41',
}

export default function CostsPage() {
  const { data, isLoading } = useSWR('/api/costs', fetcher, { refreshInterval: 60000 })

  const daily:   Array<{ date: string; cost: number }> = data?.daily ?? []
  const byModel: Array<{ model: string; cost: number }> = data?.byModel ?? []
  const runs = data?.runs ?? []

  const dailyFmt = daily.map(d => ({ ...d, label: d.date.slice(5) }))

  return (
    <div>
      <div style={{ marginBottom: 12, borderBottom: '1px solid var(--green-dim)', paddingBottom: 8 }}>
        <span className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>
          API_COSTS
        </span>
        <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>
          // TOKEN SPEND FROM CRON RUNS
        </span>
        {isLoading && <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>LOADING...</span>}
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'TODAY',         value: formatCost(data?.todayCost ?? 0),     color: 'var(--green)' },
          { label: 'THIS_MONTH',    value: formatCost(data?.monthCost ?? 0),     color: 'var(--term-cyan, #00FFFF)' },
          { label: 'AVG_PER_RUN',   value: formatCost(data?.avgPerSession ?? 0), color: 'var(--term-amber, #FFAA00)' },
          { label: 'TOTAL',         value: formatCost(data?.totalCost ?? 0),     color: 'var(--green-mid)' },
        ].map(kpi => (
          <div
            key={kpi.label}
            style={{ border: '1px solid var(--green-dim)', padding: '10px 12px', textAlign: 'center' }}
          >
            <div style={{ color: 'var(--green-dim)', fontSize: 11, letterSpacing: '0.1em', marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div style={{ color: kpi.color, fontSize: 18, fontWeight: 700 }} className="glow">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 8, marginBottom: 12 }}>
        <TermPanel title="DAILY_SPEND_30D">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dailyFmt}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#005500', fontSize: 10, fontFamily: 'inherit' }}
                axisLine={{ stroke: '#001a00' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#005500', fontSize: 10, fontFamily: 'inherit' }}
                axisLine={{ stroke: '#001a00' }}
                tickLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(4)}`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: unknown) => [formatCost(Number(v)), 'COST']}
                labelStyle={{ color: '#005500' }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#00FF41"
                strokeWidth={1}
                dot={false}
                style={{ filter: 'drop-shadow(0 0 3px #00FF41)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TermPanel>

        <TermPanel title="SPEND_BY_MODEL">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byModel} layout="vertical">
              <XAxis
                type="number"
                tick={{ fill: '#005500', fontSize: 10, fontFamily: 'inherit' }}
                axisLine={{ stroke: '#001a00' }}
                tickLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(4)}`}
              />
              <YAxis
                type="category"
                dataKey="model"
                tick={{ fill: '#005500', fontSize: 10, fontFamily: 'inherit' }}
                axisLine={{ stroke: '#001a00' }}
                tickLine={false}
                width={80}
                tickFormatter={(v: string) => v.split('/').pop()?.split('-').slice(-2).join('-') ?? v}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: unknown) => [formatCost(Number(v)), 'COST']}
                labelStyle={{ color: '#005500' }}
              />
              <Bar dataKey="cost" radius={0}>
                {byModel.map((m, i) => (
                  <Cell key={i} fill={modelColor(m.model)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TermPanel>
      </div>

      {/* Runs table */}
      <TermPanel title="ALL_RUNS" titleRight={
        <span style={{ color: 'var(--green-dim)', fontSize: 11 }}>{runs.length} ENTRIES</span>
      }>
        <div style={{ overflowX: 'auto', marginTop: 4 }}>
          <table className="term-table" style={{ fontSize: 11 }}>
            <thead>
              <tr>
                <th>JOB</th>
                <th>TIMESTAMP</th>
                <th>MODEL</th>
                <th style={{ textAlign: 'right' }}>IN</th>
                <th style={{ textAlign: 'right' }}>OUT</th>
                <th style={{ textAlign: 'right' }}>TOTAL</th>
                <th style={{ textAlign: 'right' }}>DUR</th>
                <th style={{ textAlign: 'right' }}>COST</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 30).map((run: Record<string, unknown>, i: number) => {
                const usage = run.usage as Record<string, number> | undefined
                return (
                  <tr key={i}>
                    <td>{String(run.jobName ?? '').replace(/\s+/g, '_').toUpperCase()}</td>
                    <td style={{ color: 'var(--green-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(run.ts as number).toISOString().replace('T', ' ').slice(0, 16)}
                    </td>
                    <td style={{ color: 'var(--term-cyan, #00FFFF)' }}>
                      {String(run.model ?? '').split('-').slice(-2).join('-')}
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatTokens(usage?.input_tokens ?? 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatTokens(usage?.output_tokens ?? 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatTokens(usage?.total_tokens ?? 0)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatDuration(run.durationMs as number)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--green)' }} className="glow">
                      {formatCost(run.cost as number)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </TermPanel>
    </div>
  )
}
