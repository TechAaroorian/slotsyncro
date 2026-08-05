// apps/app/components/poll/poll-voting-form.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlotVoteSelector, VoteStatus } from "./slot-vote-selector";
import { submitPollVotes } from "@/app/actions/poll";

interface SlotItem {
  id: string;
  formattedTime: string;
}

interface PollVotingFormProps {
  pollId: string;
  slots: SlotItem[];
}

export function PollVotingForm({ pollId, slots }: PollVotingFormProps) {
  const t = useTranslations("PollVoting");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize all slots to "YES" by default
  const [votes, setVotes] = useState<Record<string, VoteStatus>>(() => {
    const initial: Record<string, VoteStatus> = {};
    slots.forEach((s) => {
      initial[s.id] = "YES";
    });
    return initial;
  });

  const handleStatusChange = (slotId: string, status: VoteStatus) => {
    setVotes((prev) => ({
      ...prev,
      [slotId]: status,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!participantName.trim()) {
      setErrorMessage(t("nameRequiredError"));
      return;
    }

    const votePayload = Object.entries(votes).map(([slotId, status]) => ({
      slotId,
      status,
    }));

    startTransition(async () => {
      try {
        const result = await submitPollVotes({
          pollId,
          participantName: participantName.trim(),
          participantEmail: participantEmail.trim() || undefined,
          votes: votePayload,
        });

        if (result.success) {
          router.refresh();
        }
      } catch {
        setErrorMessage(t("submitError"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Participant Identity Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("yourName")} *</label>
          <input
            type="text"
            required
            placeholder={t("namePlaceholder")}
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("emailOptional")}</label>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={participantEmail}
            onChange={(e) => setParticipantEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Slot Voting Options */}
      <div className="space-y-3">
        <label className="text-sm font-medium">{t("slotAvailability")}</label>
        <div className="space-y-2">
          {slots.map((slot) => (
            <SlotVoteSelector
              key={slot.id}
              slotId={slot.id}
              formattedTime={slot.formattedTime}
              currentStatus={votes[slot.id] || "YES"}
              onChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
