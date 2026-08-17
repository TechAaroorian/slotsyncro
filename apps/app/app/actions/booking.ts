"use server";

import { db } from "@repo/db";
import { createBookingSchema, type CreateBookingInput } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export type CreateBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createBooking(
  rawInput: CreateBookingInput,
): Promise<CreateBookingResult> {
  const result = createBookingSchema.safeParse(rawInput);

  if (!result.success) {
    return {
      success: false,
      error: "Validation failed. Please review your details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const {
    eventTypeId,
    hostId,
    guestName,
    guestEmail,
    guestNotes,
    guestTimeZone,
    startTime,
  } = result.data;

  try {
    // 1. Fetch EventType details to determine duration & active status
    const eventType = await db.eventType.findUnique({
      where: { id: eventTypeId },
      select: { duration: true, userId: true, isArchived: true },
    });

    if (!eventType || eventType.isArchived || eventType.userId !== hostId) {
      return {
        success: false,
        error: "This event type is no longer active or available.",
      };
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + eventType.duration * 60 * 1000,
    );

    // 2. Prevent Double Booking / Race Condition (Check overlapping bookings)
    const conflictingBooking = await db.booking.findFirst({
      where: {
        hostId,
        status: { in: ["PENDING", "ACCEPTED"] },
        AND: [
          { startTime: { lt: endDateTime } },
          { endTime: { gt: startDateTime } },
        ],
      },
    });

    if (conflictingBooking) {
      return {
        success: false,
        error:
          "This time slot was just booked by someone else. Please select another slot.",
      };
    }

    // 3. Create Booking Record in Database
    const newBooking = await db.booking.create({
      data: {
        eventTypeId,
        hostId,
        guestName,
        guestEmail,
        guestNotes: guestNotes || null,
        guestTimeZone,
        startTime: startDateTime,
        endTime: endDateTime,
        status: "ACCEPTED",
      },
    });

    revalidatePath("/[username]/[slug]", "page");

    return {
      success: true,
      bookingId: newBooking.id,
    };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while scheduling your meeting. Please try again.",
    };
  }
}
