// apps/app/lib/schemas/poll.ts
import { z } from "zod";

export const CreatePollSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Poll title must be at least 3 characters long." })
    .max(100, { message: "Poll title cannot exceed 100 characters." }),
  description: z
    .string()
    .trim()
    .max(300, { message: "Description cannot exceed 300 characters." })
    .optional()
    .transform((val) => (val === "" ? undefined : val)), // Converts empty string "" to undefined
  slotDate: z
    .string()
    .min(1, { message: "Please select a valid meeting date." }),
  startHours: z
    .array(z.string())
    .min(1, { message: "Please select at least one time slot." }),
});

// TypeScript type inferred directly from the Zod Schema
export type CreatePollInput = z.infer<typeof CreatePollSchema>;

export const SubmitPollVotesSchema = z.object({
  pollId: z.string().trim().min(1),
  participantName: z.string().trim().min(1).max(100),
  participantEmail: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().email().optional(),
  ),
  votes: z
    .array(
      z.object({
        slotId: z.string().trim().min(1),
        status: z.enum(["YES", "IF_NEEDED", "NO"]),
      }),
    )
    .min(1),
});

export type SubmitPollVotesInput = z.infer<typeof SubmitPollVotesSchema>;

export type PollFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    slotDate?: string[];
    startHours?: string[];
    formError?: string[];
  };
};
