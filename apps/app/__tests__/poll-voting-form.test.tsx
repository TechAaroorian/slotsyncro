import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitPollVotes } from "@/app/actions/poll";
import { PollVotingForm } from "@/components/poll/poll-voting-form";
import axe from "axe-core";

vi.mock("@/app/actions/poll", () => ({
  submitPollVotes: vi.fn(),
}));

const slots = [{ id: "slot-1", formattedTime: "Monday at 10:00 AM" }];

describe("PollVotingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has no detectable component-level accessibility violations", async () => {
    const { container } = render(
      <PollVotingForm pollId="poll-1" slots={slots} />,
    );
    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("announces successful vote submission", async () => {
    vi.mocked(submitPollVotes).mockResolvedValue({ success: true });
    render(<PollVotingForm pollId="poll-1" slots={slots} />);

    fireEvent.change(screen.getByLabelText(/yourName/), {
      target: { value: "Alex" },
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "successMessage",
    );
  });

  it("prefills and identifies a signed-in participant", () => {
    render(
      <PollVotingForm
        pollId="poll-1"
        slots={slots}
        initialParticipant={{ name: "Alex Rivera", email: "alex@example.com" }}
      />,
    );

    expect(screen.getByLabelText(/yourName/)).toHaveValue("Alex Rivera");
    expect(screen.getByLabelText(/emailOptional/)).toHaveValue(
      "alex@example.com",
    );
    expect(screen.getByText("votingAs")).toBeInTheDocument();
  });

  it("announces a returned server-action failure", async () => {
    vi.mocked(submitPollVotes).mockResolvedValue({
      success: false,
      error: "DATABASE_ERROR",
    });
    render(<PollVotingForm pollId="poll-1" slots={slots} />);

    fireEvent.change(screen.getByLabelText(/yourName/), {
      target: { value: "Alex" },
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("submitError");
    });
  });

  it("keeps visible pending feedback on the submit action", async () => {
    vi.mocked(submitPollVotes).mockImplementation(
      () => new Promise(() => undefined),
    );
    render(<PollVotingForm pollId="poll-1" slots={slots} />);

    fireEvent.change(screen.getByLabelText(/yourName/), {
      target: { value: "Alex" },
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    const pendingButton = await screen.findByRole("button", {
      name: "submitting",
    });
    expect(pendingButton).toBeDisabled();
    expect(screen.getByTestId("vote-submit-spinner")).toBeInTheDocument();
  });
});
