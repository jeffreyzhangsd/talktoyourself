"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onStreamChange: (stream: MediaStream | null) => void;
  disabled?: boolean;
};

export default function CameraPreview({ onStreamChange, disabled }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      onStreamChange(null);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setError(false);
        onStreamChange(stream);
      })
      .catch(() => {
        setEnabled(false);
        setError(true);
        onStreamChange(null);
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 bg-[#111] border border-[#1e1e1e] rounded-xl w-48 flex-shrink-0">
        {error && (
          <p className="text-xs text-red-400 px-3 text-center">
            Camera unavailable
          </p>
        )}
        <button
          onClick={() => setEnabled(true)}
          disabled={disabled}
          className="text-xs text-[#555] py-6 px-4 disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#888] disabled:hover:text-[#555] transition-colors"
        >
          📷 Enable camera
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0 w-48 rounded-xl overflow-hidden border border-[#1e1e1e] bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <button
        onClick={() => setEnabled(false)}
        className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition"
      >
        ✕
      </button>
    </div>
  );
}
