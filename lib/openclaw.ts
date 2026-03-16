import fs from 'fs'
import path from 'path'
import os from 'os'

const BASE = path.join(os.homedir(), '.openclaw')

export function readJSON<T = unknown>(relPath: string): T | null {
  try {
    const abs = path.join(BASE, relPath)
    return JSON.parse(fs.readFileSync(abs, 'utf-8')) as T
  } catch { return null }
}

export function readMD(relPath: string): string {
  try {
    const abs = path.join(BASE, relPath)
    return fs.readFileSync(abs, 'utf-8')
  } catch { return '' }
}

export function readJSONL<T = unknown>(relPath: string): T[] {
  try {
    const abs = path.join(BASE, relPath)
    const lines = fs.readFileSync(abs, 'utf-8').split('\n').filter(Boolean)
    return lines.map(l => JSON.parse(l) as T)
  } catch { return [] }
}

export function listDir(relPath: string): string[] {
  try {
    const abs = path.join(BASE, relPath)
    return fs.readdirSync(abs)
  } catch { return [] }
}

export function writeJSON(relPath: string, data: unknown): void {
  const abs = path.join(BASE, relPath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, JSON.stringify(data, null, 2))
}

export function readGatewayToken(): string {
  // Try reading from credentials dir
  try {
    const credDir = path.join(BASE, 'credentials')
    const files = fs.readdirSync(credDir)
    for (const f of files) {
      if (f.includes('gateway') || f.includes('token')) {
        return fs.readFileSync(path.join(credDir, f), 'utf-8').trim()
      }
    }
  } catch {}
  return ''
}
