// apps/app/components/poll/heatmap-grid.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";

export interface ParticipantVote {
  participantName: string;
  status: "YES" | "IF_NEEDED" | "NO";
}

export interface SlotSummary {
  slotId: string;
  formattedTime: string;
  votes: ParticipantVote[];
}

interface HeatmapGridProps {
  slots: SlotSummary[];
  totalParticipants: number;
  onSelectSlot?: (slotId: string) => void;
}

export function HeatmapGrid({
  slots,
  totalParticipants,
  onSelectSlot,
}: HeatmapGridProps) {
  const t = useTranslations("PollHeatmap");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {slots.map((slot) => {
        const yesCount = slot.votes.filter((v) => v.status === "YES").length;
        const ifNeededCount = slot.votes.filter(
          (v) => v.status === "IF_NEEDED",
        ).length;
        const noCount = slot.votes.filter((v) => v.status === "NO").length;

        // Weighted score calculation (Yes = 1 point, If Needed = 0.5 points, No = 0 points)
        const score = yesCount + ifNeededCount * 0.5;
        const scoreRatio =
          totalParticipants > 0 ? score / totalParticipants : 0;

        // Dynamic Tailwind color intensity based on score ratio
        let bgStyle = "bg-zinc-100 border-zinc-200 text-zinc-900";
        if (scoreRatio >= 0.8) {
          bgStyle = "bg-emerald-600 text-white border-emerald-700";
        } else if (scoreRatio >= 0.5) {
          bgStyle = "bg-emerald-500/80 text-white border-emerald-600";
        } else if (ifNeededCount > yesCount && scoreRatio >= 0.3) {
          bgStyle = "bg-amber-500 text-white border-amber-600";
        } else if (scoreRatio > 0) {
          bgStyle = "bg-emerald-100 text-emerald-900 border-emerald-300";
        }

        return (
          <div
            key={slot.slotId}
            onClick={() => onSelectSlot?.(slot.slotId)}
            className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${bgStyle}`}
          >
            <div className="font-semibold text-base">{slot.formattedTime}</div>

            {/* Localized Vote Breakdown Badges */}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium flex-wrap">
              <span className="px-2 py-0.5 rounded bg-black/20 text-white">
                {t("badges.yes", { count: yesCount })}
              </span>
              {ifNeededCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-400/30 text-white">
                  {t("badges.maybe", { count: ifNeededCount })}
                </span>
              )}
              {noCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-black/10 text-white/80">
                  {t("badges.no", { count: noCount })}
                </span>
              )}
            </div>

            {/* Localized Consensus Points Summary */}
            <div className="mt-2 text-xs opacity-90">
              {t("scoreLabel", { score, total: totalParticipants })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
