"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { chatApi } from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContextValue {
  messages: ChatMessage[];
  loading: boolean;
  error: string;
  isOpen: boolean;
  togglePanel: () => void;
  sendText: (text: string) => Promise<void>;
  pushMessages: (msgs: ChatMessage[]) => void;
}

const ChatContext = createContext<ChatContextValue>({
  messages: [],
  loading: false,
  error: "",
  isOpen: true,
  togglePanel: () => {},
  sendText: async () => {},
  pushMessages: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const togglePanel = useCallback(() => setIsOpen((v) => !v), []);

  const pushMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...msgs]);
    // Auto-open the panel when a voice message arrives
    setIsOpen(true);
  }, []);

  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: trimmed },
    ]);
    setLoading(true);

    try {
      const res = await chatApi.send(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <ChatContext.Provider value={{ messages, loading, error, isOpen, togglePanel, sendText, pushMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
