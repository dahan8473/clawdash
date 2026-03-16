'use client'
import { useState, useRef } from 'react'
import { TermPanel } from '@/components/ui/TermPanel'

export default function DocsPage() {
  const [dragging,    setDragging]    = useState(false)
  const [processing,  setProcessing]  = useState(false)
  const [lastUploaded, setLastUploaded] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setProcessing(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await fetch('/api/docs', { method: 'POST', body: formData })
      setLastUploaded(file.name)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 12, borderBottom: '1px solid var(--green-dim)', paddingBottom: 8 }}>
        <span className="glow" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.15em' }}>DOCUMENT_DIGEST</span>
        <span style={{ color: 'var(--green-dim)', marginLeft: 16, fontSize: 12 }}>// PDF SUMMARIZATION PIPELINE</span>
      </div>

      <TermPanel title="UPLOAD_ZONE">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f?.type === 'application/pdf') processFile(f)
          }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `1px dashed ${dragging ? 'var(--green)' : 'var(--green-dim)'}`,
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            color: dragging ? 'var(--green)' : 'var(--green-dim)',
            background: dragging ? 'var(--green-dark)' : 'transparent',
            transition: 'all 0.1s',
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
          <div style={{ fontSize: 24, marginBottom: 8 }}>[PDF]</div>
          <div>
            {processing ? 'PROCESSING...' : 'DROP PDF HERE OR CLICK TO BROWSE'}
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: 'var(--green-dim)' }}>
            // saves to ~/.openclaw/workspace/docs/
          </div>
        </div>

        {lastUploaded && (
          <div style={{ marginTop: 12, color: 'var(--green)', fontSize: 12 }}>
            [OK] Uploaded: {lastUploaded}
          </div>
        )}
      </TermPanel>

      <div style={{ marginTop: 12, color: 'var(--green-dim)', fontSize: 12 }}>
        // no documents processed yet
      </div>
    </div>
  )
}
