# talktoyourself — Design Spec

**Date:** 2026-04-17
**Stack:** Next.js (App Router) → Vercel
**Auth:** None (local/session only). Future: auth + DB for persisting recordings.

---

## Overview

A web app that helps users improve their speaking skills by recording ~1-minute sessions. Users speak freely or on a random prompt. After recording, they get playback + basic stats (duration, filler word count). Recordings persist for the browser session only and can be downloaded individually or in bulk.

---

## Architecture

- **Framework:** Next.js App Router
- **Deployment:** Vercel
- **Storage:** `sessionStorage` — blob URLs + metadata. Cleared on tab close. No server, no DB.
- **Speech analysis:** Web Speech API (browser-native, free). Runs live during recording to count filler words.
- **Multi-download:** JSZip for bundling multiple recordings into a single `.zip`.
- **Future:** Drop in Supabase + NextAuth when auth/persistence is needed. No structural changes required.

---

## Pages

### `/` — Main page (single page app)

All functionality lives here. No other routes needed.

---

## Components

### `PromptBanner`

- Displays a random prompt from a hardcoded list on load
- "↻ new prompt" button shuffles to another
- User can ignore the prompt and speak freely

### `CameraPreview`

- Optional webcam feed using `getUserMedia`
- Toggle button to show/hide
- Hidden by default — user opts in
- No camera recording, display only (helps user watch themselves)

### `RecordingControls`

- Mic button to start/stop
- Countdown timer: counts up to 1:00, auto-stops at 1:00
- Progress bar showing time elapsed / 1:00
- State: idle → recording → stopped
- Web Speech API starts with recording, collects transcript + filler counts in background

### `SessionHistory`

- One chip per recording in the session: `Apr 17 · 0:58`
- Multi-select checkboxes
- "Download Selected" button — single file if one selected, `.zip` if multiple
- "Play Last" shortcut button

### `PlaybackModal`

- Opens on clicking a chip or "Play Last"
- Plays the audio recording
- Shows stats:
  - Duration
  - Filler word count (um, uh, like, you know, basically, literally)
  - Small caveat: "Web Speech API accuracy varies"

### `TipsModal`

- Floating panel (not full-screen overlay) so it can sit beside the recording view
- Opens via "💡 Tips" button in header
- Dismissable, reopenable anytime including mid-recording
- Content: ~10 tips (see below)

---

## Data Model (sessionStorage)

```ts
type Recording = {
  id: string; // uuid
  timestamp: number; // unix ms
  duration: number; // seconds
  blobUrl: string; // object URL for playback/download
  fillerCount: number; // total filler words detected
  transcript: string; // raw transcript text
};
```

Stored as `sessionStorage.setItem('recordings', JSON.stringify(Recording[]))`.

---

## Tips Content

1. Silence is confident — pauses are fine, don't fill them
2. Pencil-in-mouth drill: hold a pencil horizontally between your teeth while practicing to force enunciation
3. Slow down — nervous speakers rush; aim for deliberate pacing
4. Don't reach for "um/uh" — if you need a moment, just stop
5. Look at the camera, not at yourself on screen
6. Take a breath before you start speaking
7. Finish your sentences — don't trail off
8. Enunciate the last word of each sentence (people drop off at the end)
9. Volume up — mumbling collapses into monotone
10. Daily reps beat long sessions — 60 seconds a day compounds

---

## Prompts (initial set)

~20 random prompts covering low-stakes topics:

- "Describe your ideal morning routine"
- "What's a skill you want to learn and why?"
- "Explain what you do for work as if talking to a 10-year-old"
- "What's the best meal you've ever had?"
- "Describe a place you'd love to visit"
- "What's a book, movie, or show you'd recommend to anyone?"
- "If you could have one superpower, what and why?"
- "Talk about something you changed your mind about recently"
- "Describe your hometown to someone who's never been there"
- "What does a perfect weekend look like for you?"
- "What's something most people don't know about you?"
- "Talk about a challenge you overcame"
- "What advice would you give your younger self?"
- "Describe your favorite hobby"
- "What would you do with an extra hour each day?"
- "Talk about someone who influenced you"
- "What's something you find genuinely interesting that others might find boring?"
- "Describe a recent win, big or small"
- "What's a habit you're proud of building?"
- "Talk about what you're looking forward to this year"

---

## Out of Scope (v1)

- User accounts / authentication
- Cloud storage of recordings
- Video recording (camera is display-only)
- Waveform visualization
- AI-powered feedback or full transcripts
- Mobile app
