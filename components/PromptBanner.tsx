"use client";

import { useState, useEffect } from "react";
import { randomPrompt } from "@/lib/prompts";

export default function PromptBanner() {
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(randomPrompt());
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 bg-[#1a1a1a] border-l-4 border-[#7c6fcd] rounded-r-lg px-4 py-3">
      <p className="text-sm text-[#bbb] italic flex-1">
        {prompt ? (
          <>&ldquo;{prompt}&rdquo;</>
        ) : (
          <span className="opacity-0">…</span>
        )}
      </p>
      <button
        onClick={() => setPrompt((prev) => randomPrompt(prev ?? undefined))}
        className="text-[#7c6fcd] text-lg leading-none hover:opacity-70 transition-opacity flex-shrink-0"
        aria-label="New prompt"
        title="New prompt"
      >
        ↻
      </button>
    </div>
  );
}
