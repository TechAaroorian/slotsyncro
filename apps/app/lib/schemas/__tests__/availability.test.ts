import { describe, it, expect } from "vitest";
import { DayOfWeek } from "@prisma/client"; // or @repo/db depending on your imports
import {
  slotSchema,
  dayAvailabilitySchema,
  updateAvailabilitySchema,
} from "../availability";

describe("Slot Schema Validation", () => {
  it("validates a correct HH:mm time format", () => {
    const validSlot = { startTime: "09:00", endTime: "17:00" };
    const result = slotSchema.safeParse(validSlot);
    expect(result.success).toBe(true);
  });

  it("fails on invalid time formats", () => {
    const invalidSlot = { startTime: "9:00", endTime: "25:00" };
    const result = slotSchema.safeParse(invalidSlot);
    expect(result.success).toBe(false);
  });
});

describe("Day Availability Schema Validation", () => {
  it("validates a day schedule structure", () => {
    const validDay = {
      day: DayOfWeek.MONDAY,
      isAvailable: true,
      slots: [{ startTime: "09:00", endTime: "12:00" }],
    };
    const result = dayAvailabilitySchema.safeParse(validDay);
    expect(result.success).toBe(true);
  });
});

describe("Update Availability Schedule Schema Validation", () => {
  it("validates full availability update payload with timezone", () => {
    const validPayload = {
      timeZone: "America/New_York",
      schedule: [
        {
          day: DayOfWeek.MONDAY,
          isAvailable: true,
          slots: [{ startTime: "09:00", endTime: "17:00" }],
        },
        {
          day: DayOfWeek.SUNDAY,
          isAvailable: false,
          slots: [],
        },
      ],
    };

    const result = updateAvailabilitySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("fails when timeZone is missing", () => {
    const invalidPayload = {
      timeZone: "",
      schedule: [],
    };

    const result = updateAvailabilitySchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
