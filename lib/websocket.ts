// Client-side WebSocket hook helper
export type WSMessage = {
  type: string
  [key: string]: unknown
}

export function createWSUrl(): string {
  return 'ws://127.0.0.1:18789'
}
