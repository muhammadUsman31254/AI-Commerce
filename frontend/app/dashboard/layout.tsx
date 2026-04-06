"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import VoiceFAB from "@/components/voice/VoiceFAB";
import ChatPanel from "@/components/chat/ChatPanel";
import { ChatProvider, useChatContext } from "@/context/ChatContext";
import { isAuthenticated } from "@/lib/auth";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isOpen, togglePanel } = useChatContext();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Chat panel — slides in/out */}
      <div className="relative flex shrink-0">
        {/* Drawer handle — always visible */}
        <button
          onClick={togglePanel}
          title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className="absolute top-1/2 -translate-y-1/2 -start-3 z-10 w-6 h-12 bg-white border border-gray-200 rounded-s-lg shadow-sm flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
          >
            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "w-80" : "w-0"
          }`}
        >
          <ChatPanel />
        </div>
      </div>

      {process.env.NEXT_PUBLIC_ENABLE_VOICE === "true" ? <VoiceFAB /> : null}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <ChatProvider>
      <DashboardShell>{children}</DashboardShell>
    </ChatProvider>
  );
}
