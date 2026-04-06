"use client";

import { useState, useRef, useCallback } from "react";
import { voiceApi } from "@/lib/api";

export type VoiceState = "idle" | "recording" | "processing" | "responding" | "done" | "error";

export interface VoiceResult {
  transcript: string;
  reply: string;
}

export function useVoiceAssistant() {
  const [state, setState] = useState<VoiceState>("idle");
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    setError("");
    setResult(null);
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
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        await processAudio(blob);
      };

      mediaRecorder.start();
    } catch {
      setState("error");
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setState("processing");
    }
  }, []);

  const processAudio = async (blob: Blob) => {
    setState("processing");
    try {
      const res = await voiceApi.sendCommand(blob);
      const { transcript, reply, audio_base64 } = res.data;

      setResult({ transcript, reply });
      setState("responding");

      // Play TTS audio
      if (audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${audio_base64}`);
        audioRef.current = audio;
        audio.onended = () => setState("done");
        audio.onerror = () => setState("done");
        await audio.play();
      } else {
        setState("done");
      }
    } catch {
      setState("error");
      setError("Failed to process your command. Please try again.");
    }
  };

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState("idle");
    setResult(null);
    setError("");
  }, []);

  return { state, result, error, startRecording, stopRecording, reset };
}
