"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@repo/db";
import {
  eventTypeSchema,
  type EventTypeFormValues,
} from "@/lib/schemas/event-type";

/**
 * Creates a new Event Type for the currently authenticated user
 */
export async function createEventType(input: EventTypeFormValues) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Safe Zod parsing
  const parseResult = eventTypeSchema.safeParse(input);

  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.flatten((issue) => issue.message).fieldErrors,
    };
  }

  const validated = parseResult.data;

  try {
    // 2. Check for duplicate slug scoped to this user
    const existing = await db.eventType.findUnique({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug: validated.slug,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "You already have an event type with this URL slug.",
      };
    }

    // 3. Create Event Type record
    const eventType = await db.eventType.create({
      data: {
        userId: session.user.id,
        title: validated.title,
        slug: validated.slug,
        description: validated.description,
        duration: validated.duration,
        bufferBefore: validated.bufferBefore,
        bufferAfter: validated.bufferAfter,
        isArchived: !validated.isActive,
      },
    });

    // 4. Revalidate route caches
    revalidatePath("/event-types");
    revalidatePath("/[locale]/event-types", "page");

    return { success: true, data: eventType };
  } catch (error) {
    console.error("Error creating event type:", error);
  }
}

/**
 * Toggles the active status of an Event Type
 */
export async function toggleEventType(id: string, isActive: boolean) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.eventType.update({
      where: {
        id,
        userId: session.user.id, // Enforce row-level ownership
      },
      // Map isActive boolean to database's isArchived field
      data: {
        isArchived: !isActive,
      },
    });

    revalidatePath("/event-types");
    revalidatePath("/[locale]/event-types", "page");

    return { success: true };
  } catch (error) {
    console.error("Error toggling event type status:", error);
    // Fixed typo: 'sucdess' -> 'success'
    return { success: false, error: "Failed to update status." };
  }
}

/**
 * Deletes an Event Type
 */
export async function deleteEventType(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.eventType.delete({
      where: {
        id,
        userId: session.user.id, // Enforce row-level ownership
      },
    });

    revalidatePath("/event-types");
    revalidatePath("/[locale]/event-types", "page");
  } catch (error) {
    console.error("Error deleting event type:", error);
    return { success: false, error: "Failed to delete event type." };
  }
}
