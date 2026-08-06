// apps/app/app/actions/__tests__/poll.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitPollVotes, createPoll } from "../poll";
import { db } from "@repo/db";
import { auth } from "@/auth";

// 1. Mock Auth session
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-host-123", email: "host@example.com" },
  }),
}));

// 2. Mock @repo/db transaction and queries
vi.mock("@repo/db", () => ({
  db: {
    poll: {
      create: vi.fn().mockResolvedValue({
        id: "poll-123",
        slug: "weekly-standup-xyz12",
        title: "Strategy Sync",
      }),
    },
    $transaction: vi.fn(async (callback) => {
      return callback({
        availability: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          createMany: vi.fn().mockResolvedValue({ count: 2 }),
        },
      });
    }),
  },
}));

// 3. Mock next/navigation redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
}));

describe("actions/poll.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPoll()", () => {
    it("should return validation errors when form data is invalid", async () => {
      const formData = new FormData();
      formData.append("title", ""); // Invalid: title empty

      const result = await createPoll({ errors: {} }, formData);

      expect(result?.errors).toBeDefined();
      expect(db.poll.create).not.toHaveBeenCalled();
    });

    it("should successfully create a poll when valid form data is provided", async () => {
      const formData = new FormData();
      formData.append("title", "Weekly Standup");
      formData.append("description", "Team alignment meeting");
      formData.append("slotDate", "2026-08-10");
      // Append each array item individually so formData.getAll("startHours") reads string[]
      formData.append("startHours", "09:00");
      formData.append("startHours", "10:00");

      await createPoll({ errors: {} }, formData);

      expect(db.poll.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Weekly Standup",
          description: "Team alignment meeting",
          hostId: "user-host-123",
        }),
      });
    });

    it("should handle empty title fallback and explicit time format (e.g. HH:mm:ss) to cover slot formatting branches", async () => {
      const formData = new FormData();
      // Using characters that get completely stripped by regex to force baseSlug fallback ("poll")
      formData.append("title", "!!!");
      formData.append("slotDate", "2026-08-10");
      // Pass full HH:mm:ss format (length != 5) to hit the ternary else branch (line 51)
      formData.append("startHours", "09:00:00");

      await createPoll({ errors: {} }, formData);

      expect(db.poll.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: expect.stringMatching(/^poll-/),
        }),
      });
    });

    // Add inside the describe("submitPollVotes()", ...) block:

    it("should handle empty or whitespace participantEmail (Line 132)", async () => {
      const result = await submitPollVotes({
        pollId: "poll-123",
        participantName: "Alex Mercer",
        participantEmail: "   ", // Whitespace email forces fallback to null
        votes: [{ slotId: "slot-1", status: "YES" }],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("createPoll() - Branch Coverage Tests", () => {
    it("should return unauthorized error when session or user ID is missing (Line 16)", async () => {
      // Mock unauthenticated session
      vi.mocked(auth).mockResolvedValueOnce(null);

      const formData = new FormData();
      formData.append("title", "Unauthorized Poll");

      const result = await createPoll({ errors: {} }, formData);

      expect(result.errors?.formError).toContain(
        "Unauthorized: You must be signed in to create a poll.",
      );
      expect(db.poll.create).not.toHaveBeenCalled();
    });

    it("should handle database error gracefully during poll creation (Lines 83-84)", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Force db.poll.create to reject
      vi.mocked(db.poll.create).mockRejectedValueOnce(
        new Error("Database connection error"),
      );

      const formData = new FormData();
      formData.append("title", "Failed Poll");
      formData.append("slotDate", "2026-08-10");
      formData.append("startHours", "09:00");

      const result = await createPoll({ errors: {} }, formData);

      expect(result.errors?.formError).toContain(
        "Database error: Failed to create poll. Please try again.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("submitPollVotes()", () => {
    it("should fail validation if participantName is empty", async () => {
      const result = await submitPollVotes({
        pollId: "poll-123",
        participantName: "   ",
        votes: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Participant name is required");
    });

    it("should execute database transaction for valid vote submission", async () => {
      const result = await submitPollVotes({
        pollId: "poll-123",
        participantName: "Alex Mercer",
        participantEmail: "alex@example.com",
        votes: [
          { slotId: "slot-1", status: "YES" },
          { slotId: "slot-2", status: "IF_NEEDED" },
        ],
      });

      expect(result.success).toBe(true);
      expect(db.$transaction).toHaveBeenCalled();
    });

    it("should handle database transaction errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(db.$transaction).mockRejectedValueOnce(new Error("DB Error"));

      const result = await submitPollVotes({
        pollId: "poll-123",
        participantName: "Alex Mercer",
        votes: [{ slotId: "slot-1", status: "YES" }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database transaction failed");
      consoleSpy.mockRestore();
    });
  });
});
