import { describe, it, expect } from "vitest";
import { countFillers } from "@/lib/fillerWords";

describe("countFillers", () => {
  it('counts "um" occurrences', () => {
    expect(countFillers("um I think um yes")).toBe(2);
  });

  it('counts "uh" occurrences', () => {
    expect(countFillers("uh well uh I guess")).toBe(2);
  });

  it('counts "like" as whole word only', () => {
    expect(countFillers("I like likely like")).toBe(2);
  });

  it('counts "you know" as a phrase', () => {
    expect(countFillers("you know what I mean you know")).toBe(2);
  });

  it('counts "basically" occurrences', () => {
    expect(countFillers("basically it is basically done")).toBe(2);
  });

  it('counts "literally" occurrences', () => {
    expect(countFillers("it was literally literally amazing")).toBe(2);
  });

  it("is case insensitive", () => {
    expect(countFillers("UM UH Like")).toBe(3);
  });

  it("returns 0 for clean speech", () => {
    expect(countFillers("I went to the store and bought groceries")).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(countFillers("")).toBe(0);
  });

  it("counts multiple filler types together", () => {
    expect(countFillers("um like uh you know basically literally")).toBe(6);
  });
});
