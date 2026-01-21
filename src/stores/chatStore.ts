import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  messages: Message[]
  context: {
    page: string
    cityId?: string
    contentType?: string
  }
  createdAt: string
  updatedAt: string
}

interface ChatState {
  isOpen: boolean
  isLoading: boolean
  currentConversation: Conversation | null
  conversationHistory: Conversation[]
  error: string | null
}

interface ChatActions {
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  startNewConversation: (context: Conversation['context']) => void
  clearCurrentConversation: () => void
  updateContext: (context: Partial<Conversation['context']>) => void
}

type ChatStore = ChatState & ChatActions

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        isOpen: false,
        isLoading: false,
        currentConversation: null,
        conversationHistory: [],
        error: null,

        // Actions
        toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

        openChat: () => set({ isOpen: true }),

        closeChat: () => set({ isOpen: false }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        addMessage: (message) => {
          const state = get()
          const newMessage: Message = {
            ...message,
            id: generateId(),
            timestamp: new Date().toISOString(),
          }

          if (!state.currentConversation) {
            // Start a new conversation if none exists
            const newConversation: Conversation = {
              id: generateId(),
              messages: [newMessage],
              context: { page: '/' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            set({ currentConversation: newConversation })
          } else {
            // Add to existing conversation
            set({
              currentConversation: {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, newMessage],
                updatedAt: new Date().toISOString(),
              },
            })
          }
        },

        startNewConversation: (context) => {
          const state = get()

          // Save current conversation to history if it has messages
          if (state.currentConversation && state.currentConversation.messages.length > 0) {
            set({
              conversationHistory: [state.currentConversation, ...state.conversationHistory].slice(0, 50), // Keep last 50
            })
          }

          const newConversation: Conversation = {
            id: generateId(),
            messages: [],
            context,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set({ currentConversation: newConversation, error: null })
        },

        clearCurrentConversation: () => {
          const state = get()
          if (state.currentConversation && state.currentConversation.messages.length > 0) {
            set({
              conversationHistory: [state.currentConversation, ...state.conversationHistory].slice(0, 50),
            })
          }
          set({ currentConversation: null, error: null })
        },

        updateContext: (context) => {
          const state = get()
          if (state.currentConversation) {
            set({
              currentConversation: {
                ...state.currentConversation,
                context: { ...state.currentConversation.context, ...context },
              },
            })
          }
        },
      }),
      {
        name: 'tmh-chat-store',
        partialize: (state) => ({
          conversationHistory: state.conversationHistory,
        }),
      }
    ),
    { name: 'chat-store' }
  )
)
