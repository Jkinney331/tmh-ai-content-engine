'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useChatStore, Message } from '@/stores/chatStore'
import { useCityStore } from '@/stores/cityStore'
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

export default function ChatPanel() {
  const pathname = usePathname()
  const {
    isOpen,
    isLoading,
    currentConversation,
    error,
    toggleChat,
    closeChat,
    setLoading,
    setError,
    addMessage,
    startNewConversation,
    clearCurrentConversation,
    updateContext,
  } = useChatStore()

  const { selectedCity } = useCityStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showFloating, setShowFloating] = useState(false)

  // Update context when page or city changes
  useEffect(() => {
    updateContext({
      page: pathname,
      cityId: selectedCity?.id,
    })
  }, [pathname, selectedCity, updateContext])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleResize = () => {
      setShowFloating(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Ensure we have a conversation
    if (!currentConversation) {
      startNewConversation({
        page: pathname,
        cityId: selectedCity?.id,
      })
    }

    // Add user message
    addMessage({ role: 'user', content: userMessage })

    setLoading(true)
    setError(null)

    try {
      const messages = [
        ...(currentConversation?.messages || []).map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: userMessage },
      ]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          context: {
            page: pathname,
            cityId: selectedCity?.id,
            cityName: selectedCity?.name,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      addMessage({ role: 'assistant', content: data.message })
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {showFloating && (
        <button
          onClick={toggleChat}
          className={`fixed bottom-6 right-6 z-40 rounded-full p-4 shadow-lg transition-all duration-200 ${
            isOpen
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6 text-white" />
          ) : (
            <MessageSquare className="w-6 h-6 text-white" />
          )}
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">TMH Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearCurrentConversation}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="New conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeChat}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Context Badge */}
        {(pathname !== '/' || selectedCity) && (
          <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-500 flex items-center gap-2 flex-wrap">
            <span>Context:</span>
            {pathname !== '/' && (
              <span className="px-2 py-0.5 bg-gray-200 rounded-full">
                {pathname.split('/').filter(Boolean).join(' > ') || 'Home'}
              </span>
            )}
            {selectedCity && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                {selectedCity.name}
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {(!currentConversation || currentConversation.messages.length === 0) ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Ask me anything about TMH content creation
              </p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setInput('Help me write an Instagram caption for this city')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 block mx-auto"
                >
                  "Help me write an Instagram caption"
                </button>
                <button
                  onClick={() => setInput('What models should I use for a product GIF?')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 block mx-auto"
                >
                  "What models for a product GIF?"
                </button>
                <button
                  onClick={() => setInput('Suggest some local slang for this city')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 block mx-auto"
                >
                  "Suggest local slang for this city"
                </button>
              </div>
            </div>
          ) : (
            currentConversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} formatTime={formatTime} />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about content, cities, or strategy..."
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function MessageBubble({
  message,
  formatTime,
}: {
  message: Message
  formatTime: (t: string) => string
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-indigo-200' : 'text-gray-400'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
