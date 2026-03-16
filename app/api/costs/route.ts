import { NextResponse } from 'next/server'
import { readJSON, readJSONL } from '@/lib/openclaw'
import { calcCost } from '@/lib/formatters'

interface CronRun {
  ts: number
  jobId: string
  status: string
  durationMs: number
  runAtMs: number
  model?: string
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number }
}

export async function GET() {
  const jobsData = readJSON('cron/jobs.json') as { jobs: Array<{ id: string; name: string }> } | null
  const jobs = jobsData?.jobs ?? []

  const allRuns: Array<CronRun & { jobName: string; cost: number }> = []

  for (const job of jobs) {
    const runs = readJSONL<CronRun>(`cron/runs/${job.id}.jsonl`)
    for (const run of runs) {
      if (run.usage) {
        const cost = calcCost(run.model ?? 'claude-haiku-4-5', run.usage.input_tokens, run.usage.output_tokens)
        allRuns.push({ ...run, jobName: job.name, cost })
      }
    }
  }

  allRuns.sort((a, b) => b.ts - a.ts)

  // Daily aggregation
  const dailyMap: Record<string, number> = {}
  for (const run of allRuns) {
    const day = new Date(run.ts).toISOString().split('T')[0]
    dailyMap[day] = (dailyMap[day] ?? 0) + run.cost
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, cost]) => ({ date, cost }))

  // Model aggregation
  const modelMap: Record<string, number> = {}
  for (const run of allRuns) {
    const m = run.model ?? 'unknown'
    modelMap[m] = (modelMap[m] ?? 0) + run.cost
  }
  const byModel = Object.entries(modelMap).map(([model, cost]) => ({ model, cost }))

  const totalCost = allRuns.reduce((s, r) => s + r.cost, 0)
  const today = new Date().toISOString().split('T')[0]
  const todayCost = allRuns
    .filter(r => new Date(r.ts).toISOString().split('T')[0] === today)
    .reduce((s, r) => s + r.cost, 0)

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthCost = allRuns
    .filter(r => new Date(r.ts).toISOString().slice(0, 7) === thisMonth)
    .reduce((s, r) => s + r.cost, 0)

  return NextResponse.json({
    runs: allRuns.slice(0, 50),
    daily,
    byModel,
    totalCost,
    todayCost,
    monthCost,
    avgPerSession: allRuns.length ? totalCost / allRuns.length : 0,
    timestamp: Date.now(),
  })
}
