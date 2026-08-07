import { z } from "zod";
import { DayOfWeek } from "@prisma/client"; // or @repo/db

export const slotSchema = z.object({
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
});

export const dayAvailabilitySchema = z.object({
  day: z.nativeEnum(DayOfWeek),
  isAvailable: z.boolean(),
  slots: z.array(slotSchema),
});

export const updateAvailabilitySchema = z.object({
  timeZone: z.string().min(1, "Timezone is required"),
  schedule: z.array(dayAvailabilitySchema),
});

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
