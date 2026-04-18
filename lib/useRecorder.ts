"use client";

import { useState, useRef, useCallback } from "react";
import type { Recording } from "./types";
import { countFillers } from "./fillerWords";
import { saveRecording } from "./storage";

// Minimal types for Web Speech API (not yet in all TS DOM lib versions)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

export type RecorderState = "idle" | "recording" | "stopped";

export type UseRecorderReturn = {
  state: RecorderState;
  elapsed: number;
  start: () => Promise<void>;
  stop: () => void;
  lastRecording: Recording | null;
};

const MAX_DURATION = 60;

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [lastRecording, setLastRecording] = useState<Recording | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      transcriptRef.current = "";
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const blobUrl = URL.createObjectURL(blob);
        const recording: Recording = {
          id: crypto.randomUUID(),
          timestamp: startTimeRef.current,
          duration,
          blobUrl,
          fillerCount: countFillers(transcriptRef.current),
          transcript: transcriptRef.current,
        };
        saveRecording(recording);
        setLastRecording(recording);
        setState("stopped");
        setElapsed(0);
        stream.getTracks().forEach((t) => t.stop());
      };

      // Web Speech API — optional, degrades gracefully if unavailable
      const SR =
        (
          window as unknown as {
            SpeechRecognition?: SpeechRecognitionConstructor;
            webkitSpeechRecognition?: SpeechRecognitionConstructor;
          }
        ).SpeechRecognition ??
        (
          window as unknown as {
            webkitSpeechRecognition?: SpeechRecognitionConstructor;
          }
        ).webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              text += event.results[i][0].transcript + " ";
            }
          }
          transcriptRef.current = text;
        };
        try {
          recognition.start();
        } catch {}
        recognitionRef.current = recognition;
      }

      mediaRecorder.start();
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      throw err;
    }

    setState("recording");

    let secs = 0;
    timerRef.current = setInterval(() => {
      secs++;
      setElapsed(secs);
      if (secs >= MAX_DURATION) stop();
    }, 1000);
  }, [stop]);

  return { state, elapsed, start, stop, lastRecording };
}
