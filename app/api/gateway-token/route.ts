import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export async function GET() {
  // Primary: OPENCLAW_GATEWAY_TOKEN in ~/.openclaw/.env
  // This is the shared token set via `openclaw gateway --token` or OPENCLAW_GATEWAY_TOKEN env
  try {
    const envPath = path.join(os.homedir(), '.openclaw', '.env')
    const raw = fs.readFileSync(envPath, 'utf-8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^OPENCLAW_GATEWAY_TOKEN=(.+)$/)
      if (m) return NextResponse.json({ token: m[1].trim() })
    }
  } catch { /* file missing */ }

  // Fallback: operator token from identity/device-auth.json
  try {
    const authPath = path.join(os.homedir(), '.openclaw', 'identity', 'device-auth.json')
    const data = JSON.parse(fs.readFileSync(authPath, 'utf-8')) as {
      tokens: Record<string, { token: string } | undefined>
    }
    const token = data.tokens?.operator?.token
      ?? Object.values(data.tokens).find(Boolean)?.token
      ?? ''
    if (token) return NextResponse.json({ token })
  } catch { /* file missing */ }

  return NextResponse.json({ token: '' })
}
