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
