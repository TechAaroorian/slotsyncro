import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AlignLeft, CalendarClock, Mail, User } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@repo/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBookingDateTime } from "@/lib/booking-date-time";
import { localizedPath } from "@/lib/navigation";

const statusKeys = {
  ACCEPTED: "accepted",
  CANCELLED: "cancelled",
  PENDING: "pending",
} as const;

export default async function BookingsPage({
  params,
}: PageProps<"/[locale]/bookings">) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(localizedPath(locale, "/"));
  }

  const [user, upcomingBookings] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { timeZone: true },
    }),
    db.booking.findMany({
      where: {
        hostId: session.user.id,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: "asc" },
      include: {
        eventType: {
          select: { title: true, duration: true },
        },
      },
    }),
  ]);

  if (!user) {
    redirect(localizedPath(locale, "/"));
  }

  const t = await getTranslations("Bookings");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline">{user.timeZone}</Badge>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {upcomingBookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed bg-muted/20 p-12 text-center">
          <CalendarClock className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <CardTitle className="text-xl">{t("empty.title")}</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            {t("empty.description")}
          </CardDescription>
          <Link
            href={localizedPath(locale, "/event-types")}
            className={buttonVariants({ className: "mt-5" })}
          >
            {t("empty.action")}
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingBookings.map((booking) => {
            const display = formatBookingDateTime(
              booking.startTime,
              booking.endTime,
              user.timeZone,
              locale,
            );

            return (
              <Card key={booking.id} className="flex flex-col overflow-hidden">
                <div className="h-2 w-full bg-primary" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.eventType.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {t("duration", { minutes: booking.eventType.duration })}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.status === "ACCEPTED" ? "default" : "secondary"
                      }
                    >
                      {t(`status.${statusKeys[booking.status]}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="rounded-md border border-border/50 bg-muted/40 p-3">
                    <p className="text-sm font-medium">{display.date}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {display.timeRange}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {display.timeZone}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{booking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={`mailto:${booking.guestEmail}`}
                        className="truncate text-primary hover:underline"
                      >
                        {booking.guestEmail}
                      </a>
                    </div>
                    {booking.guestNotes && (
                      <div className="flex items-start gap-2 pt-1">
                        <AlignLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="line-clamp-2 italic text-muted-foreground">
                          &ldquo;{booking.guestNotes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
