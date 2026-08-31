import { db } from "@repo/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format, startOfDay } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, User, Mail, AlignLeft } from "lucide-react";

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const todayStart = startOfDay(new Date());

  // 1. Fetch upcoming bookings for the logged-in Host
  const upcomingBookings = await db.booking.findMany({
    where: {
      hostId: session.user.id,
      startTime: {
        gte: todayStart, // Only show meetings happening in the future
      },
    },
    orderBy: {
      startTime: "asc", // Show the soonest meetings first
    },
    include: {
      eventType: {
        select: {
          title: true,
          duration: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Bookings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your scheduled meetings and events.
        </p>
      </div>

      {upcomingBookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-dashed">
          <CalendarClock className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <CardTitle className="text-xl">No upcoming meetings</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            When guests schedule time with you, their bookings will appear here.
            Share your event links to get started!
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden flex flex-col">
              <div className="h-2 w-full bg-primary" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.eventType.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {booking.eventType.duration} minutes
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      booking.status === "ACCEPTED" ? "default" : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                {/* Time Context */}
                <div className="bg-muted/40 p-3 rounded-md border border-border/50">
                  <p className="font-medium text-sm">
                    {/* Displaying time in UTC for the host for now - we can add timezone parsing later */}
                    {format(booking.startTime, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(booking.startTime, "h:mm a")} -{" "}
                    {format(booking.endTime, "h:mm a")}
                  </p>
                </div>

                {/* Guest Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{booking.guestName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${booking.guestEmail}`}
                      className="text-primary hover:underline truncate"
                    >
                      {booking.guestEmail}
                    </a>
                  </div>
                  {booking.guestNotes && (
                    <div className="flex items-start gap-2 pt-1">
                      <AlignLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-muted-foreground italic line-clamp-2">
                        &ldquo;{booking.guestNotes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
