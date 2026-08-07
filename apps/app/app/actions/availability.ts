// apps/app/app/actions/availability.ts
"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@repo/db";
import { auth } from "@/auth";
import {
  updateAvailabilitySchema,
  type UpdateAvailabilityInput,
} from "@/lib/schemas";

export async function updateAvailability(input: UpdateAvailabilityInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const validated = updateAvailabilitySchema.parse(input);

  await db.user.update({
    where: { id: userId },
    data: { timeZone: validated.timeZone },
  });

  for (const item of validated.schedule) {
    // ⚠️ Fallback: If slots is empty (e.g. day was toggled off), supply a default shift array
    const validSlots =
      item.slots && item.slots.length > 0
        ? item.slots
        : [{ startTime: "09:00", endTime: "17:00" }];

    const firstSlot = validSlots[0];
    const lastSlot = validSlots[validSlots.length - 1];

    const startTime = firstSlot?.startTime ?? "09:00";
    const endTime = lastSlot?.endTime ?? "17:00";
    const slotsJson = validSlots as Prisma.InputJsonValue;

    await db.userAvailability.upsert({
      where: {
        userId_day: {
          userId,
          day: item.day,
        },
      },
      update: {
        isAvailable: item.isAvailable, // 👈 Correctly saves true or false
        startTime,
        endTime,
        slots: slotsJson, // 👈 Saves valid slot structure even if day is disabled
      },
      create: {
        userId,
        day: item.day,
        isAvailable: item.isAvailable,
        startTime,
        endTime,
        slots: slotsJson,
      },
    });
  }

  revalidatePath("/availability");
  revalidatePath("/[locale]/availability", "page");

  return { success: true };
}
