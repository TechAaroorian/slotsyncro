import { DayOfWeek } from "@prisma/client"; // or import from "@slotsyncro/db" if re-exported
import { redirect } from "next/navigation";
import { auth } from "@/auth"; // your Auth.js / NextAuth session helper
import { db } from "@repo/db"; // or @slotsyncro/db
import { ScheduleForm } from "@/components/availability/schedule-form";
import { updateAvailability } from "@/app/actions/availability";

// Define default days in case user hasn't set their availability yet
const DEFAULT_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

const ALL_DAYS: DayOfWeek[] = Object.values(DayOfWeek);

export default async function AvailabilityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      weeklyAvailability: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Transform database availability to match ScheduleForm's initialData format
  const rawAvailability = user.weeklyAvailability ?? [];

  const schedule = ALL_DAYS.map((day) => {
    const existing = rawAvailability.find((a) => a.day === day);

    if (existing) {
      return {
        day,
        isAvailable: true,
        slots: (existing.slots as Array<{
          startTime: string;
          endTime: string;
        }>) || [{ startTime: existing.startTime, endTime: existing.endTime }],
      };
    }

    return {
      day,
      isAvailable: DEFAULT_DAYS.includes(day),
      slots: [{ startTime: "09:00", endTime: "17:00" }],
    };
  });

  return (
    <div className="container max-w-5xl">
      <ScheduleForm
        userId={user.id}
        initialData={{
          timeZone: user.timeZone || "UTC", // Corrected fallback
          schedule,
        }}
        onSubmit={updateAvailability}
      />
    </div>
  );
}
