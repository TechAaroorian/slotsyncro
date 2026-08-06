// apps/app/__tests__/poll-utils.test.ts
import { describe, it, expect } from "vitest";
import { calculateSlotScore } from "@/lib/poll-utils";

describe("lib/poll-utils", () => {
  describe("calculateSlotScore()", () => {
    it("should return 0 when vote array is empty", () => {
      const score = calculateSlotScore([]);
      expect(score).toBe(0);
    });

    it("should return 1.0 for a single YES vote", () => {
      const score = calculateSlotScore([
        { status: "YES", participantName: "Alice" },
      ]);
      expect(score).toBe(1.0);
    });

    it("should return 0.5 for a single IF_NEEDED vote", () => {
      const score = calculateSlotScore([
        { status: "IF_NEEDED", participantName: "Bob" },
      ]);
      expect(score).toBe(0.5);
    });

    it("should return 0 for a single NO vote", () => {
      const score = calculateSlotScore([
        { status: "NO", participantName: "Charlie" },
      ]);
      expect(score).toBe(0);
    });

    it("should correctly aggregate mixed status votes (2 YES + 1 IF_NEEDED + 1 NO = 2.5)", () => {
      const votes = [
        { status: "YES" as const, participantName: "Alice" },
        { status: "YES" as const, participantName: "Bob" },
        { status: "IF_NEEDED" as const, participantName: "Charlie" },
        { status: "NO" as const, participantName: "Dave" },
      ];

      const score = calculateSlotScore(votes);
      expect(score).toBe(2.5);
    });
  });
});
