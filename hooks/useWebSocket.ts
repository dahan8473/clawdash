'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
export type WSMessage = Record<string, unknown>

const RECONNECT_DELAY = 5000

export function useWebSocket(baseUrl: string, token?: string) {
  const ws         = useRef<WebSocket | null>(null)
  const reconnectT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alive      = useRef(true)

  const [status,      setStatus]      = useState<WSStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [messages,    setMessages]    = useState<WSMessage[]>([])

  const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl

  const connect = useCallback(() => {
    if (!alive.current) return
    if (ws.current && ws.current.readyState < WebSocket.CLOSING) return

    try {
      setStatus('connecting')
      const sock = new WebSocket(url)
      ws.current = sock

      sock.onopen = () => {
        if (alive.current) setStatus('connected')
      }

      sock.onmessage = (e) => {
        if (!alive.current) return
        try {
          const parsed = JSON.parse(e.data) as WSMessage
          setLastMessage(parsed)
          setMessages(prev => [parsed, ...prev].slice(0, 200))
        } catch {
          // ignore non-JSON frames
        }
      }

      sock.onerror = () => {
        if (alive.current) setStatus('error')
      }

      sock.onclose = () => {
        if (!alive.current) return
        setStatus('disconnected')
        reconnectT.current = setTimeout(connect, RECONNECT_DELAY)
      }
    } catch {
      setStatus('error')
      reconnectT.current = setTimeout(connect, RECONNECT_DELAY)
    }
  }, [url])

  useEffect(() => {
    alive.current = true
    connect()
    return () => {
      alive.current = false
      if (reconnectT.current) clearTimeout(reconnectT.current)
      ws.current?.close()
    }
  }, [connect])

  const send = useCallback((msg: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg))
      return true
    }
    return false
  }, [])

  return { status, lastMessage, messages, send }
}
