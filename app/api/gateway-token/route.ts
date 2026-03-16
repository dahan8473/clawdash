import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export async function GET() {
  try {
    const authPath = path.join(os.homedir(), '.openclaw', 'identity', 'device-auth.json')
    const raw = fs.readFileSync(authPath, 'utf-8')
    const data = JSON.parse(raw) as {
      tokens: { operator?: { token: string }; [k: string]: { token: string } | undefined }
    }
    const token = data.tokens?.operator?.token
      ?? Object.values(data.tokens).find(Boolean)?.token
      ?? ''
    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ token: '' })
  }
}
