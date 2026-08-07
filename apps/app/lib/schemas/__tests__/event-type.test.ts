import { describe, it, expect } from "vitest";
import { eventTypeSchema } from "../event-type"; // adjust export name if different

describe("Event Type Schema Validation", () => {
  it("validates a standard event type setup", () => {
    const validEventType = {
      title: "30 Min Discovery Call",
      slug: "discovery-call",
      duration: 30,
      description: "Quick intro chat",
    };

    const result = eventTypeSchema.safeParse(validEventType);
    expect(result.success).toBe(true);
  });

  it("fails when title or duration is missing or invalid", () => {
    const invalidEventType = {
      title: "",
      duration: -15, // Invalid duration
    };

    const result = eventTypeSchema.safeParse(invalidEventType);
    expect(result.success).toBe(false);
  });
});
