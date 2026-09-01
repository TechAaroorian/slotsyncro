import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@repo/db";

import { CreateEventTypeDialog } from "@/components/event-types/create-event-type-dialog";
import { EventTypeCard } from "@/components/event-types/event-type-card";

export default async function EventTypesPage({
  params,
}: PageProps<"/[locale]/event-types">) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      eventTypes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect(`/${locale}`);
  }

  const username = user.username || user.id;
  const eventTypes = user.eventTypes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Types</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage meeting configurations guests can book.
          </p>
        </div>
        <CreateEventTypeDialog />
      </div>

      {eventTypes.length === 0 ? (
        <div className="flex min-h-62.5 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex max-w-105 flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">
              No event types created
            </h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t created any event types yet. Add your first
              meeting template to allow guests to book time on your calendar.
            </p>
            <CreateEventTypeDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((et) => (
            <EventTypeCard
              key={et.id}
              id={et.id}
              title={et.title}
              slug={et.slug}
              duration={et.duration}
              description={et.description}
              isActive={!et.isArchived}
              username={username}
            />
          ))}
        </div>
      )}
    </div>
  );
}
