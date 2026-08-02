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
    .optional(),
  slotDate: z
    .string()
    .min(1, { message: "Please select a valid meeting date." }),
  startHours: z
    .array(z.string())
    .min(1, { message: "Please select at least one time slot." }),
});

// TypeScript type inferred directly from the Zod Schema
export type CreatePollInput = z.infer<typeof CreatePollSchema>;

export type PollFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    slotDate?: string[];
    startHours?: string[];
    formError?: string[];
  };
};
