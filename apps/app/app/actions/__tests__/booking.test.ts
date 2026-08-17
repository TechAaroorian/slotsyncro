import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBooking } from "../booking";
import { db } from "@repo/db";
import type { Booking, EventType } from "@prisma/client";

vi.mock("@repo/db", () => ({
  db: {
    eventType: {
      findUnique: vi.fn(),
    },
    booking: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createBooking Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    eventTypeId: "evt_123",
    hostId: "usr_host",
    guestName: "Alice Smith",
    guestEmail: "alice@example.com",
    guestNotes: "Looking forward to our chat",
    guestTimeZone: "America/New_York",
    startTime: "2026-09-01T10:00:00.000Z",
  };

  it("fails validation when required fields are missing or invalid", async () => {
    const response = await createBooking({
      ...validPayload,
      guestEmail: "invalid-email",
    });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.fieldErrors?.guestEmail).toBeDefined();
    }
  });

  it("returns error if event type does not exist or is archived", async () => {
    vi.mocked(db.eventType.findUnique).mockResolvedValue(null);

    const response = await createBooking(validPayload);
    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toContain("no longer active");
    }
  });

  it("returns error if conflicting booking exists during fast UX check", async () => {
    vi.mocked(db.eventType.findUnique).mockResolvedValue({
      id: "evt_123",
      duration: 30,
      userId: "usr_host",
      isArchived: false,
    } as unknown as EventType);

    vi.mocked(db.booking.findFirst).mockResolvedValue({
      id: "existing_bk_1",
    } as unknown as Booking);

    const response = await createBooking(validPayload);
    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toContain("just booked by someone else");
    }
  });

  it("creates booking successfully when slot is available", async () => {
    vi.mocked(db.eventType.findUnique).mockResolvedValue({
      id: "evt_123",
      duration: 30,
      userId: "usr_host",
      isArchived: false,
    } as unknown as EventType);

    vi.mocked(db.booking.findFirst).mockResolvedValue(null);
    vi.mocked(db.booking.create).mockResolvedValue({
      id: "bk_new_789",
    } as unknown as Booking);

    const response = await createBooking(validPayload);
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.bookingId).toBe("bk_new_789");
    }
  });

  it("returns a generic fallback error if the database unexpectedly throws", async () => {
    // 1. Mock a successful event type fetch
    vi.mocked(db.eventType.findUnique).mockResolvedValue({
      id: "evt_123",
      duration: 30,
      userId: "usr_host",
      isArchived: false,
    } as unknown as EventType);

    // 2. Mock that the slot is completely free
    vi.mocked(db.booking.findFirst).mockResolvedValue(null);

    // 3. Force the Prisma create method to CRASH
    vi.mocked(db.booking.create).mockRejectedValue(
      new Error("Database connection dropped"),
    );

    // 4. Temporarily silence console.error so our test output stays clean
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // 5. Execute the action
    const response = await createBooking(validPayload);

    // 6. Verify we gracefully hit the catch block
    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toContain("unexpected error occurred");
    }

    // Cleanup the console spy
    consoleSpy.mockRestore();
  });

  it("creates booking successfully when guestNotes is omitted (fallback to null)", async () => {
    // 1. Mock DB dependencies
    vi.mocked(db.eventType.findUnique).mockResolvedValue({
      id: "evt_123",
      duration: 30,
      userId: "usr_host",
      isArchived: false,
    } as unknown as EventType);
    vi.mocked(db.booking.findFirst).mockResolvedValue(null);
    vi.mocked(db.booking.create).mockResolvedValue({
      id: "bk_new_no_notes",
    } as unknown as Booking);

    // 2 & 3. Execute Action with an empty string
    const response = await createBooking({
      ...validPayload,
      guestNotes: "", // The empty string satisfies TS, but is falsy enough to trigger `|| null`
    });

    // 4. Assert Success and verify the fallback to null was used
    expect(response.success).toBe(true);

    // Pro-tip: Assert that Prisma was actually called with `guestNotes: null`
    expect(db.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          guestNotes: null,
        }),
      }),
    );
  });
});
