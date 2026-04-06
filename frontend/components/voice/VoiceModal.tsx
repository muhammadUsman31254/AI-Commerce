"use client";

import { useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { VoiceState, VoiceResult } from "./useVoiceAssistant";
import { useLanguage } from "@/context/LanguageContext";

interface VoiceModalProps {
  isOpen: boolean;
  state: VoiceState;
  result: VoiceResult | null;
  error: string;
  onStop: () => void;
  onClose: () => void;
}

const STATE_LABELS: Record<VoiceState, string> = {
  idle: "Ready",
  recording: "Listening…",
  processing: "Processing…",
  responding: "Responding…",
  done: "Done",
  error: "Error",
};

function Waveform({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 5, 3, 6, 9, 6, 3, 5, 8, 5, 3];
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${active ? "bg-teal-500" : "bg-gray-300"}`}
          style={{
            height: active ? `${h * 4}px` : "4px",
            animation: active ? `wave 0.8s ease-in-out ${i * 0.06}s infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
    </div>
  );
}

export default function VoiceModal({ isOpen, state, result, error, onStop, onClose }: VoiceModalProps) {
  const { t } = useLanguage();

  // Auto-close 2 s after done
  useEffect(() => {
    if (state === "done") {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  const isRecording = state === "recording";
  const isProcessing = state === "processing" || state === "responding";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="text-center">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("voice_assistant")}</h2>
      <p className="text-xs text-gray-400 mb-6">{t("voice_subtitle")}</p>

      {/* Waveform */}
      <div className="my-4">
        <Waveform active={isRecording} />
      </div>

      {/* Status */}
      <p className={`text-sm font-medium mb-4 ${state === "error" ? "text-red-500" : "text-teal-600"}`}>
        {error || STATE_LABELS[state]}
      </p>

      {/* Transcript */}
      {result?.transcript && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 mb-3 text-right" dir="auto">
          <span className="text-xs text-gray-400 block mb-1 text-start">You said:</span>
          {result.transcript}
        </div>
      )}

      {/* AI Reply */}
      {result?.reply && (
        <div className="bg-teal-50 border border-teal-100 rounded-lg px-4 py-3 text-sm text-teal-800 mb-4 text-right" dir="auto">
          <span className="text-xs text-teal-500 block mb-1 text-start">AI response:</span>
          {result.reply}
        </div>
      )}

      {/* Action button */}
      <div className="flex gap-3 justify-center mt-2">
        {isRecording && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <span className="w-2 h-2 bg-white rounded-sm inline-block" />
            Stop
          </button>
        )}
        {(state === "done" || state === "error" || state === "idle") && (
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            {STATE_LABELS[state]}
          </div>
        )}
      </div>
    </Modal>
  );
}
