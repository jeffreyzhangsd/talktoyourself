# talktoyourself Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app where users record ~1-minute speaking sessions, get filler word stats, and download recordings — all client-side with no backend.

**Architecture:** Single-page Next.js App Router app. All state lives in React (sessionStorage for persistence across renders). MediaRecorder captures audio; Web Speech API runs in parallel for filler word counting. No server routes needed.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Vitest, JSZip (dynamic import for multi-download)

---

## File Map

| File                               | Responsibility                               |
| ---------------------------------- | -------------------------------------------- |
| `app/layout.tsx`                   | Root layout, metadata, font                  |
| `app/page.tsx`                     | Page composition, top-level state            |
| `app/globals.css`                  | Tailwind base + dark theme CSS vars          |
| `lib/types.ts`                     | `Recording` type                             |
| `lib/prompts.ts`                   | Prompts array + `randomPrompt()`             |
| `lib/tips.ts`                      | Tips array                                   |
| `lib/fillerWords.ts`               | `countFillers(transcript)`                   |
| `lib/storage.ts`                   | sessionStorage read/write helpers            |
| `lib/useRecorder.ts`               | Hook: MediaRecorder + Web Speech API + timer |
| `lib/download.ts`                  | Single download + JSZip multi-download       |
| `components/PromptBanner.tsx`      | Random prompt display + shuffle button       |
| `components/CameraPreview.tsx`     | Optional webcam feed, toggle to show/hide    |
| `components/RecordingControls.tsx` | Mic button, timer, progress bar              |
| `components/SessionHistory.tsx`    | Session chips, multi-select, download button |
| `components/PlaybackModal.tsx`     | Playback + stats (duration, filler count)    |
| `components/TipsModal.tsx`         | Floating tips panel                          |
| `__tests__/fillerWords.test.ts`    | Unit tests for filler counter                |
| `__tests__/storage.test.ts`        | Unit tests for storage helpers               |
| `__tests__/prompts.test.ts`        | Unit tests for randomPrompt                  |

---

## Task 1: Scaffold Next.js project

**Files:**

- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`

- [ ] **Step 1: Create Next.js app**

Run from `/Users/jeffreyzhang/Desktop/Projects.nosync/`:

```bash
npx create-next-app@latest talktoyourself \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-eslint
cd talktoyourself
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install jszip
npm install -D vitest @vitest/coverage-v8 jsdom @types/jszip
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Delete boilerplate**

```bash
rm -rf app/page.tsx app/globals.css public/next.svg public/vercel.svg
```

- [ ] **Step 6: Verify Next.js starts**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000` (404 is fine — page.tsx was deleted)

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project"
```

---

## Task 2: Types and data

**Files:**

- Create: `lib/types.ts`, `lib/prompts.ts`, `lib/tips.ts`

- [ ] **Step 1: Create types**

Create `lib/types.ts`:

```ts
export type Recording = {
  id: string;
  timestamp: number;
  duration: number;
  blobUrl: string;
  fillerCount: number;
  transcript: string;
};
```

- [ ] **Step 2: Create prompts**

Create `lib/prompts.ts`:

```ts
export const PROMPTS = [
  "Describe your ideal morning routine",
  "What's a skill you want to learn and why?",
  "Explain what you do for work as if talking to a 10-year-old",
  "What's the best meal you've ever had?",
  "Describe a place you'd love to visit",
  "What's a book, movie, or show you'd recommend to anyone?",
  "If you could have one superpower, what and why?",
  "Talk about something you changed your mind about recently",
  "Describe your hometown to someone who's never been there",
  "What does a perfect weekend look like for you?",
  "What's something most people don't know about you?",
  "Talk about a challenge you overcame",
  "What advice would you give your younger self?",
  "Describe your favorite hobby",
  "What would you do with an extra hour each day?",
  "Talk about someone who influenced you",
  "What's something you find genuinely interesting that others might find boring?",
  "Describe a recent win, big or small",
  "What's a habit you're proud of building?",
  "Talk about what you're looking forward to this year",
];

export function randomPrompt(current?: string): string {
  const pool = current ? PROMPTS.filter((p) => p !== current) : PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- [ ] **Step 3: Create tips**

Create `lib/tips.ts`:

```ts
export type Tip = { title: string; body: string };

