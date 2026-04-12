"use client";

import { useState, useRef, useCallback } from "react";
import { useChatContext } from "@/context/ChatContext";
import { PendingProduct } from "@/context/ChatContext";
import { voiceApi } from "@/lib/api";

type RecordState = "idle" | "recording" | "processing";

export default function VoiceFAB() {
  const { pushMessages, isOpen, openImageUpload, triggerNavigation } = useChatContext();
  const [state, setState] = useState<RecordState>("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (state !== "idle") return;
    setState("recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm", "audio/ogg", "audio/mp4", ""].find(
        (t) => t === "" || MediaRecorder.isTypeSupported(t)
      ) ?? "";
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("processing");

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        try {
          const res = await voiceApi.sendCommand(blob);
          console.log("[Voice] response data:", res.data);
          const { transcript, reply, action, pending, route, audio_base64 } = res.data;

          pushMessages([
            { id: `v-u-${Date.now()}`, role: "user", content: `🎤 ${transcript}` },
            { id: `v-a-${Date.now()}`, role: "assistant", content: reply },
          ]);

          // Play TTS audio — ElevenLabs if available, browser speech synthesis as fallback
          if (audio_base64) {
            const audio = new Audio(`data:audio/mp3;base64,${audio_base64}`);
            audio.play().catch(() => {});
          } else if (reply && typeof window !== "undefined" && "speechSynthesis" in window) {
            const utt = new SpeechSynthesisUtterance(reply);
            utt.lang = "ur-PK";
            utt.rate = 0.9;
            window.speechSynthesis.speak(utt);
          }

          if (action === "upload_image" && pending) {
            openImageUpload(pending as PendingProduct);
          } else if (action === "navigate" && route) {
            triggerNavigation(route as string);
          }
        } catch (err: any) {
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            "Unknown error";
          console.error("[Voice] error:", detail, err);
          pushMessages([
            {
              id: `v-err-${Date.now()}`,
              role: "assistant",
              content: `Voice command failed: ${detail}`,
            },
          ]);
        } finally {
          setState("idle");
        }
      };

      mediaRecorder.start();
    } catch {
      setState("idle");
    }
  }, [state, pushMessages]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleClick = () => {
    if (state === "idle") startRecording();
    else if (state === "recording") stopRecording();
  };

  const isActive = state !== "idle";

  return (
    <button
      onClick={handleClick}
      aria-label={state === "recording" ? "Stop recording" : "Start voice command"}
      title={state === "recording" ? "Tap to stop" : "Tap to speak"}
      className={`
        fixed bottom-6 z-40
        ${isOpen ? "end-[22rem]" : "end-6"}
        w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        text-white text-2xl
        transition-all duration-300
        ${state === "recording"
          ? "bg-red-500 hover:bg-red-600 scale-110"
          : state === "processing"
          ? "bg-teal-400 cursor-not-allowed scale-105"
          : "bg-teal-600 hover:bg-teal-700 hover:scale-105 active:scale-95"
        }
      `}
    >
      {state === "processing" ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : state === "recording" ? (
        <span className="w-4 h-4 bg-white rounded-sm" />
      ) : (
        "🎤"
      )}

      {/* Pulse ring while recording */}
      {state === "recording" && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
      )}
    </button>
  );
}
