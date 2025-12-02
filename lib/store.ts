import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIStore {
  messages: Message[];
  isProcessing: boolean;
  currentAction: string | null;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setProcessing: (processing: boolean) => void;
  setCurrentAction: (action: string | null) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  messages: [],
  isProcessing: false,
  currentAction: null,
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Math.random().toString(36).substr(2, 9),
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setCurrentAction: (action) => set({ currentAction: action }),
  clearMessages: () => set({ messages: [] }),
}));