export const TIPS: Tip[] = [
  {
    title: "Silence is confident",
    body: "Pauses are not awkward — they signal control. Don't fill them.",
  },
  {
    title: "Pencil-in-mouth drill",
    body: "Hold a pencil horizontally between your teeth while practicing. It forces your mouth to over-enunciate, training muscle memory.",
  },
  {
    title: "Slow down",
    body: "Nervous speakers rush. Aim for deliberate, measured pacing — slower than feels natural.",
  },
  {
    title: "Don't reach for filler words",
    body: 'If you need a moment to think, just stop. A beat of silence beats "um" every time.',
  },
  {
    title: "Look at the camera",
    body: "Watch the lens, not your own face on screen. That's what eye contact feels like to your listener.",
  },
  {
    title: "Breathe before you start",
    body: "Take one deliberate breath before speaking. It slows your pace from the first word.",
  },
  {
    title: "Finish your sentences",
    body: "Don't trail off mid-thought. Commit to the end of each sentence before moving on.",
  },
  {
    title: "Enunciate the last word",
    body: "People drop volume and clarity at the end of sentences. Consciously enunciate the final word.",
  },
  {
    title: "Volume up",
    body: "Mumbling and monotone go together. Speak louder than feels comfortable — it adds energy.",
  },
  {
    title: "Daily reps beat long sessions",
    body: "60 seconds every day compounds faster than an hour once a week. Show up consistently.",
  },
];
```

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add types, prompts, and tips data"
```

---

## Task 3: Filler word counter + tests (TDD)

**Files:**

- Create: `lib/fillerWords.ts`, `__tests__/fillerWords.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/fillerWords.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { countFillers } from "@/lib/fillerWords";

describe("countFillers", () => {
  it('counts "um" occurrences', () => {
    expect(countFillers("um I think um yes")).toBe(2);
  });

  it('counts "uh" occurrences', () => {
    expect(countFillers("uh well uh I guess")).toBe(2);
  });

  it('counts "like" as whole word only', () => {
    expect(countFillers("I like likely like")).toBe(2);
  });

  it('counts "you know" as a phrase', () => {
    expect(countFillers("you know what I mean you know")).toBe(2);
  });

  it('counts "basically" occurrences', () => {
    expect(countFillers("basically it is basically done")).toBe(2);
  });

  it('counts "literally" occurrences', () => {
    expect(countFillers("it was literally literally amazing")).toBe(2);
  });

  it("is case insensitive", () => {
    expect(countFillers("UM UH Like")).toBe(3);
  });

  it("returns 0 for clean speech", () => {
    expect(countFillers("I went to the store and bought groceries")).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(countFillers("")).toBe(0);
  });

  it("counts multiple filler types together", () => {
    expect(countFillers("um like uh you know basically literally")).toBe(6);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/lib/fillerWords'`

- [ ] **Step 3: Implement countFillers**

Create `lib/fillerWords.ts`:

```ts
const FILLERS = ["you know", "basically", "literally", "um", "uh", "like"];

export function countFillers(transcript: string): number {
  const lower = transcript.toLowerCase();
  return FILLERS.reduce((total, filler) => {
    const pattern = new RegExp(`\\b${filler.replace(" ", "\\s+")}\\b`, "g");
    return total + (lower.match(pattern)?.length ?? 0);
  }, 0);
}
```

Note: multi-word fillers ("you know") must be listed before single-word ones to avoid double-counting edge cases.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 10 PASS

- [ ] **Step 5: Commit**

```bash
git add lib/fillerWords.ts __tests__/fillerWords.test.ts
git commit -m "feat: add filler word counter with tests"
```

