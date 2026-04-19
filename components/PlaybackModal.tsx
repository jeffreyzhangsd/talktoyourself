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

        {recording.hasVideo ? (
          <video
            src={recording.blobUrl}
            controls
            className="w-full rounded-lg"
            style={{ colorScheme: "dark" }}
          />
        ) : (
          <audio
            src={recording.blobUrl}
            controls
            className="w-full"
            style={{ colorScheme: "dark" }}
          />
        )}

        <div className="bg-[#1a1a1a] rounded-lg p-3">
          <div className="text-xs text-[#555] mb-1">DURATION</div>
          <div className="text-xl font-bold text-white">
            {formatTime(recording.duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
