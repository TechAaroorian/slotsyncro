// apps/app/__tests__/slot-vote-selector.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SlotVoteSelector } from "@/components/poll/slot-vote-selector";

describe("components/poll/SlotVoteSelector", () => {
  it("renders status buttons and handles selection change", () => {
    const handleSelect = vi.fn();
    render(
      <SlotVoteSelector
        slotId="slot-1"
        formattedTime="Mon 10:00 AM"
        currentStatus="YES"
        onChange={handleSelect}
      />,
    );

    expect(screen.getByText("Mon 10:00 AM")).toBeInTheDocument();

    const maybeButton = screen.getByRole("button", {
      name: /if needed|maybe/i,
    });
    fireEvent.click(maybeButton);

    expect(handleSelect).toHaveBeenCalledWith("slot-1", "IF_NEEDED");
  });
});
