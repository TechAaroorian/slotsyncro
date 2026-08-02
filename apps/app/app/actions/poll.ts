"use server";

import { auth } from "@/auth";
import { db } from "@repo/db";
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
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    slotDate: formData.get("slotDate"),
    startHours: formData.getAll("startHours"), // Collects all checked checkboxes into an array
  };

  // Validate using Zod
  const validatedFields = CreatePollSchema.safeParse(rawData);

  // Return formatted field errors if validation fails
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
    // Construct slot dates
    const timeSlotsData = startHours.map((time) => {
      const startDateTime = new Date(`${slotDate}T${time}:00`);
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
  } catch {
    return {
      errors: {
        formError: ["Database error: Failed to create poll. Please try again."],
      },
    };
  }

  // Redirect host after successful creation
  redirect(`/poll/${createdSlug}`);
}
