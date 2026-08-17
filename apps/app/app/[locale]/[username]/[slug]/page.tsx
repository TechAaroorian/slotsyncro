import { db } from "@repo/db";
import { notFound } from "next/navigation";
import { BookingView } from "@/components/booking/booking-view";
import { auth } from "@/auth";

interface PublicBookingPageProps {
  params: Promise<{
    locale: string;
    username: string; // This route parameter handles both username OR user ID fallback
    slug: string;
  }>;
}

export default async function PublicBookingPage({
  params,
}: PublicBookingPageProps) {
  const { locale, username, slug } = await params;

  // 1. Fetch current user session to auto-populate the booking form
  const session = await auth();

  const loggedInUser = session?.user?.id
    ? {
        id: session.user.id as string,
        name: session.user.name || "",
        email: session.user.email || "",
      }
    : null;

  // 2. Query host by username OR fallback to user ID if username is null
  const host = await db.user.findFirst({
    where: {
      OR: [{ username: username }, { id: username }],
    },
    include: {
      weeklyAvailability: true,
    },
  });

  if (!host) {
    notFound();
  }

  // 3. Fetch the event type scoped to this host
  const eventType = await db.eventType.findUnique({
    where: {
      userId_slug: {
        userId: host.id,
        slug,
      },
    },
  });

  if (!eventType || eventType.isArchived) {
    notFound();
  }

  // 4. Fetch existing bookings to calculate availability conflicts
  const existingBookings = await db.booking.findMany({
    where: {
      hostId: host.id,
      startTime: {
        gte: new Date(), // Only fetch future bookings to save memory
      },
    },
  });

  return (
    <main className="min-h-screen bg-muted/40 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <BookingView
          host={host}
          eventType={eventType}
          weeklyAvailability={host.weeklyAvailability}
          existingBookings={existingBookings}
          locale={locale}
          loggedInUser={loggedInUser} // Type error resolved
        />
      </div>
    </main>
  );
}
