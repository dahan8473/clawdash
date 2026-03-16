import { NextResponse } from 'next/server'
import { readMD } from '@/lib/openclaw'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  return NextResponse.json({
    today: readMD(`workspace/memory/${today}.md`),
    yesterday: readMD(`workspace/memory/${yesterday}.md`),
    longTerm: readMD('workspace/MEMORY.md'),
    heartbeat: readMD('workspace/HEARTBEAT.md'),
    timestamp: Date.now(),
  })
}
