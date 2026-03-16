'use client'
import { useState } from 'react'
import { TermPanel } from '@/components/ui/TermPanel'

interface Skill {
  id: string
  name: string
  category: string
  summary: string
  detail: string
  fitScore: number
}

const SEED: Skill[] = [
  {
    id: '1', name: 'calendar-sync', category: 'PRODUCTIVITY',
    summary: 'Connects to Google Calendar to read/create events for briefings.',
    detail: 'Enables Shirmp to pull calendar events into morning briefings and create reminders. Requires Google Workspace credentials already configured in gws-cli.',
    fitScore: 95,
  },
  {
    id: '2', name: 'github-digest', category: 'DEV',
    summary: 'Monitors GitHub repos and summarizes PRs, issues, CI status daily.',
    detail: 'Tracks selected repositories, posts a daily digest of open PRs, failed checks, and issues assigned to you. Configurable per-repo via TOOLS.md.',
    fitScore: 82,
  },
  {
    id: '3', name: 'task-tracker', category: 'PRODUCTIVITY',
    summary: 'Creates and manages structured task lists from natural language in chat.',
    detail: 'Parse "add X to my list" messages into tasks.json automatically. Surfaces overdue tasks in morning briefings.',
    fitScore: 78,
  },
  {
    id: '4', name: 'weather-enhanced', category: 'UTILITY',
    summary: 'Fetches 7-day forecasts with pollen, AQI, and UV index for Surrey and London.',
    detail: 'Extends morning briefing with richer weather data including outdoor activity scores. Surrey BC + London ON.',
    fitScore: 71,
  },
  {
    id: '5', name: 'daily-standup', category: 'PRODUCTIVITY',
    summary: 'Sends a Telegram prompt each morning asking for your standup update.',
    detail: 'Sends "What are you working on today? Any blockers?" and logs your reply to the daily memory file.',
    fitScore: 68,
  },
]

function scoreColor(s: number) {
  if (s >= 80) return 'var(--green)'
  if (s >= 60) return 'var(--term-amber, #FFAA00)'
  return 'var(--term-red, #FF3333)'
}

export default function SkillsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [queued,   setQueued]   = useState<Set<string>>(new Set())

  const queue = async (skill: Skill) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `INSTALL: ${skill.name}`,
        description: skill.detail,
        status: 'queue',
        priority: skill.fitScore,
        tags: [skill.category.toLowerCase(), 'skill'],
      }),
    })
    setQueued(prev => new Set([...prev, skill.id]))
  }

  return (
    <div>
      <div style={{ marginBottom: 12, borderBottom: '1px solid var(--green-dim)', paddingBottom: 8 }}>
        <span className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>SKILL_DISCOVERY</span>
        <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>// SUGGESTED CAPABILITIES FOR SHIRMP</span>
      </div>

      <TermPanel title="AVAILABLE_SKILLS">
        <table className="term-table" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>FIT</th>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>SUMMARY</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {SEED.map(skill => (
              <>
                <tr
                  key={skill.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpanded(e => e === skill.id ? null : skill.id)}
                >
                  <td style={{ color: scoreColor(skill.fitScore), whiteSpace: 'nowrap', width: 60 }}>
                    [{skill.fitScore}%]
                  </td>
                  <td style={{ color: 'var(--green)', whiteSpace: 'nowrap' }}>
                    {expanded === skill.id ? '▼' : '▶'} {skill.name}
                  </td>
                  <td style={{ color: 'var(--green-dim)', whiteSpace: 'nowrap' }}>
                    [{skill.category}]
                  </td>
                  <td style={{ color: 'var(--green-dim)' }}>
                    {skill.summary}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {queued.has(skill.id)
                      ? <span className="badge-ok">[QUEUED]</span>
                      : (
                        <button
                          className="term-btn term-btn-primary"
                          style={{ fontSize: 11 }}
                          onClick={e => { e.stopPropagation(); queue(skill) }}
                        >
                          [+] QUEUE
                        </button>
                      )
                    }
                  </td>
                </tr>
                {expanded === skill.id && (
                  <tr key={`${skill.id}-detail`}>
                    <td />
                    <td colSpan={4} style={{ color: 'var(--green-dim)', paddingBottom: 10, lineHeight: 1.6, fontSize: 11 }}>
                      // {skill.detail}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </TermPanel>
    </div>
  )
}
