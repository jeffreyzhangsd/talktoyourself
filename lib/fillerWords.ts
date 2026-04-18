const FILLERS = ["you know", "basically", "literally", "um", "uh", "like"];

export function countFillers(transcript: string): number {
  const lower = transcript.toLowerCase();
  return FILLERS.reduce((total, filler) => {
    const pattern = new RegExp(`\\b${filler.replace(/ /g, "\\s+")}\\b`, "g");
    return total + (lower.match(pattern)?.length ?? 0);
  }, 0);
}
