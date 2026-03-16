import { NextResponse } from 'next/server'
import { readJSON, readMD, readJSONL, listDir } from '@/lib/openclaw'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export async function GET() {
  const config = readJSON('openclaw.json') as Record<string, unknown> | null

  // Get today's memory
  const today = new Date().toISOString().split('T')[0]
  const memory = readMD(`workspace/memory/${today}.md`)

  // Get HEARTBEAT
  const heartbeat = readMD('workspace/HEARTBEAT.md')

  // Get CHANGELOG
  const changelog = readMD('workspace/CHANGELOG.md')

  // Check gateway log
  let gatewayLog = ''
  try {
    const logPath = path.join(os.homedir(), '.openclaw', 'logs', 'gateway.log')
    const stat = fs.statSync(logPath)
    const size = stat.size
    const fd = fs.openSync(logPath, 'r')
    const buf = Buffer.alloc(Math.min(4096, size))
    fs.readSync(fd, buf, 0, buf.length, Math.max(0, size - buf.length))
    fs.closeSync(fd)
    gatewayLog = buf.toString('utf-8')
  } catch {}

  // Get recent sessions - check if sessions dir exists
  let recentSessions: unknown[] = []
  try {
    const sessDir = path.join(os.homedir(), '.openclaw', 'sessions')
    if (fs.existsSync(sessDir)) {
      const files = fs.readdirSync(sessDir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({
          name: f,
          mtime: fs.statSync(path.join(sessDir, f)).mtimeMs,
        }))
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, 3)
      recentSessions = files.map(f => ({ file: f.name, mtime: f.mtime }))
    }
  } catch {}

  const agents = readJSON('openclaw.json') as Record<string, unknown> | null
  const channels = (agents as Record<string, unknown> | null)?.channels

  return NextResponse.json({
    config,
    memory,
    heartbeat,
    changelog,
    gatewayLog: gatewayLog.split('\n').filter(Boolean).slice(-20),
    recentSessions,
    channels,
    timestamp: Date.now(),
  })
}
