"use client";

import { useState, useEffect } from "react";
import type { Recording } from "@/lib/types";
import { getRecordings, clearRecordings } from "@/lib/storage";
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
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const { state, elapsed, start, stop, lastRecording, canStop } =
    useRecorder(cameraStream);

  useEffect(() => {
    // Blob URLs are tied to the current document — they're invalid after any
    // page reload, so wipe storage on mount and start fresh every session.
    clearRecordings();
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

      <div className="grid grid-cols-[1fr_auto_1fr] gap-8 px-8 py-8 items-start">
        {/* Left — session history */}
        <div className="pt-1">
          <SessionHistory recordings={recordings} onPlay={setPlayback} />
        </div>

        {/* Center — recording */}
        <div className="flex flex-col gap-5 w-[440px]">
          <PromptBanner />
          <div className="flex gap-4 items-stretch">
            <CameraPreview
              onStreamChange={setCameraStream}
              disabled={state === "recording"}
            />
            <RecordingControls
              state={state}
              elapsed={elapsed}
              canStop={canStop}
              onStart={start}
              onStop={stop}
            />
          </div>
        </div>

        {/* Right — about */}
        <div className="pt-1">
          <p className="text-xs text-[#555] leading-relaxed">
            <span className="text-[#888] font-medium">talktoyourself</span>
            {
              " was designed to give you a place to practice speaking, whether it's for interviews, presentations, or just talking to others in general."
            }
          </p>
        </div>
      </div>

      {playback && (
        <PlaybackModal recording={playback} onClose={() => setPlayback(null)} />
      )}

      {tipsOpen && <TipsModal onClose={() => setTipsOpen(false)} />}
    </main>
  );
}