---

## Task 4: Storage helpers + tests (TDD)

**Files:**

- Create: `lib/storage.ts`, `__tests__/storage.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { getRecordings, saveRecording, clearRecordings } from "@/lib/storage";
import type { Recording } from "@/lib/types";

const makeRecording = (id: string): Recording => ({
  id,
  timestamp: 1000,
  duration: 45,
  blobUrl: `blob:${id}`,
  fillerCount: 3,
  transcript: "test transcript",
});

describe("storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns empty array when no recordings saved", () => {
    expect(getRecordings()).toEqual([]);
  });

  it("saves and retrieves a recording", () => {
    const r = makeRecording("abc");
    saveRecording(r);
    expect(getRecordings()).toEqual([r]);
  });

  it("appends to existing recordings", () => {
    saveRecording(makeRecording("a"));
    saveRecording(makeRecording("b"));
    expect(getRecordings()).toHaveLength(2);
  });

  it("clears all recordings", () => {
    saveRecording(makeRecording("a"));
    clearRecordings();
    expect(getRecordings()).toEqual([]);
  });

  it("returns empty array when sessionStorage has malformed data", () => {
    sessionStorage.setItem("tty_recordings", "not-json");
    expect(getRecordings()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/lib/storage'`

- [ ] **Step 3: Implement storage helpers**

Create `lib/storage.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 5 PASS

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts __tests__/storage.test.ts
git commit -m "feat: add sessionStorage helpers with tests"
```

---

## Task 5: Prompts tests

**Files:**

- Create: `__tests__/prompts.test.ts`

- [ ] **Step 1: Write tests**

Create `__tests__/prompts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PROMPTS, randomPrompt } from "@/lib/prompts";

describe("randomPrompt", () => {
  it("returns a prompt from the list", () => {
    const p = randomPrompt();
    expect(PROMPTS).toContain(p);
  });

  it("never returns the current prompt", () => {
    const current = PROMPTS[0];
    for (let i = 0; i < 50; i++) {
      expect(randomPrompt(current)).not.toBe(current);
    }
  });

  it("PROMPTS has at least 10 entries", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: 3 PASS (lib/prompts.ts already exists from Task 2)

- [ ] **Step 3: Commit**

```bash
git add __tests__/prompts.test.ts
git commit -m "test: add prompts tests"
```

---

## Task 6: useRecorder hook

**Files:**

- Create: `lib/useRecorder.ts`

Note: this hook uses browser APIs (MediaRecorder, SpeechRecognition) — not unit testable without heavy mocking. Manual testing in Task 13.

- [ ] **Step 1: Create the hook**

Create `lib/useRecorder.ts`:

```ts
"use client";

import { useState, useRef, useCallback } from "react";
import type { Recording } from "./types";
import { countFillers } from "./fillerWords";
import { saveRecording } from "./storage";

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: typeof SpeechRecognition;
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/useRecorder.ts
git commit -m "feat: add useRecorder hook with Web Speech API"
```

---

## Task 7: Download utilities

**Files:**

- Create: `lib/download.ts`

- [ ] **Step 1: Create download helpers**

Create `lib/download.ts`:

```ts
import type { Recording } from "./types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

