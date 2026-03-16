import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/openclaw'
import { NextRequest } from 'next/server'

interface Task {
  id: string
  title: string
  description: string
  status: 'queue' | 'in-progress' | 'done'
  priority: number
  tags: string[]
  createdAt: number
  updatedAt: number
}

function getTasks(): Task[] {
  const data = readJSON('tasks.json') as { tasks: Task[] } | null
  return data?.tasks ?? []
}

export async function GET() {
  return NextResponse.json({ tasks: getTasks() })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const tasks = getTasks()
  const newTask: Task = {
    id: crypto.randomUUID(),
    title: body.title ?? 'New Task',
    description: body.description ?? '',
    status: body.status ?? 'queue',
    priority: body.priority ?? 50,
    tags: body.tags ?? [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  tasks.push(newTask)
  writeJSON('tasks.json', { tasks })
  return NextResponse.json({ task: newTask })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const tasks = getTasks()
  const idx = tasks.findIndex(t => t.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })
  tasks[idx] = { ...tasks[idx], ...body, updatedAt: Date.now() }
  writeJSON('tasks.json', { tasks })
  return NextResponse.json({ task: tasks[idx] })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const tasks = getTasks().filter(t => t.id !== id)
  writeJSON('tasks.json', { tasks })
  return NextResponse.json({ ok: true })
}
