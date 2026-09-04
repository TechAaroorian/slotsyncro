import { describe, expect, it } from "vitest";
import { formatBookingDateTime } from "./booking-date-time";

describe("formatBookingDateTime", () => {
  it("formats an absolute booking in the host timezone across a date boundary", () => {
    const result = formatBookingDateTime(
      new Date("2026-09-04T20:00:00.000Z"),
      new Date("2026-09-04T20:30:00.000Z"),
      "Asia/Kolkata",
      "en",
    );

    expect(result).toEqual({
      date: "Saturday, September 5, 2026",
      timeRange: "1:30 AM – 2:00 AM",
      timeZone: "Asia/Kolkata",
    });
  });

  it("applies daylight-saving time for the host timezone", () => {
    const result = formatBookingDateTime(
      new Date("2026-07-15T13:00:00.000Z"),
      new Date("2026-07-15T14:00:00.000Z"),
      "America/New_York",
      "en",
    );

    expect(result.timeRange).toBe("9:00 AM – 10:00 AM");
  });

  it("localizes the displayed date and time", () => {
    const result = formatBookingDateTime(
      new Date("2026-09-04T10:00:00.000Z"),
      new Date("2026-09-04T10:30:00.000Z"),
      "Europe/Berlin",
      "de",
    );

    expect(result.date).toContain("Freitag");
    expect(result.timeRange).toBe("12:00 – 12:30");
  });
});
