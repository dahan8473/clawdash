'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TermPanel } from '@/components/ui/TermPanel'

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

const COLS = [
  { id: 'queue',       label: 'QUEUE',       color: 'var(--term-amber, #FFAA00)' },
  { id: 'in-progress', label: 'IN_PROGRESS',  color: 'var(--term-cyan, #00FFFF)' },
  { id: 'done',        label: 'DONE',         color: 'var(--green)' },
] as const

function priorityLabel(p: number) {
  if (p >= 75) return { text: '[HIGH]', color: 'var(--green)' }
  if (p >= 40) return { text: '[MED]',  color: 'var(--term-amber, #FFAA00)' }
  return            { text: '[LOW]',  color: 'var(--term-red, #FF3333)' }
}

function TaskRow({ task, onMove, onDelete }: {
  task: Task
  onMove: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const statuses: Task['status'][] = ['queue', 'in-progress', 'done']
  const idx = statuses.indexOf(task.status)
  const pLabel = priorityLabel(task.priority)

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        borderBottom: '1px solid var(--green-dark)',
        padding: '6px 0',
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: pLabel.color, minWidth: 42, flexShrink: 0 }}>{pLabel.text}</span>
        <span
          style={{ flex: 1, color: 'var(--green)', cursor: 'pointer' }}
          onClick={() => setOpen(o => !o)}
        >
          {open ? '▼' : '▶'} {task.title}
        </span>
        {task.tags.map(t => (
          <span key={t} style={{ color: 'var(--green-dim)', fontSize: 10 }}>[{t}]</span>
        ))}
        {idx > 0 && (
          <button className="term-btn" style={{ padding: '1px 6px', fontSize: 11 }}
            onClick={() => onMove(task.id, statuses[idx - 1])}>{'←'}</button>
        )}
        {idx < statuses.length - 1 && (
          <button className="term-btn term-btn-primary" style={{ padding: '1px 6px', fontSize: 11 }}
            onClick={() => onMove(task.id, statuses[idx + 1])}>{'→'}</button>
        )}
        <button
          style={{ color: 'var(--green-dim)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '1px 4px' }}
          onClick={() => onDelete(task.id)}
        >
          [X]
        </button>
      </div>
      {open && task.description && (
        <div style={{ color: 'var(--green-dim)', fontSize: 11, marginTop: 4, paddingLeft: 50, lineHeight: 1.5 }}>
          {task.description}
        </div>
      )}
    </motion.div>
  )
}

function AddModal({ onAdd, onClose }: { onAdd: (t: Partial<Task>) => void; onClose: () => void }) {
  const [title, setTitle]       = useState('')
  const [desc,  setDesc]        = useState('')
  const [priority, setPriority] = useState(50)
  const [tags,  setTags]        = useState('')

  const submit = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: desc.trim(), priority, tags: tags.split(',').map(t => t.trim()).filter(Boolean), status: 'queue' })
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ border: '1px solid var(--green)', background: '#000', padding: '20px 24px', minWidth: 420, fontFamily: 'inherit' }}>
        <div className="glow" style={{ fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>
          ┌─[ ADD_TASK ]
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 3 }}>TITLE</div>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{ width: '100%' }}
              placeholder="task description..."
            />
          </div>
          <div>
            <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 3 }}>NOTES</div>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
              placeholder="additional context..."
            />
          </div>
          <div>
            <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 3 }}>PRIORITY: {priority}%</div>
            <input type="range" min={0} max={100} value={priority} onChange={e => setPriority(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <div style={{ color: 'var(--green-dim)', fontSize: 11, marginBottom: 3 }}>TAGS (comma-separated)</div>
            <input value={tags} onChange={e => setTags(e.target.value)} style={{ width: '100%' }} placeholder="ai, dev, research" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="term-btn" style={{ flex: 1 }} onClick={onClose}>CANCEL</button>
            <button className="term-btn term-btn-primary" style={{ flex: 1 }} onClick={submit}>ADD_TASK</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkshopPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [modal, setModal] = useState(false)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(d => setTasks(d.tasks ?? []))
  }, [])

  const addTask = async (partial: Partial<Task>) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partial) })
    const { task } = await res.json()
    setTasks(prev => [...prev, task])
  }

  const moveTask = async (id: string, status: Task['status']) => {
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      <div style={{ marginBottom: 12, borderBottom: '1px solid var(--green-dim)', paddingBottom: 8, display: 'flex', alignItems: 'center' }}>
        <span className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>WORKSHOP</span>
        <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>// TASK_MANAGEMENT</span>
        <button className="term-btn term-btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setModal(true)}>
          [+] ADD_TASK
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id).sort((a, b) => b.priority - a.priority)
          return (
            <TermPanel
              key={col.id}
              title={col.label}
              titleRight={
                <span style={{ color: col.color, fontSize: 11 }}>{colTasks.length}</span>
              }
            >
              <div style={{ minHeight: 120 }}>
                <AnimatePresence mode="popLayout">
                  {colTasks.map(task => (
                    <TaskRow key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div style={{ color: 'var(--green-dark)', fontSize: 12, padding: '12px 0' }}>
                    // empty
                  </div>
                )}
              </div>
            </TermPanel>
          )
        })}
      </div>

      <AnimatePresence>
        {modal && <AddModal onAdd={addTask} onClose={() => setModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
