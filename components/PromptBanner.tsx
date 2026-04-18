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
