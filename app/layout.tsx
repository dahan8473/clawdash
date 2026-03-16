import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'

export const metadata: Metadata = {
  title: 'CLAWDASH :: MISSION CONTROL',
  description: 'OpenClaw Agent Terminal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Fixed top status bar */}
        <TopBar />

        {/* Left sidebar nav */}
        <Sidebar />

        {/* Main content */}
        <main
          style={{
            marginLeft: 'var(--sidebar-w)',
            marginTop: 'var(--topbar-h)',
            minHeight: 'calc(100vh - var(--topbar-h))',
            padding: '16px',
            position: 'relative',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
