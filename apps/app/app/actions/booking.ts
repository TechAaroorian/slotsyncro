"use server";

import { db } from "@repo/db";
import { createBookingSchema, type CreateBookingInput } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createEvent, type EventAttributes } from "ics";
import { BookingConfirmationEmail } from "@/components/emails/booking-confirmation";
import { render } from "@react-email/components";
import { formatInTimeZone } from "date-fns-tz";

export type EmailDeliveryResult = {
  status: "SENT" | "FAILED";
  recipient: string;
};

export type CreateBookingSuccess = {
  success: true;
  bookingId: string;
  emailDelivery: EmailDeliveryResult;
};

export type CreateBookingResult =
  | CreateBookingSuccess
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
    // 1. Fetch EventType AND Host details
    const eventType = await db.eventType.findUnique({
      where: { id: eventTypeId },
      select: { duration: true, userId: true, isArchived: true, title: true },
    });

    const host = await db.user.findUnique({
      where: { id: hostId },
      select: { name: true, username: true, email: true },
    });

    if (
      !eventType ||
      eventType.isArchived ||
      eventType.userId !== hostId ||
      !host
    ) {
      return {
        success: false,
        error: "This event type or host is no longer active or available.",
      };
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + eventType.duration * 60 * 1000,
    );

    // 2. Prevent Double Booking
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

    // 3. Generate a Unique ID for Calendar Sync (Idempotency)
    const icsUid = crypto.randomUUID() + "@slotsyncro.com";

    // 4. Create Booking Record in Database
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
        icsUid, // ✨ Save the unique calendar ID
      },
    });

    // 5. Generate the .ics Calendar File
    const icsEvent: EventAttributes = {
      start: [
        startDateTime.getUTCFullYear(),
        startDateTime.getUTCMonth() + 1, // ics months are 1-indexed
        startDateTime.getUTCDate(),
        startDateTime.getUTCHours(),
        startDateTime.getUTCMinutes(),
      ],
      end: [
        endDateTime.getUTCFullYear(),
        endDateTime.getUTCMonth() + 1,
        endDateTime.getUTCDate(),
        endDateTime.getUTCHours(),
        endDateTime.getUTCMinutes(),
      ],
      startInputType: "utc",
      startOutputType: "utc",
      title: `${eventType.title} with ${host.name || host.username}`,
      description: guestNotes || "Scheduled via SlotSyncro",
      attendees: [{ name: guestName, email: guestEmail }],
      uid: icsUid,
      ...(host.email
        ? {
            organizer: {
              name: host.name || host.username || "Host",
              email: host.email,
            },
          }
        : {}),
    };

    const { value: icsContent, error: icsError } = createEvent(icsEvent);
    if (icsError) console.error("ICS Generation Error:", icsError);

    // Email delivery is a secondary side effect. Once the booking exists, an
    // email provider failure must not make the client retry the booking itself.
    let emailDelivery: EmailDeliveryResult = {
      status: "FAILED",
      recipient: guestEmail,
    };

    if (icsContent) {
      try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          throw new Error("RESEND_API_KEY is not configured");
        }

        const emailHtml = await render(
          BookingConfirmationEmail({
            guestName,
            hostName: host.name || host.username || "Host",
            eventTitle: eventType.title,
            date: formatInTimeZone(
              startDateTime,
              guestTimeZone,
              "EEEE, MMMM d, yyyy",
            ),
            time: formatInTimeZone(
              startDateTime,
              guestTimeZone,
              "h:mm a zzz",
            ),
          }),
        );

        const resend = new Resend(apiKey);
        const { error: resendError } = await resend.emails.send({
          from: "SlotSyncro <onboarding@resend.dev>", // Testing domain
          to: guestEmail,
          subject: `Confirmed: ${eventType.title} with ${host.name || host.username}`,
          html: emailHtml,
          attachments: [
            {
              filename: "invite.ics",
              content: Buffer.from(icsContent).toString("base64"),
            },
          ],
        });

        if (resendError) {
          throw new Error(resendError.message);
        }

        emailDelivery = { status: "SENT", recipient: guestEmail };
      } catch (emailError) {
        console.error(
          `Booking ${newBooking.id} was created, but confirmation email delivery failed:`,
          emailError,
        );
      }
    }

    revalidatePath("/[username]/[slug]", "page");
    revalidatePath("/(dashboard)/bookings", "page");

    return {
      success: true,
      bookingId: newBooking.id,
      emailDelivery,
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
