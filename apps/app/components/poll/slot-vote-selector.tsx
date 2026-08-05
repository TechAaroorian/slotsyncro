// apps/app/components/poll/slot-vote-selector.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";

export type VoteStatus = "YES" | "IF_NEEDED" | "NO";

interface SlotVoteSelectorProps {
  slotId: string;
  formattedTime: string;
  currentStatus: VoteStatus;
  onChange: (slotId: string, status: VoteStatus) => void;
}

export function SlotVoteSelector({
  slotId,
  formattedTime,
  currentStatus,
  onChange,
}: SlotVoteSelectorProps) {
  const t = useTranslations("PollVoting.status");

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <span className="text-sm font-medium">{formattedTime}</span>
      <div className="inline-flex p-1 bg-muted rounded-md gap-1">
        <button
          type="button"
          onClick={() => onChange(slotId, "YES")}
          className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
            currentStatus === "YES"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("yes")}
        </button>
        <button
          type="button"
          onClick={() => onChange(slotId, "IF_NEEDED")}
          className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
            currentStatus === "IF_NEEDED"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("ifNeeded")}
        </button>
        <button
          type="button"
          onClick={() => onChange(slotId, "NO")}
          className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
            currentStatus === "NO"
              ? "bg-zinc-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("no")}
        </button>
      </div>
    </div>
  );
}
