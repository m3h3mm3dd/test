
'use client'

import { useEffect, useRef, useState } from 'react'
import { getMessagesForProject, sendMessageToProject } from '@/api/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { format } from 'date-fns'

interface ProjectChatProps {
  projectId: string
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      const data = await getMessagesForProject(projectId)
      setMessages(data)
    }
    fetchMessages()
  }, [projectId])

  const handleSend = async () => {
    if (!message.trim()) return
    setLoading(true)
    const newMsg = await sendMessageToProject({ text: message, projectId })
    setMessages(prev => [...prev, newMsg])
    setMessage('')
    setLoading(false)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="border rounded-xl flex flex-col h-[480px]">
      <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.Id}
            className={cn(
              'max-w-[80%] p-3 rounded-xl text-sm shadow transition',
              msg.SenderId === user?.Id
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'mr-auto bg-muted'
            )}
          >
            <p>{msg.Text}</p>
            <span className="block mt-1 text-xs text-muted-foreground text-right">
              {format(new Date(msg.CreatedAt), 'HH:mm')}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </ScrollArea>

      <div className="flex border-t items-center gap-2 p-4">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !message.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}
