import type { Recording } from "./types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function fileExt(recording: Recording): string {
  return recording.hasVideo ? "mp4" : "webm";
}

export function downloadSingle(recording: Recording): void {
  const a = document.createElement("a");
  a.href = recording.blobUrl;
  a.download = `talktoyourself-${formatDate(recording.timestamp)}-${recording.id.slice(0, 8)}.${fileExt(recording)}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadMultiple(recordings: Recording[]): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  await Promise.all(
    recordings.map(async (r) => {
      const blob = await fetch(r.blobUrl).then((res) => res.blob());
      zip.file(
        `talktoyourself-${formatDate(r.timestamp)}-${r.id.slice(0, 8)}.${fileExt(r)}`,
        blob,
      );
    }),
  );

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "talktoyourself-recordings.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
