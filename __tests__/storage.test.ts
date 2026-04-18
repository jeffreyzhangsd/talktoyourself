import { describe, it, expect, beforeEach } from "vitest";
import { getRecordings, saveRecording, clearRecordings } from "@/lib/storage";
import type { Recording } from "@/lib/types";

const makeRecording = (id: string): Recording => ({
  id,
  timestamp: 1000,
  duration: 45,
  blobUrl: `blob:${id}`,
  fillerCount: 3,
  transcript: "test transcript",
});

describe("storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns empty array when no recordings saved", () => {
    expect(getRecordings()).toEqual([]);
  });

  it("saves and retrieves a recording", () => {
    const r = makeRecording("abc");
    saveRecording(r);
    expect(getRecordings()).toEqual([r]);
  });

  it("appends to existing recordings", () => {
    saveRecording(makeRecording("a"));
    saveRecording(makeRecording("b"));
    expect(getRecordings()).toHaveLength(2);
  });

  it("clears all recordings", () => {
    saveRecording(makeRecording("a"));
    clearRecordings();
    expect(getRecordings()).toEqual([]);
  });

  it("returns empty array when sessionStorage has malformed data", () => {
    sessionStorage.setItem("tty_recordings", "not-json");
    expect(getRecordings()).toEqual([]);
  });
});
