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
