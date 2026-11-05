import { apiData } from './apiClient.js'

const WS_BASE = new URL(import.meta.env.VITE_COLLAB_API_URL || 'https://collab-api-ewju.onrender.com/v1').origin.replace(/^http/, 'ws')

export function subscribeRealtime(onEvent) {
  let stopped = false
  let socket = null
  let reconnectTimer = null
  let pingTimer = null
  let attempts = 0

  const connect = async () => {
    try {
      const { ticket, path = '/ws/' } = await apiData('/realtime/ticket/', { method: 'POST' })
      if (stopped) return
      if (!ticket) throw new Error('The realtime ticket was missing.')
      const url = new URL(path, WS_BASE)
      url.searchParams.set('ticket', ticket)
      socket = new WebSocket(url)
      socket.onopen = () => {
        attempts = 0
        pingTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }))
        }, 25000)
        onEvent({ event: 'reconnected' })
      }
      socket.onmessage = message => {
        try { onEvent(JSON.parse(message.data)) } catch {}
      }
      socket.onclose = () => {
        clearInterval(pingTimer)
        if (!stopped) retry()
      }
      socket.onerror = () => socket?.close()
    } catch {
      if (!stopped) retry()
    }
  }
  const retry = () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5)))
  }
  connect()
  return () => {
    stopped = true
    clearTimeout(reconnectTimer)
    clearInterval(pingTimer)
    socket?.close()
  }
}
