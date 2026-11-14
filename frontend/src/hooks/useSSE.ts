import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'
import type { Citation } from '@/types'

interface SSECallbacks {
  onToken: (token: string) => void
  onCitation: (citations: Citation[]) => void
  onDone: () => void
  onError: (error: Error) => void
}

interface UseSSEChatReturn {
  sendMessage: (caseId: string, message: string, sessionId?: string) => Promise<void>
  stop: () => void
  isStreaming: boolean
}

export function useSSEChat(callbacks: SSECallbacks): UseSSEChatReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const sendMessage = useCallback(
    async (caseId: string, message: string, sessionId?: string) => {
      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller
      setIsStreaming(true)

      try {
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, session_id: sessionId }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.slice(6).trim()
              if (!rawData) continue

              try {
                const event = JSON.parse(rawData) as {
                  type: string
                  content?: string
                  citations?: Citation[]
                }

                switch (event.type) {
                  case 'token':
                    if (event.content) callbacks.onToken(event.content)
                    break
                  case 'citations':
                    if (event.citations) callbacks.onCitation(event.citations)
                    break
                  case 'done':
                    callbacks.onDone()
                    break
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // User stopped — not an error
          return
        }
        callbacks.onError(error instanceof Error ? error : new Error(String(error)))
      } finally {
        abortControllerRef.current = null
        setIsStreaming(false)
      }
    },
    [callbacks]
  )

  return { sendMessage, stop, isStreaming }
}
