import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreatePollForm } from "@/components/create-poll-form";

vi.mock("@/app/actions/poll", () => ({
  createPoll: vi.fn(),
}));

function selectedTimes() {
  const form = screen.getByRole("button", { name: "submitBtn" }).closest("form");
  expect(form).not.toBeNull();
  return new FormData(form!).getAll("startHours");
}

describe("CreatePollForm", () => {
  it("toggles quick times into the submitted values", () => {
    render(<CreatePollForm locale="en" />);

    const quickTime = screen.getByRole("button", { name: "09:00" });
    fireEvent.click(quickTime);

    expect(quickTime).toHaveAttribute("aria-pressed", "true");
    expect(selectedTimes()).toEqual(["09:00"]);

    fireEvent.click(quickTime);
    expect(selectedTimes()).toEqual([]);
  });

  it("adds a custom time once and keeps submitted times sorted", () => {
    render(<CreatePollForm locale="en" />);

    const customTime = screen.getByLabelText("customTimeLabel");
    fireEvent.change(customTime, { target: { value: "08:30" } });
    fireEvent.click(screen.getByRole("button", { name: "addTime" }));
    fireEvent.click(screen.getByRole("button", { name: "09:00" }));

    fireEvent.change(customTime, { target: { value: "08:30" } });
    fireEvent.click(screen.getByRole("button", { name: "addTime" }));

    expect(selectedTimes()).toEqual(["08:30", "09:00"]);
  });
});
