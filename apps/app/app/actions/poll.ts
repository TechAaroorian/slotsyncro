// apps/app/actions/poll.ts
"use server";

import { auth } from "@/auth";
import { db, AvailabilityStatus } from "@repo/db";
import { CreatePollSchema, PollFormState } from "@/lib/schemas/poll";
import { redirect } from "next/navigation";

export async function createPoll(
  prevState: PollFormState,
  formData: FormData,
): Promise<PollFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      errors: {
        formError: ["Unauthorized: You must be signed in to create a poll."],
      },
    };
  }

  // Extract raw form entries
  const descriptionRaw = formData.get("description") as string | null;

  const rawData = {
    title: formData.get("title"),
    description: descriptionRaw?.trim() || undefined, // Store undefined/null when empty
    slotDate: formData.get("slotDate"),
    startHours: formData.getAll("startHours"),
  };

  // Validate using Zod
  const validatedFields = CreatePollSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, slotDate, startHours } = validatedFields.data;

  // Generate unique URL slug
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug || "poll"}-${randomSuffix}`;

  let createdSlug = "";

  try {
    // Construct UTC slot datetimes safely
    const timeSlotsData = startHours.map((time) => {
      // Ensure time string format is HH:mm (e.g., "09:00")
      const formattedTime = time.length === 5 ? `${time}:00` : time;
      const startDateTime = new Date(`${slotDate}T${formattedTime}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      return {
        startTime: startDateTime,
        endTime: endDateTime,
      };
    });

    const poll = await db.poll.create({
      data: {
        title,
        description,
        slug,
        hostId: session.user.id,
        slots: {
          create: timeSlotsData,
        },
      },
    });

    createdSlug = poll.slug;
  } catch (error) {
    console.error("Failed to create poll:", error);
    return {
      errors: {
        formError: ["Database error: Failed to create poll. Please try again."],
      },
    };
  }

  // Redirect host after successful creation
  redirect(`/poll/${createdSlug}`);
}

export interface VoteSubmission {
  slotId: string;
  status: AvailabilityStatus;
}

export async function submitPollVotes(data: {
  pollId: string;
  participantName: string;
  participantEmail?: string;
  votes: VoteSubmission[];
}) {
  const { pollId, participantName, participantEmail, votes } = data;
  const normalizedName = participantName.trim();

  if (!normalizedName) {
    return { success: false, error: "Participant name is required" };
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. Clear previous votes for this participant on this poll
      await tx.availability.deleteMany({
        where: {
          pollId,
          participantName: {
            equals: normalizedName,
            mode: "insensitive", // Handles case differences like "Alex" vs "alex"
          },
        },
      });

      // 2. Insert new set of votes
      await tx.availability.createMany({
        data: votes.map((vote) => ({
          pollId,
          timeSlotId: vote.slotId,
          participantName: normalizedName,
          participantEmail: participantEmail?.trim() || null,
          status: vote.status,
        })),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit poll votes:", error);
    return { success: false, error: "Database transaction failed" };
  }
}
