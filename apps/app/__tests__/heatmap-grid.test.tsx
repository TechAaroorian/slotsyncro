// apps/app/__tests__/heatmap-grid.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeatmapGrid, SlotSummary } from "@/components/poll/heatmap-grid";

// Mock next-intl translations without explicit 'any'
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (key === "badges.yes") return `${params?.count} Yes`;
    if (key === "badges.maybe") return `${params?.count} Maybe`;
    if (key === "badges.no") return `${params?.count} No`;
    if (key === "scoreLabel") return `${params?.score}/${params?.total} pts`;
    return key;
  },
}));

describe("components/poll/HeatmapGrid", () => {
  const mockSlots: SlotSummary[] = [
    {
      slotId: "slot-1",
      formattedTime: "Mon, Aug 10, 9:00 AM",
      votes: [
        { participantName: "Alice", status: "YES" },
        { participantName: "Bob", status: "IF_NEEDED" },
      ],
    },
  ];

  it("renders slot formatted time and score summary", () => {
    render(<HeatmapGrid slots={mockSlots} totalParticipants={2} />);

    expect(screen.getByText("Mon, Aug 10, 9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("1 Yes")).toBeInTheDocument();
    expect(screen.getByText("1 Maybe")).toBeInTheDocument();
    expect(screen.getByText("1.5/2 pts")).toBeInTheDocument();
  });

  it("triggers onSelectSlot callback when a card is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <HeatmapGrid
        slots={mockSlots}
        totalParticipants={2}
        onSelectSlot={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText("Mon, Aug 10, 9:00 AM"));
    expect(handleSelect).toHaveBeenCalledWith("slot-1");
  });
});
