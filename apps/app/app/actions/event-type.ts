"use server";

import { db } from "@repo/db";
import { eventTypeSchema, EventTypeInput } from "@/lib/schemas/event-type";
import { revalidatePath } from "next/cache";

export async function createEventType(userId: string, input: EventTypeInput) {
  const validated = eventTypeSchema.parse(input);

  const existing = await db.eventType.findUnique({
    where: {
      userId_slug: {
        userId,
        slug: validated.slug,
      },
    },
  });

  if (existing) {
    throw new Error("SLUG_EXISTS");
  }

  const eventType = await db.eventType.create({
    data: {
      userId,
      ...validated,
    },
  });

  revalidatePath("/dashboard/event-types");
  return { success: true, data: eventType };
}
