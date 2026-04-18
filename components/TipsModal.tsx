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
