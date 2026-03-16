import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const docsDir = path.join(os.homedir(), '.openclaw', 'workspace', 'docs')
    fs.mkdirSync(docsDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buf = Buffer.from(bytes)
    const destPath = path.join(docsDir, file.name)
    fs.writeFileSync(destPath, buf)

    return NextResponse.json({ ok: true, path: destPath })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
