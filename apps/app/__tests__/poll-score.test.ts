// apps/app/__tests__/poll-score.test.ts
import { describe, it, expect } from "vitest";
import { calculateSlotScore } from "@/lib/poll-utils";

describe("calculateSlotScore()", () => {
  it("should return 0 when there are no votes", () => {
    expect(calculateSlotScore([])).toBe(0);
  });

  it("should return 2.5 for 2 YES and 1 IF_NEEDED votes", () => {
    const availabilities = [
      { status: "YES" as const, participantName: "Alice" },
      { status: "YES" as const, participantName: "Bob" },
      { status: "IF_NEEDED" as const, participantName: "Charlie" },
      { status: "NO" as const, participantName: "Dave" },
    ];

    expect(calculateSlotScore(availabilities)).toBe(2.5);
  });
});
