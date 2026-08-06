// apps/app/lib/__tests__/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "../utils";
import { CreatePollSchema } from "../schemas/poll";

describe("lib/utils.ts - cn()", () => {
  it("should merge tailwind classes properly", () => {
    const result = cn("px-2 py-1", "bg-blue-500", { "text-white": true });
    expect(result).toContain("px-2");
    expect(result).toContain("bg-blue-500");
    expect(result).toContain("text-white");
  });
});

describe("lib/schemas/poll.ts", () => {
  it("should transform empty or whitespace description to undefined (Branch: val === '')", () => {
    const dataWithEmptyDesc = {
      title: "Team Retrospective",
      description: "   ", // Trims to "" -> transforms to undefined
      slotDate: "2026-08-10",
      startHours: ["09:00", "10:00"],
    };

    const parsed = CreatePollSchema.safeParse(dataWithEmptyDesc);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.description).toBeUndefined();
    }
  });

  it("should retain non-empty description (Branch: val !== '')", () => {
    const dataWithValidDesc = {
      title: "Team Retrospective",
      description: "Sprint 42 recap and backlog grooming", // Non-empty -> returns val
      slotDate: "2026-08-10",
      startHours: ["09:00", "10:00"],
    };

    const parsed = CreatePollSchema.safeParse(dataWithValidDesc);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.description).toBe(
        "Sprint 42 recap and backlog grooming",
      );
    }
  });

  it("should fail validation if startHours array is empty", () => {
    const invalidData = {
      title: "Team Retrospective",
      slotDate: "2026-08-10",
      startHours: [],
    };

    const parsed = CreatePollSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});
