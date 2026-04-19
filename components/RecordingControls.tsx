import type { RecorderState } from "@/lib/useRecorder";

type Props = {
  state: RecorderState;
  elapsed: number;
  canStop: boolean;
  onStart: () => Promise<void>;
  onStop: () => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const MIN_DURATION = 60;
const MAX_DURATION = 120;

export default function RecordingControls({
  state,
  elapsed,
  canStop,
  onStart,
  onStop,
}: Props) {
  const progress = Math.min((elapsed / MAX_DURATION) * 100, 100);
  const minProgress = (MIN_DURATION / MAX_DURATION) * 100;
  const isRecording = state === "recording";

  return (
    <div className="flex-1 flex flex-col justify-center gap-4 bg-[#111] border border-[#1e1e1e] rounded-xl px-5 py-5">
      <div>
        <div className="text-4xl font-bold text-white tabular-nums">
          {formatTime(elapsed)}
        </div>
        <div className="text-xs text-[#555] tracking-widest mt-1">
          {isRecording
            ? canStop
              ? "KEEP GOING!! STOP WHENEVER YOU FEEL LIKE IT"
              : "RECORDING · KEEP GOING!!"
            : state === "stopped"
              ? "DONE"
              : "READY"}
        </div>
      </div>

      <div className="relative h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7c6fcd] rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
        {/* 1 min minimum marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#444]"
          style={{ left: `${minProgress}%` }}
        />
      </div>

      {isRecording ? (
        <button
          onClick={canStop ? onStop : undefined}
          disabled={!canStop}
          className={`rounded-lg py-2.5 text-sm font-semibold border transition ${
            canStop
              ? "bg-[#1e1e1e] text-[#e05c5c] border-[#e05c5c] hover:bg-[#2a1a1a]"
              : "bg-[#1e1e1e] text-[#444] border-[#2a2a2a] cursor-not-allowed"
          }`}
        >
          {canStop
            ? "■ Stop Recording"
            : `■ Stop (at ${formatTime(MIN_DURATION)})`}
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
