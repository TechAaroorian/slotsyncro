import { describe, it, expect } from "vitest";
import { generateAvailableSlots, type TimeSlot } from "./engine";

describe("Availability Engine (generateAvailableSlots)", () => {
  const baseParams = {
    date: "2026-08-10",
    hostTimeZone: "America/New_York",
    guestTimeZone: "Asia/Kolkata",
    duration: 30,
    bufferBefore: 0,
    bufferAfter: 0,
    dayWindows: [{ startTime: "09:00", endTime: "12:00" }],
    existingBookings: [],
  };

  it("generates correct slot intervals for host working hours", () => {
    const slots: TimeSlot[] = generateAvailableSlots(baseParams);

    expect(slots).toHaveLength(6);
    expect(slots[0]).toHaveProperty("utcStart");
    expect(slots[0]).toHaveProperty("utcEnd");
    expect(slots[0]).toHaveProperty("formattedLocal");
  });

  it("formats time correctly in guest local timezone", () => {
    const slots: TimeSlot[] = generateAvailableSlots(baseParams);

    // 09:00 AM EDT (America/New_York) is 06:30 PM IST (Asia/Kolkata)
    expect(slots[0].formattedLocal).toBe("06:30 PM");
  });

  it("excludes slots that conflict with existing bookings", () => {
    // Existing booking from 09:30 AM to 10:00 AM EDT (13:30 to 14:00 UTC)
    const existingBooking = {
      startTime: new Date("2026-08-10T13:30:00.000Z"),
      endTime: new Date("2026-08-10T14:00:00.000Z"),
    };

    const slots: TimeSlot[] = generateAvailableSlots({
      ...baseParams,
      existingBookings: [existingBooking],
    });

    expect(slots).toHaveLength(5);
    const times = slots.map((s: TimeSlot) => s.formattedLocal);
    expect(times).not.toContain("07:00 PM");
  });

  it("respects buffer times before and after slots", () => {
    const slotsWithBuffers: TimeSlot[] = generateAvailableSlots({
      ...baseParams,
      bufferBefore: 15,
      bufferAfter: 15,
    });

    expect(slotsWithBuffers.length).toBeLessThan(6);
  });

  it("returns an empty array when dayWindows is empty", () => {
    const slots: TimeSlot[] = generateAvailableSlots({
      ...baseParams,
      dayWindows: [],
    });

    expect(slots).toEqual([]);
  });
});
