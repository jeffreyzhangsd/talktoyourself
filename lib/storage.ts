import type { Recording } from "./types";

const KEY = "tty_recordings";

export function getRecordings(): Recording[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRecording(recording: Recording): void {
  const existing = getRecordings();
  sessionStorage.setItem(KEY, JSON.stringify([...existing, recording]));
}

export function clearRecordings(): void {
  sessionStorage.removeItem(KEY);
}
