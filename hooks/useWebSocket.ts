'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
export type WSMessage = Record<string, unknown>

// OpenClaw gateway protocol:
// 1. Server sends   { type:"event", event:"connect.challenge", payload:{ nonce, ts } }
// 2. Client replies { type:"req", id, method:"connect", params:{ minProtocol, maxProtocol, client, auth } }
// 3. Server replies { type:"res", ok:true, payload:{ type:"hello-ok", ... } }  → authenticated

function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useWebSocket(url: string, token?: string) {
  const ws         = useRef<WebSocket | null>(null)
  const reconnectT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alive      = useRef(true)
  const authed     = useRef(false)

  // Debounce offline display — don't flash Offline on brief reconnect
  const offlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [status,      setStatus]      = useState<WSStatus>('disconnected')
  const [displayStatus, setDisplay]   = useState<WSStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [messages,    setMessages]    = useState<WSMessage[]>([])

  // Only show 'disconnected'/'error' after 5s of being gone — avoids flicker
  useEffect(() => {
    if (status === 'connected') {
      if (offlineTimer.current) { clearTimeout(offlineTimer.current); offlineTimer.current = null }
      setDisplay('connected')
    } else if (status === 'connecting') {
      // Show connecting immediately, but don't flip to offline yet
      setDisplay(prev => prev === 'connected' ? 'connecting' : prev)
    } else {
      // disconnected / error — wait 5s before showing as offline
      if (!offlineTimer.current) {
        offlineTimer.current = setTimeout(() => {
          setDisplay(status)
          offlineTimer.current = null
        }, 5000)
      }
    }
    return () => {}
  }, [status])

  const sendConnect = useCallback((sock: WebSocket, _nonce: string) => {
    if (!token) return
    const frame = {
      type: 'req',
      id: randomId(),
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: 'gateway-client',
          version: '2026.3.8',
          platform: 'browser',
          mode: 'ui',
        },
        auth: { token },
      },
    }
    sock.send(JSON.stringify(frame))
  }, [token])

  const connect = useCallback(() => {
    if (!alive.current) return
    if (!url) return  // wait until URL/token is available

    // Don't stack connections
    if (ws.current && ws.current.readyState < WebSocket.CLOSING) {
      ws.current.close()
    }

    try {
      setStatus('connecting')
      authed.current = false
      const sock = new WebSocket(url)
      ws.current = sock

      sock.onmessage = (e) => {
        if (!alive.current) return
        let parsed: WSMessage
        try { parsed = JSON.parse(e.data) as WSMessage }
        catch { return }

        // Handle challenge → send connect frame
        if (parsed.event === 'connect.challenge') {
          const nonce = (parsed.payload as Record<string, unknown>)?.nonce as string
          sendConnect(sock, nonce)
          return
        }

        // Handle hello-ok → mark connected
        if (parsed.type === 'res') {
          const payload = parsed.payload as Record<string, unknown> | undefined
          if (parsed.ok === true && payload?.type === 'hello-ok') {
            authed.current = true
            if (alive.current) setStatus('connected')
            return
          }
          if (parsed.ok === false) {
            // Auth failed — don't retry immediately
            const err = parsed.error as Record<string, unknown> | undefined
            console.warn('[WS] connect rejected:', err?.message)
            sock.close()
            return
          }
        }

        // Normal event — only forward after authed
        if (authed.current) {
          setLastMessage(parsed)
          setMessages(prev => [parsed, ...prev].slice(0, 200))
        }
      }

      sock.onerror = () => {
        if (alive.current) setStatus('error')
      }

      sock.onclose = () => {
        if (!alive.current) return
        authed.current = false
        setStatus('disconnected')
        reconnectT.current = setTimeout(connect, 5000)
      }
    } catch {
      setStatus('error')
      reconnectT.current = setTimeout(connect, 5000)
    }
  }, [url, sendConnect])

  useEffect(() => {
    alive.current = true
    connect()
    return () => {
      alive.current = false
      if (reconnectT.current) clearTimeout(reconnectT.current)
      if (offlineTimer.current) clearTimeout(offlineTimer.current)
      ws.current?.close()
    }
  }, [connect])

  const send = useCallback((msg: unknown): boolean => {
    if (ws.current?.readyState === WebSocket.OPEN && authed.current) {
      ws.current.send(JSON.stringify(msg))
      return true
    }
    return false
  }, [])

  return { status: displayStatus, rawStatus: status, lastMessage, messages, send }
}
