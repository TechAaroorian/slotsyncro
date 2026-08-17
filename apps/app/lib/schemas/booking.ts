// apps/app/lib/schemas/booking.ts
import { z } from "zod";

export const createBookingSchema = z.object({
  eventTypeId: z.string().min(1, "Event type is required"),
  hostId: z.string().min(1, "Host is required"),
  guestName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  guestEmail: z.string().trim().email("Please enter a valid email address"),
  guestNotes: z.string().trim().max(1000).optional().default(""),
  guestTimeZone: z.string().min(1, "Timezone is required"),
  startTime: z
    .string()
    .datetime({ message: "Start time must be a valid ISO datetime string" }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
