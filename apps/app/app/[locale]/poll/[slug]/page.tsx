// apps/app/app/[locale]/poll/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@repo/db";
import { HeatmapGrid } from "@/components/poll/heatmap-grid";
import { PollVotingForm } from "@/components/poll/poll-voting-form";

interface PollPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function PollPage({ params }: PollPageProps) {
  const { locale, slug } = await params;
  const tHeatmap = await getTranslations({ locale, namespace: "PollHeatmap" });
  const tVoting = await getTranslations({ locale, namespace: "PollVoting" });

  // Fetch poll, time slots, host details, and all existing votes
  const poll = await db.poll.findUnique({
    where: { slug },
    include: {
      host: {
        select: {
          name: true,
          image: true,
          username: true,
        },
      },
      slots: {
        orderBy: {
          startTime: "asc",
        },
        include: {
          availability: true,
        },
      },
      responses: true,
    },
  });

  if (!poll) {
    notFound();
  }

  // Extract unique participants who have voted
  const uniqueParticipants = Array.from(
    new Set(poll.responses.map((r) => r.participantName)),
  );

  // Format date-times using the active route locale
  const formatSlotTime = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));

  const heatmapSlots = poll.slots.map((slot) => ({
    slotId: slot.id,
    formattedTime: formatSlotTime(slot.startTime),
    votes: slot.availability.map((a) => ({
      participantName: a.participantName,
      status: a.status as "YES" | "IF_NEEDED" | "NO",
    })),
  }));

  const votingSlots = poll.slots.map((slot) => ({
    id: slot.id,
    formattedTime: formatSlotTime(slot.startTime),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Poll Header */}
      <div className="border-b pb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Hosted by</span>
          <span className="font-semibold text-foreground">
            {poll.host.name || `@${poll.host.username}`}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{poll.title}</h1>
        {poll.description && (
          <p className="text-muted-foreground text-base">{poll.description}</p>
        )}
      </div>

      {/* Group Availability Heatmap */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{tHeatmap("title")}</h2>
          <p className="text-sm text-muted-foreground">
            {uniqueParticipants.length === 0
              ? tHeatmap("noResponses")
              : tHeatmap("responsesCount", {
                  count: uniqueParticipants.length,
                })}
          </p>
        </div>

        <HeatmapGrid
          slots={heatmapSlots}
          totalParticipants={uniqueParticipants.length || 1}
        />
      </div>

      {/* Interactive Voting Form */}
      <div className="border rounded-2xl p-6 bg-card space-y-6">
        <div>
          <h2 className="text-xl font-semibold">{tVoting("title")}</h2>
          <p className="text-sm text-muted-foreground">{tVoting("subtitle")}</p>
        </div>

        <PollVotingForm pollId={poll.id} slots={votingSlots} />
      </div>
    </div>
  );
}
