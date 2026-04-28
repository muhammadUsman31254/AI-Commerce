"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import api from "@/lib/api";

// ── Steps definition (voice only — email & password are manual) ──────────────
const STEPS = [
  {
    field: "name",
    label: "Full Name",
    questionUrdu: "اپنا پورا نام بتائیں",
    questionRoman: "Apna poora naam batain",
    placeholder: "e.g. Ahmed Khan",
  },
  {
    field: "store_name",
    label: "Store Name",
    questionUrdu: "اپنے سٹور کا نام بتائیں",
    questionRoman: "Apne store ka naam batain",
    placeholder: "e.g. Clay & Craft",
  },
  {
    field: "phone",
    label: "Phone Number",
    questionUrdu: "اپنا فون نمبر بتائیں",
    questionRoman: "Apna phone number batain",
    placeholder: "e.g. 03001234567",
  },
] as const;

type FieldKey = (typeof STEPS)[number]["field"];
type RecordState = "idle" | "recording" | "processing";

let currentAudio: HTMLAudioElement | null = null;

async function speak(text: string) {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/voice-register/speak`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    if (!res.ok) return;
    const { audio_base64 } = await res.json();
    const audio = new Audio(`data:audio/mp3;base64,${audio_base64}`);
    currentAudio = audio;
    audio.play().catch(() => {});
  } catch {
    // silently ignore if TTS fails
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function VoiceRegister({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();

  const [stepIdx, setStepIdx] = useState(0);
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    name: "", store_name: "", phone: "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const step = STEPS[stepIdx];
  const isLastVoiceStep = stepIdx === STEPS.length - 1;
  const isPasswordStep = stepIdx === STEPS.length; // after all voice steps

  // ── Auto-speak question whenever step changes (including on mount) ─────────
  useEffect(() => {
    if (!isPasswordStep && step) {
      // Small delay so the UI has rendered before speaking
      const t = setTimeout(() => speak(step.questionUrdu), 500);
      return () => clearTimeout(t);
    }
  }, [stepIdx]);

  const speakQuestion = useCallback(() => {
    if (step) speak(step.questionUrdu);
  }, [step]);

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (recordState !== "idle") return;
    setError("");
    setTranscript("");
    setRecordState("recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm", "audio/ogg", "audio/mp4", ""].find(
        (t) => t === "" || MediaRecorder.isTypeSupported(t)
      ) ?? "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecordState("processing");
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
        const form = new FormData();
        form.append("audio", blob, `voice.${ext}`);

        try {
          const res = await api.post("/voice-register/transcribe", form, {
            headers: { "Content-Type": undefined as any },
          });
          setTranscript(res.data.transcript ?? "");
        } catch {
          setError("Could not transcribe. Please try again.");
        } finally {
          setRecordState("idle");
        }
      };

      recorder.start();
    } catch {
      setError("Microphone access denied.");
      setRecordState("idle");
    }
  }, [recordState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Confirm transcribed value ──────────────────────────────────────────────
  const confirmTranscript = () => {
    if (!transcript.trim()) { setError("Please record your answer first."); return; }
    setFields((prev) => ({ ...prev, [step.field]: transcript.trim() }));
    setTranscript("");
    setError("");
    setStepIdx((i) => i + 1);
  };

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await authApi.register({ ...fields, email: email.trim(), password });
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[...STEPS, { field: "password" }].map((s, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < stepIdx ? "w-6 bg-teal-500" :
              i === stepIdx ? "w-8 bg-teal-600" :
              "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* ── Voice step ── */}
      {!isPasswordStep && step && (
        <div className="space-y-5">
          {/* Question card */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 text-center">
            <p className="text-xs text-teal-500 font-medium uppercase tracking-wider mb-1">Step {stepIdx + 1} of {STEPS.length}</p>
            <p className="text-2xl font-bold text-gray-800 mb-1" dir="rtl">{step.questionUrdu}</p>
            <p className="text-sm text-teal-600 italic">{step.questionRoman}</p>
          </div>

          {/* Speak button */}
          <button
            type="button"
            onClick={speakQuestion}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 3.75a.75.75 0 0 0-1.264-.546L4.703 7H3.167a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 2 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 0 0-1.06 1.061 5.5 5.5 0 0 1 0 7.778.75.75 0 0 0 1.06 1.06 7 7 0 0 0 0-9.899Z" />
              <path d="M13.829 7.172a.75.75 0 0 0-1.061 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 0 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
            </svg>
            Repeat question
          </button>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={recordState === "idle" ? startRecording : stopRecording}
              disabled={recordState === "processing"}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-lg transition-all duration-200 ${
                recordState === "recording"
                  ? "bg-red-500 scale-110"
                  : recordState === "processing"
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 hover:scale-105 active:scale-95"
              }`}
            >
              {recordState === "processing" ? (
                <span className="w-7 h-7 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
              ) : recordState === "recording" ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                  <span className="w-5 h-5 bg-white rounded-sm" />
                </>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                  <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                </svg>
              )}
            </button>
            <p className="text-xs text-gray-400">
              {recordState === "recording" ? "Recording… tap to stop" :
               recordState === "processing" ? "Transcribing…" :
               "Tap to speak"}
            </p>
          </div>

          {/* Transcript preview */}
          {transcript && (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Heard:</p>
              <p className="text-sm text-gray-800 font-medium" dir="auto">{transcript}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setTranscript(""); setError(""); }}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  Re-record
                </button>
                <button
                  type="button"
                  onClick={confirmTranscript}
                  className="flex-1 bg-teal-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-teal-700 transition-colors"
                >
                  Confirm ✓
                </button>
              </div>
            </div>
          )}

          {/* Collected fields so far */}
          {stepIdx > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
              {STEPS.slice(0, stepIdx).map((s) => (
                <div key={s.field} className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{s.label}</span>
                  <span className="text-gray-700 font-semibold">{fields[s.field]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Password step ── */}
      {isPasswordStep && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Summary of collected fields */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 space-y-2">
            <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-2">Collected via voice</p>
            {STEPS.map((s) => (
              <div key={s.field} className="flex justify-between text-sm">
                <span className="text-gray-500">{s.label}</span>
                <span className="text-gray-800 font-medium">{fields[s.field]}</span>
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-gray-400 font-normal">(enter manually)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seller@example.com"
              required
              className="input w-full"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-gray-400 font-normal">(enter manually)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
              className="input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
            ) : "Create Account"}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      {/* Cancel */}
      <button
        type="button"
        onClick={() => { if (currentAudio) { currentAudio.pause(); currentAudio = null; } onCancel(); }}
        className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
      >
        Switch to manual registration
      </button>
    </div>
  );
}
