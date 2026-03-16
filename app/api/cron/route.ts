import { NextResponse } from 'next/server'
import { readJSON, readJSONL } from '@/lib/openclaw'

interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: { kind: string; expr: string; tz: string }
  state: {
    nextRunAtMs: number
    lastRunAtMs: number
    lastRunStatus: string
    lastDurationMs: number
    consecutiveErrors: number
    lastDeliveryStatus: string
  }
  payload: { kind: string; message: string }
}

interface CronRun {
  ts: number
  jobId: string
  action: string
  status: string
  summary?: string
  error?: string
  durationMs: number
  runAtMs: number
  nextRunAtMs: number
  model?: string
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number }
}

export async function GET() {
  const jobsData = readJSON('cron/jobs.json') as { jobs: CronJob[] } | null
  const jobs = jobsData?.jobs ?? []

  // Read run history for each job
  const jobsWithRuns = jobs.map(job => {
    const runs = readJSONL<CronRun>(`cron/runs/${job.id}.jsonl`)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 20)
    return { ...job, runs }
  })

  return NextResponse.json({ jobs: jobsWithRuns, timestamp: Date.now() })
}
