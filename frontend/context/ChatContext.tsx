"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { chatApi } from "@/lib/api";
import { getSellerId } from "@/lib/auth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface PendingProduct {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface ChatContextValue {
  messages: ChatMessage[];
  loading: boolean;
  error: string;
  isOpen: boolean;
  pendingProduct: PendingProduct | null;
  pendingNavigation: string | null;
  togglePanel: () => void;
  sendText: (text: string) => Promise<void>;
  pushMessages: (msgs: ChatMessage[]) => void;
  openImageUpload: (pending: PendingProduct) => void;
  clearPendingProduct: () => void;
  triggerNavigation: (route: string) => void;
  clearNavigation: () => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  messages: [],
  loading: false,
  error: "",
  isOpen: true,
  pendingProduct: null,
  pendingNavigation: null,
  togglePanel: () => {},
  sendText: async () => {},
  pushMessages: () => {},
  openImageUpload: () => {},
  clearPendingProduct: () => {},
  triggerNavigation: () => {},
  clearNavigation: () => {},
  clearMessages: () => {},
});

function getChatKey() {
  const id = getSellerId();
  return id ? `chat_history_${id}` : null;
}

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const key = getChatKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  const key = getChatKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(msgs));
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [pendingProduct, setPendingProduct] = useState<PendingProduct | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const togglePanel = useCallback(() => setIsOpen((v) => !v), []);

  const pushMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...msgs]);
    setIsOpen(true);
  }, []);

  const openImageUpload = useCallback((pending: PendingProduct) => {
    setPendingProduct(pending);
    setIsOpen(true);
  }, []);

  const clearPendingProduct = useCallback(() => setPendingProduct(null), []);
  const triggerNavigation = useCallback((route: string) => setPendingNavigation(route), []);
  const clearNavigation = useCallback(() => setPendingNavigation(null), []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    const key = getChatKey();
    if (key) localStorage.removeItem(key);
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
      const { reply, action, pending, route } = res.data;

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);

      if (action === "upload_image" && pending) {
        openImageUpload(pending as PendingProduct);
      } else if (action === "navigate" && route) {
        triggerNavigation(route as string);
      }
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }, [loading, openImageUpload]);

  return (
    <ChatContext.Provider value={{
      messages, loading, error, isOpen, pendingProduct, pendingNavigation,
      togglePanel, sendText, pushMessages, openImageUpload, clearPendingProduct,
      triggerNavigation, clearNavigation, clearMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
