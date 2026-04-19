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

      {recordings.length === 0 ? (
        <p className="text-xs text-[#3a3a3a] italic">No recordings yet.</p>
      ) : (
        <p className="text-xs text-[#3a3a3a] italic">
          Download to keep — recordings are lost on refresh.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {recordings.map((r) => {
          const isSelected = selected.has(r.id);
          return (
            <div
              key={r.id}
              className={`flex items-center rounded-md text-xs border transition ${
                isSelected
                  ? "border-[#7c6fcd] text-[#c0b8f0] bg-[#1a1830]"
                  : "border-[#2a2a2a] text-[#888] bg-[#1e1e1e]"
              }`}
            >
              <button
                onClick={() => toggleSelect(r.id)}
                className="px-2 py-1.5 hover:opacity-70 transition-opacity"
                aria-label={isSelected ? "Deselect" : "Select"}
              >
                {isSelected ? "☑" : "☐"}
              </button>
              <button
                onClick={() => onPlay(r)}
                className={`px-3 py-1.5 border-l transition hover:opacity-70 ${
                  isSelected ? "border-[#7c6fcd]" : "border-[#2a2a2a]"
                }`}
              >
                {formatChipDate(r.timestamp)} · {formatTime(r.duration)}
                {r.hasVideo && <span className="ml-1 opacity-60">🎥</span>}
              </button>
            </div>
          );
        })}
      </div>

      {recordings.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={() => onPlay(latest)}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-[#7c6fcd] text-white hover:bg-[#6a5ec0] transition"
          >
            ▶ Play Last
          </button>
          <button
            onClick={handleDownload}
            disabled={selected.size === 0}
            className="w-full py-2 rounded-lg text-xs font-semibold border border-[#2a2a2a] bg-[#1a1a1a] text-[#888] hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ⬇ Download ({selected.size})
          </button>
        </div>
      )}
    </div>
  );
}
