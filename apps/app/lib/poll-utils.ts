// apps/app/lib/poll-utils.ts
import { AvailabilityStatus } from "@repo/db";

export interface SlotAvailability {
  status: AvailabilityStatus;
  participantName: string;
}

/**
 * Pure function to calculate weighted consensus score.
 * YES = 1.0, IF_NEEDED = 0.5, NO = 0.0
 */
export function calculateSlotScore(availabilities: SlotAvailability[]): number {
  const yesCount = availabilities.filter((a) => a.status === "YES").length;
  const maybeCount = availabilities.filter(
    (a) => a.status === "IF_NEEDED",
  ).length;

  return yesCount * 1.0 + maybeCount * 0.5;
}
