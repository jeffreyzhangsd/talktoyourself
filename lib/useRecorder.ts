"use client";

import { useState, useRef, useCallback } from "react";
import type { Recording } from "./types";
import { saveRecording } from "./storage";

export type RecorderState = "idle" | "recording" | "stopped";

export type UseRecorderReturn = {
  state: RecorderState;
  elapsed: number;
  start: () => Promise<void>;
  stop: () => void;
  lastRecording: Recording | null;
  canStop: boolean;
};

const MIN_DURATION = 60;
const MAX_DURATION = 120;

export function useRecorder(
  cameraStream: MediaStream | null,
): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [lastRecording, setLastRecording] = useState<Recording | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    audioStreamRef.current = audioStream;

    try {
      const hasVideo =
        cameraStream !== null && cameraStream.getVideoTracks().length > 0;

      const recordStream = hasVideo
        ? new MediaStream([
            ...audioStream.getAudioTracks(),
            ...cameraStream!.getVideoTracks(),
          ])
        : audioStream;

      const preferredMime = hasVideo
        ? MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : "video/webm"
        : "audio/webm";

      const recorderOpts = MediaRecorder.isTypeSupported(preferredMime)
        ? { mimeType: preferredMime }
        : undefined;

      const mediaRecorder = new MediaRecorder(recordStream, recorderOpts);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const blobUrl = URL.createObjectURL(blob);
        const recording: Recording = {
          id: crypto.randomUUID(),
          timestamp: startTimeRef.current,
          duration,
          blobUrl,
          hasVideo,
        };
        saveRecording(recording);
        setLastRecording(recording);
        setState("stopped");
        setElapsed(0);
        audioStream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      audioStream.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
      throw err;
    }

    setState("recording");

    let secs = 0;
    timerRef.current = setInterval(() => {
      secs++;
      setElapsed(secs);
      if (secs >= MAX_DURATION) stop();
    }, 1000);
  }, [stop, cameraStream]);

  const canStop = elapsed >= MIN_DURATION;

  return { state, elapsed, start, stop, lastRecording, canStop };
}
