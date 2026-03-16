import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export async function GET() {
  let lines: string[] = []
  try {
    const logPath = path.join(os.homedir(), '.openclaw', 'logs', 'gateway.log')
    const stat = fs.statSync(logPath)
    const size = stat.size
    const fd = fs.openSync(logPath, 'r')
    const buf = Buffer.alloc(Math.min(8192, size))
    fs.readSync(fd, buf, 0, buf.length, Math.max(0, size - buf.length))
    fs.closeSync(fd)
    lines = buf.toString('utf-8').split('\n').filter(Boolean).slice(-50)
  } catch {}

  return NextResponse.json({ lines, timestamp: Date.now() })
}
