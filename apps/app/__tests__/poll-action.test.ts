// apps/app/__tests__/poll-action.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitPollVotes } from "@/app/actions/poll";
import { db } from "@repo/db";
import { auth } from "@/auth";
import type { Session } from "next-auth";

const availabilityMocks = vi.hoisted(() => ({
  deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
  createMany: vi.fn().mockResolvedValue({ count: 2 }),
}));

// Define a type for the transaction client mock
type MockTx = {
  availability: {
    deleteMany: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
};

// Preserve actual exports (PrismaAdapter, AvailabilityStatus, etc.) and mock db.$transaction strongly
vi.mock("@repo/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/db")>();

  return {
    ...actual,
    db: {
      ...actual.db,
      $transaction: vi.fn(
        async <T>(callback: (tx: MockTx) => Promise<T>): Promise<T> => {
          const mockTx: MockTx = {
            availability: availabilityMocks,
          };
          return callback(mockTx);
        },
      ),
    },
  };
});

describe("actions/poll - submitPollVotes()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail validation if participantName is empty or whitespace", async () => {
    const result = await submitPollVotes({
      pollId: "poll-1",
      participantName: "   ",
      votes: [],
    });

    expect(result.success).toBe(false);
    expect(result).toEqual({ success: false, error: "INVALID_SUBMISSION" });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("rejects malformed email and empty vote payloads before persistence", async () => {
    const result = await submitPollVotes({
      pollId: "poll-1",
      participantName: "Alex",
      participantEmail: "not-an-email",
      votes: [],
    });

    expect(result).toEqual({
      success: false,
      error: "INVALID_SUBMISSION",
    });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("should execute db transaction successfully when valid votes are provided", async () => {
    const result = await submitPollVotes({
      pollId: "poll-1",
      participantName: "Marcus Wright",
      participantEmail: "marcus@example.com",
      votes: [
        { slotId: "slot-1", status: "YES" },
        { slotId: "slot-2", status: "IF_NEEDED" },
      ],
    });

    expect(result.success).toBe(true);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });

  it("attributes votes to the server-authenticated user", async () => {
    vi.mocked(auth as () => Promise<Session | null>).mockResolvedValueOnce({
      user: { id: "user-1", name: "Marcus Wright" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const result = await submitPollVotes({
      pollId: "poll-1",
      participantName: "Marcus Wright",
      participantEmail: "marcus@example.com",
      votes: [{ slotId: "slot-1", status: "YES" }],
    });

    expect(result).toEqual({ success: true });
    expect(availabilityMocks.deleteMany).toHaveBeenCalledWith({
      where: {
        pollId: "poll-1",
        OR: [
          { userId: "user-1" },
          {
            userId: null,
            participantName: {
              equals: "Marcus Wright",
              mode: "insensitive",
            },
          },
        ],
      },
    });
    expect(availabilityMocks.createMany).toHaveBeenCalledWith({
      data: [
        {
          pollId: "poll-1",
          timeSlotId: "slot-1",
          participantName: "Marcus Wright",
          participantEmail: "marcus@example.com",
          userId: "user-1",
          status: "YES",
        },
      ],
    });
  });

  it("should handle unexpected database failures gracefully", async () => {
    // 🟢 Spy on console.error to suppress expected error output in stderr
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(db.$transaction).mockRejectedValueOnce(
      new Error("Database connection dropped"),
    );

    const result = await submitPollVotes({
      pollId: "poll-1",
      participantName: "Sarah Connor",
      votes: [{ slotId: "slot-1", status: "YES" }],
    });

    expect(result.success).toBe(false);
    expect(result).toEqual({ success: false, error: "DATABASE_ERROR" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to submit poll votes:",
      expect.any(Error),
    );

    // Restore original console.error implementation
    consoleSpy.mockRestore();
  });
});