export function downloadSingle(recording: Recording): void {
  const a = document.createElement("a");
  a.href = recording.blobUrl;
  a.download = `talktoyourself-${formatDate(recording.timestamp)}-${recording.id.slice(0, 8)}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadMultiple(recordings: Recording[]): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  await Promise.all(
    recordings.map(async (r) => {
      const blob = await fetch(r.blobUrl).then((res) => res.blob());
      zip.file(
        `talktoyourself-${formatDate(r.timestamp)}-${r.id.slice(0, 8)}.webm`,
        blob,
      );
    }),
  );

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "talktoyourself-recordings.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/download.ts
git commit -m "feat: add download utilities (single + JSZip multi)"
```

---

## Task 8: PromptBanner component

**Files:**

- Create: `components/PromptBanner.tsx`

- [ ] **Step 1: Create component**

Create `components/PromptBanner.tsx`:

```tsx
"use client";

import { useState } from "react";
import { randomPrompt } from "@/lib/prompts";

export default function PromptBanner() {
  const [prompt, setPrompt] = useState(() => randomPrompt());

  return (
    <div className="flex items-center justify-between gap-3 bg-[#1a1a1a] border-l-4 border-[#7c6fcd] rounded-r-lg px-4 py-3">
      <p className="text-sm text-[#bbb] italic flex-1">
        &ldquo;{prompt}&rdquo;
      </p>
      <button
        onClick={() => setPrompt((prev) => randomPrompt(prev))}
        className="text-[#7c6fcd] text-lg leading-none hover:opacity-70 transition-opacity flex-shrink-0"
        aria-label="New prompt"
        title="New prompt"
      >
        ↻
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PromptBanner.tsx
git commit -m "feat: add PromptBanner component"
```

---

## Task 9: CameraPreview component

**Files:**

- Create: `components/CameraPreview.tsx`

- [ ] **Step 1: Create component**

Create `components/CameraPreview.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";

export default function CameraPreview() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setError(false);
      })
      .catch(() => {
        setEnabled(false);
        setError(true);
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 bg-[#111] border border-[#1e1e1e] rounded-xl w-48 flex-shrink-0">
        {error && (
          <p className="text-xs text-red-400 px-3 text-center">
            Camera unavailable
          </p>
        )}
        <button
          onClick={() => setEnabled(true)}
          className="text-xs text-[#555] hover:text-[#888] transition-colors py-6 px-4"
        >
          📷 Enable camera
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0 w-48 rounded-xl overflow-hidden border border-[#1e1e1e] bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <button
        onClick={() => setEnabled(false)}
        className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition"
      >
        ✕
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CameraPreview.tsx
git commit -m "feat: add CameraPreview component"
```

---

## Task 10: RecordingControls component

**Files:**

- Create: `components/RecordingControls.tsx`

- [ ] **Step 1: Create component**

Create `components/RecordingControls.tsx`:

```tsx
import type { RecorderState } from "@/lib/useRecorder";

type Props = {
  state: RecorderState;
  elapsed: number;
  onStart: () => Promise<void>;
  onStop: () => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function RecordingControls({
  state,
  elapsed,
  onStart,
  onStop,
}: Props) {
  const progress = Math.min((elapsed / 60) * 100, 100);
  const isRecording = state === "recording";

  return (
    <div className="flex-1 flex flex-col justify-center gap-4 bg-[#111] border border-[#1e1e1e] rounded-xl px-5 py-5">
      <div>
        <div className="text-4xl font-bold text-white tabular-nums">
          {formatTime(elapsed)}
        </div>
        <div className="text-xs text-[#555] tracking-widest mt-1">
          {isRecording
            ? "RECORDING · 1:00 MAX"
            : state === "stopped"
              ? "DONE"
              : "READY"}
        </div>
      </div>

      <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7c6fcd] rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isRecording ? (
        <button
          onClick={onStop}
          className="bg-[#1e1e1e] text-[#e05c5c] border border-[#e05c5c] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#2a1a1a] transition"
        >
          ■ Stop Recording
        </button>
      ) : (
        <button
          onClick={onStart}
          className="bg-[#e05c5c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c04a4a] transition"
        >
          ● Start Recording
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/RecordingControls.tsx
git commit -m "feat: add RecordingControls component"
```

---

## Task 11: PlaybackModal component

**Files:**

- Create: `components/PlaybackModal.tsx`

- [ ] **Step 1: Create component**

Create `components/PlaybackModal.tsx`:

```tsx
import type { Recording } from "@/lib/types";

type Props = {
  recording: Recording;
  onClose: () => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlaybackModal({ recording, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-[#555] tracking-widest mb-1">
              RECORDING
            </div>
            <div className="text-sm text-[#888]">
              {formatDate(recording.timestamp)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-white text-lg leading-none transition"
          >
            ✕
          </button>
        </div>

        <audio
          src={recording.blobUrl}
          controls
          className="w-full"
          style={{ colorScheme: "dark" }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3">
            <div className="text-xs text-[#555] mb-1">DURATION</div>
            <div className="text-xl font-bold text-white">
              {formatTime(recording.duration)}
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3">
            <div className="text-xs text-[#555] mb-1">FILLER WORDS</div>
            <div className="text-xl font-bold text-white">
              {recording.fillerCount}
            </div>
          </div>
        </div>

        {recording.fillerCount > 0 && (
          <p className="text-xs text-[#555] italic">
            * Filler word detection uses Web Speech API — accuracy may vary.
          </p>
        )}

        {recording.transcript && (
          <div className="bg-[#1a1a1a] rounded-lg p-3">
            <div className="text-xs text-[#555] mb-2">TRANSCRIPT</div>
            <p className="text-sm text-[#888] leading-relaxed">
              {recording.transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PlaybackModal.tsx
git commit -m "feat: add PlaybackModal component"
```

---

## Task 12: SessionHistory component

**Files:**

- Create: `components/SessionHistory.tsx`

- [ ] **Step 1: Create component**

Create `components/SessionHistory.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Recording } from "@/lib/types";
import { downloadSingle, downloadMultiple } from "@/lib/download";

type Props = {
  recordings: Recording[];
  onPlay: (recording: Recording) => void;
};

function formatChipDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SessionHistory({ recordings, onPlay }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (recordings.length === 0) return null;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDownload() {
    const targets = recordings.filter((r) => selected.has(r.id));
    if (targets.length === 0) return;
    if (targets.length === 1) {
      downloadSingle(targets[0]);
    } else {
      await downloadMultiple(targets);
    }
  }

  const latest = recordings[recordings.length - 1];

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-[#555] tracking-widest">THIS SESSION</div>

      <div className="flex flex-wrap gap-2">
        {recordings.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              toggleSelect(r.id);
              onPlay(r);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition ${
              selected.has(r.id)
                ? "border-[#7c6fcd] text-[#c0b8f0] bg-[#1a1830]"
                : "border-[#2a2a2a] text-[#888] bg-[#1e1e1e] hover:border-[#444]"
            }`}
          >
            <span>{selected.has(r.id) ? "☑" : "☐"}</span>
            <span>
              {formatChipDate(r.timestamp)} · {formatTime(r.duration)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={selected.size === 0}
          className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[#2a2a2a] bg-[#1a1a1a] text-[#888] hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ⬇ Download Selected ({selected.size})
        </button>
        <button
          onClick={() => onPlay(latest)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#7c6fcd] text-white hover:bg-[#6a5ec0] transition"
        >
          ▶ Play Last
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SessionHistory.tsx
git commit -m "feat: add SessionHistory component with multi-select download"
```

---

## Task 13: TipsModal component

**Files:**

- Create: `components/TipsModal.tsx`

- [ ] **Step 1: Create component**

Create `components/TipsModal.tsx`:

```tsx
import { TIPS } from "@/lib/tips";

type Props = {
  onClose: () => void;
};

export default function TipsModal({ onClose }: Props) {
  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-[80vh] overflow-y-auto bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col">
      <div className="flex justify-between items-center px-5 py-4 border-b border-[#1e1e1e] sticky top-0 bg-[#161616]">
        <h2 className="text-sm font-semibold text-white">Speaking Tips</h2>
        <button
          onClick={onClose}
          className="text-[#555] hover:text-white text-lg leading-none transition"
        >
          ✕
        </button>
      </div>
      <ol className="flex flex-col gap-0 px-5 py-4">
        {TIPS.map((tip, i) => (
          <li
            key={i}
            className="flex gap-3 py-3 border-b border-[#1e1e1e] last:border-0"
          >
            <span className="text-[#7c6fcd] font-bold text-sm flex-shrink-0 w-5">
              {i + 1}.
            </span>
            <div>
              <div className="text-sm font-medium text-white mb-0.5">
                {tip.title}
              </div>
              <div className="text-xs text-[#888] leading-relaxed">
                {tip.body}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TipsModal.tsx
git commit -m "feat: add TipsModal floating panel"
```

---

## Task 14: Page composition + global styles

**Files:**

- Create: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Create globals.css**

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

html {
  background: #0f0f0f;
}

audio::-webkit-media-controls-panel {
  background: #1e1e1e;
}
```

- [ ] **Step 2: Create layout.tsx**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "talktoyourself",
  description: "Improve your speaking — one minute at a time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create page.tsx**

Create `app/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import type { Recording } from "@/lib/types";
import { getRecordings } from "@/lib/storage";
import { useRecorder } from "@/lib/useRecorder";
import PromptBanner from "@/components/PromptBanner";
import CameraPreview from "@/components/CameraPreview";
import RecordingControls from "@/components/RecordingControls";
import SessionHistory from "@/components/SessionHistory";
import PlaybackModal from "@/components/PlaybackModal";
import TipsModal from "@/components/TipsModal";

export default function Home() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playback, setPlayback] = useState<Recording | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const { state, elapsed, start, stop, lastRecording } = useRecorder();

  useEffect(() => {
    setRecordings(getRecordings());
  }, []);

  useEffect(() => {
    if (lastRecording) {
      setRecordings(getRecordings());
      setPlayback(lastRecording);
    }
  }, [lastRecording]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#1e1e1e]">
        <h1 className="font-semibold tracking-[0.2em] text-sm uppercase text-white">
          talktoyourself
        </h1>
        <button
          onClick={() => setTipsOpen((prev) => !prev)}
          className="text-sm text-[#7c6fcd] hover:opacity-70 transition"
        >
          💡 Tips
        </button>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8 flex flex-col gap-6">
        <PromptBanner />

        <div className="flex gap-4 items-stretch">
          <CameraPreview />
          <RecordingControls
            state={state}
            elapsed={elapsed}
            onStart={start}
            onStop={stop}
          />
        </div>

        <SessionHistory recordings={recordings} onPlay={setPlayback} />
      </div>

      {playback && (
        <PlaybackModal recording={playback} onClose={() => setPlayback(null)} />
      )}

      {tipsOpen && <TipsModal onClose={() => setTipsOpen(false)} />}
    </main>
  );
}
```

- [ ] **Step 4: Run the app and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

- [ ] Dark background, header with "talktoyourself" and 💡 Tips button
- [ ] Prompt banner shows a random prompt, ↻ button shuffles it
- [ ] "Enable camera" placeholder visible on left
- [ ] Start Recording button visible
- [ ] Click Start Recording → browser asks for mic permission → timer counts up
- [ ] Timer auto-stops at 1:00
- [ ] After stopping, PlaybackModal opens with duration + filler count
- [ ] Recording chip appears in session history
- [ ] Tips modal opens floating top-right, can be open while recording
- [ ] Camera enable/disable works

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx
git commit -m "feat: compose main page, wire all components"
```

---

## Task 15: Deploy to Vercel

**Files:** none

- [ ] **Step 1: Create Vercel project**

```bash
npx vercel
```

Follow prompts: link to new project, default settings. Accept all defaults.

- [ ] **Step 2: Verify production build passes locally**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds

- [ ] **Step 3: Deploy to production**

```bash
npx vercel --prod
```

Expected: URL printed, app live

- [ ] **Step 4: Smoke test production URL**

Open the production URL and verify:

- [ ] App loads over HTTPS
- [ ] Mic permission works in production (required: HTTPS)
- [ ] Camera permission works
- [ ] Record a 10-second clip, play it back

- [ ] **Step 5: Commit any fixes, final commit**

```bash
git add .
git commit -m "chore: production verified on Vercel"
```
