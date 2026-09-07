import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarCheck, Clock, Link as LinkIcon, Vote } from "lucide-react";
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
import { localizedPath } from "@/lib/navigation";

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(localizedPath(locale, "/"));
  }

  const [user, activeEventTypes, availabilityDays, upcomingBookings, polls] =
    await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, timeZone: true },
      }),
      db.eventType.count({
        where: { userId: session.user.id, isArchived: false },
      }),
      db.userAvailability.count({ where: { userId: session.user.id } }),
      db.booking.count({
        where: {
          hostId: session.user.id,
          startTime: { gte: new Date() },
          status: { not: "CANCELLED" },
        },
      }),
      db.poll.count({ where: { hostId: session.user.id } }),
    ]);

  if (!user) {
    redirect(localizedPath(locale, "/"));
  }

  const t = await getTranslations("Dashboard");
  const firstName = user.name?.split(" ")[0] ?? t("fallbackName");
  const readiness = [
    {
      complete: availabilityDays > 0,
      label: t("readiness.availability"),
      href: localizedPath(locale, "/availability"),
    },
    {
      complete: activeEventTypes > 0,
      label: t("readiness.eventType"),
      href: localizedPath(locale, "/event-types"),
    },
  ];
  const completedSteps = readiness.filter((step) => step.complete).length;

  const summaries = [
    {
      label: t("summary.eventTypes"),
      value: activeEventTypes,
      icon: LinkIcon,
      href: localizedPath(locale, "/event-types"),
    },
    {
      label: t("summary.availabilityDays"),
      value: availabilityDays,
      icon: Clock,
      href: localizedPath(locale, "/availability"),
    },
    {
      label: t("summary.upcomingBookings"),
      value: upcomingBookings,
      icon: CalendarCheck,
      href: localizedPath(locale, "/bookings"),
    },
    {
      label: t("summary.polls"),
      value: polls,
      icon: Vote,
      href: localizedPath(locale, "/create-poll"),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline">{user.timeZone}</Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section aria-labelledby="summary-heading" className="space-y-4">
        <h2 id="summary-heading" className="text-xl font-semibold">
          {t("summary.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaries.map((summary) => (
            <Link key={summary.label} href={summary.href}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {summary.label}
                  </CardTitle>
                  <summary.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{summary.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{t("readiness.title")}</CardTitle>
              <CardDescription>{t("readiness.description")}</CardDescription>
            </div>
            <Badge>{t("readiness.progress", { completed: completedSteps })}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {readiness.map((step) => (
            <div
              key={step.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="text-sm text-muted-foreground">
                  {step.complete
                    ? t("readiness.complete")
                    : t("readiness.incomplete")}
                </p>
              </div>
              <Link
                href={step.href}
                className={buttonVariants({
                  variant: step.complete ? "outline" : "default",
                  size: "sm",
                })}
              >
                {step.complete ? t("readiness.review") : t("readiness.configure")}
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href={localizedPath(locale, "/event-types")}
          className={buttonVariants()}
        >
          {t("actions.directScheduling")}
        </Link>
        <Link
          href={localizedPath(locale, "/create-poll")}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("actions.createPoll")}
        </Link>
      </div>
    </div>
  );
}
