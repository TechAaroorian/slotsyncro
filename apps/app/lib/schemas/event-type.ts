// apps/app/lib/schemas/event-type.ts
import { z } from "zod";

export const eventTypeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters"),
  slug: z
    .string()
    .min(1, "URL slug is required")
    .max(50, "Slug must be under 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
  duration: z.coerce
    .number({ message: "Duration must be a number" })
    .min(5, "Minimum duration is 5 minutes")
    .max(480, "Maximum duration is 8 hours (480 minutes)"),
  bufferBefore: z.coerce.number().min(0).default(0).optional(),
  bufferAfter: z.coerce.number().min(0).default(0).optional(),
  isActive: z.boolean().default(true),
});

export type EventTypeFormValues = z.infer<typeof eventTypeSchema>;
// Alias export so existing imports using EventTypeInput won't break
export type EventTypeInput = EventTypeFormValues;
