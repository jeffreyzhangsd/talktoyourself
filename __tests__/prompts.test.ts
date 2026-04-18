import { describe, it, expect } from "vitest";
import { PROMPTS, randomPrompt } from "@/lib/prompts";

describe("randomPrompt", () => {
  it("returns a prompt from the list", () => {
    const p = randomPrompt();
    expect(PROMPTS).toContain(p);
  });

  it("never returns the current prompt", () => {
    const current = PROMPTS[0];
    for (let i = 0; i < 50; i++) {
      expect(randomPrompt(current)).not.toBe(current);
    }
  });

  it("PROMPTS has at least 10 entries", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(10);
  });
});
