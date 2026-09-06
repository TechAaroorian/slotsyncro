// apps/app/components/poll/poll-voting-form.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";
import { SlotVoteSelector, VoteStatus } from "./slot-vote-selector";
import { submitPollVotes } from "@/app/actions/poll";

interface SlotItem {
  id: string;
  formattedTime: string;
}

interface PollVotingFormProps {
  pollId: string;
  slots: SlotItem[];
  initialParticipant?: {
    name: string;
    email: string;
  };
}

export function PollVotingForm({
  pollId,
  slots,
  initialParticipant,
}: PollVotingFormProps) {
  const t = useTranslations("PollVoting");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [participantName, setParticipantName] = useState(
    initialParticipant?.name ?? "",
  );
  const [participantEmail, setParticipantEmail] = useState(
    initialParticipant?.email ?? "",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setSuccessMessage(null);

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

        if (!result.success) {
          setErrorMessage(
            result.error === "INVALID_SUBMISSION"
              ? t("invalidSubmissionError")
              : t("submitError"),
          );
          return;
        }

        setSuccessMessage(t("successMessage"));
        router.refresh();
      } catch {
        setErrorMessage(t("submitError"));
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-busy={isPending}
    >
      {initialParticipant && (
        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          {t("votingAs", {
            identity:
              participantName || participantEmail || t("signedInParticipant"),
          })}
        </p>
      )}

      {/* Participant Identity Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="participant-name" className="text-sm font-medium">
            {t("yourName")} *
          </label>
          <input
            id="participant-name"
            name="participantName"
            type="text"
            autoComplete="name"
            required
            placeholder={t("namePlaceholder")}
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="participant-email" className="text-sm font-medium">
            {t("emailOptional")}
          </label>
          <input
            id="participant-email"
            name="participantEmail"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={participantEmail}
            onChange={(e) => setParticipantEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Slot Voting Options */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{t("slotAvailability")}</legend>
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
      </fieldset>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-300"
        >
          {successMessage}
        </div>
      )}

      <div className="sticky bottom-3 z-10 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70 sm:ml-auto sm:w-auto"
        >
          {isPending && (
            <LoaderCircle
              data-testid="vote-submit-spinner"
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
            />
          )}
          {isPending ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
