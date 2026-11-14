import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Send,
  Bot,
  User,
  StopCircle,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useSSEChat } from '@/hooks/useSSE'
import { mockMessages } from '@/mocks/data'
import type { ChatMessage, Citation } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChatView() {
  const { caseId } = useParams<{ caseId: string }>()
  const currentCaseId = caseId || 'case-001'

  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [input, setInput] = useState('')
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentStreamingMsgRef = useRef<string>('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const { sendMessage, stop, isStreaming } = useSSEChat({
    onToken: (token) => {
      currentStreamingMsgRef.current += token
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant' && last.id === 'streaming-msg') {
          return [
            ...prev.slice(0, -1),
            { ...last, content: currentStreamingMsgRef.current },
          ]
        }
        return prev
      })
    },
    onCitation: (citations) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, citations: [...last.citations, ...citations] },
          ]
        }
        return prev
      })
    },
    onDone: () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.id === 'streaming-msg') {
          return [
            ...prev.slice(0, -1),
            { ...last, id: `msg-${Date.now()}` },
          ]
        }
        return prev
      })
    },
    onError: (err) => {
      console.error('SSE Error:', err)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userText = input
    setInput('')

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      citations: [],
      created_at: new Date().toISOString(),
      metadata: {},
    }

    const placeholderAssistant: ChatMessage = {
      id: 'streaming-msg',
      role: 'assistant',
      content: '',
      citations: [],
      created_at: new Date().toISOString(),
      metadata: {},
    }

    currentStreamingMsgRef.current = ''
    setMessages((prev) => [...prev, newUserMsg, placeholderAssistant])

    await sendMessage(currentCaseId, userText)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Evidence Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask questions grounded strictly in authenticated exhibits with citations.
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Messages feed */}
        <div className="flex flex-col flex-1 lg:col-span-3 rounded-lg border bg-card overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-lg p-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-foreground border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Citations badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
                        {msg.citations.map((c) => (
                          <button
                            key={c.number}
                            onClick={() => setActiveCitation(c)}
                            className="inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 text-[11px] font-medium text-primary border hover:border-primary transition-colors cursor-pointer"
                          >
                            <FileText className="h-3 w-3" />
                            [{c.number}] {c.evidence_filename}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input form */}
          <form onSubmit={handleSubmit} className="border-t p-3 bg-muted/10">
            <div className="relative flex items-center">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about timeline inconsistencies, email communications, or contradictory statements..."
                rows={2}
                className="resize-none pr-24 min-h-[56px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {isStreaming ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={stop}
                    className="h-8 gap-1 text-xs"
                  >
                    <StopCircle className="h-3.5 w-3.5" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input.trim()}
                    className="h-8 gap-1 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Citation Inspector Side-Panel */}
        <div className="hidden lg:flex flex-col rounded-lg border bg-card p-4 overflow-hidden">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Citation Inspector
          </h3>

          {activeCitation ? (
            <div className="flex-1 space-y-3 overflow-y-auto text-xs">
              <div>
                <p className="font-medium text-muted-foreground">Exhibit File</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {activeCitation.evidence_filename}
                </p>
              </div>

              {activeCitation.page && (
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p className="text-foreground">Page {activeCitation.page}</p>
                </div>
              )}

              <div>
                <p className="font-medium text-muted-foreground">Verified Snippet</p>
                <blockquote className="mt-1 border-l-2 border-primary pl-2 italic text-muted-foreground bg-muted/30 p-2 rounded-r">
                  "{activeCitation.snippet}"
                </blockquote>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center p-4 text-xs text-muted-foreground">
              Click any citation badge in an AI response to inspect the source text.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
