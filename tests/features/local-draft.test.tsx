import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SupportRequestWizard } from "@/components/support/SupportRequestWizard";
import { readDraft, writeDraft } from "@/hooks/useLocalDraft";
import {
  parseSupportDraft,
  SUPPORT_DRAFT_KEY,
  SUPPORT_DRAFT_VERSION,
  type SupportDraft,
} from "@/lib/support-draft";

function storedDraft(): { version: number; savedAt: string; data: SupportDraft } | null {
  const raw = window.localStorage.getItem(SUPPORT_DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function seedDraft(data: unknown, version = SUPPORT_DRAFT_VERSION) {
  window.localStorage.setItem(
    SUPPORT_DRAFT_KEY,
    JSON.stringify({ version, savedAt: "2026-11-09T15:30:00.000Z", data }),
  );
}

const stepHeading = () => screen.getByRole("heading", { level: 2 });

describe("Support request draft saving", () => {
  it("automatically saves progress to localStorage after the member stops typing", async () => {
    const user = userEvent.setup();
    render(<SupportRequestWizard />);

    await user.click(screen.getByRole("radio", { name: /Unrecognized merchant/ }));
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.type(screen.getByLabelText(/^Subject/), "Unknown CPX charge");

    await waitFor(() => expect(storedDraft()?.data.values.subject).toBe("Unknown CPX charge"), { timeout: 3000 });
    const draft = storedDraft()!;
    expect(draft.version).toBe(SUPPORT_DRAFT_VERSION);
    expect(draft.data.step).toBe(1);
    expect(draft.data.values.topic).toBe("unrecognized-merchant");
    expect(screen.getByText(/Draft saved at/)).toBeInTheDocument();
  });

  it("saves immediately with the Save draft button", async () => {
    const user = userEvent.setup();
    render(<SupportRequestWizard />);
    await user.click(screen.getByRole("radio", { name: /General inquiry/ }));
    await user.click(screen.getByRole("button", { name: /Save draft/ }));

    expect(storedDraft()?.data.values.topic).toBe("general-inquiry");
    expect(screen.getByText(/Draft saved at/)).toBeInTheDocument();
  });

  it("restores previously entered information and the current step", () => {
    seedDraft({ step: 1, values: { topic: "account-fee", subject: "Monthly fee question", accountId: "acc-checking" } });
    render(<SupportRequestWizard />);

    expect(stepHeading()).toHaveTextContent("Provide details");
    expect(screen.getByLabelText(/^Subject/)).toHaveValue("Monthly fee question");
    expect(screen.getByLabelText(/^Related account/)).toHaveValue("acc-checking");
    expect(screen.getByText(/We restored your saved draft, including the step you were on/)).toBeInTheDocument();
  });

  it("handles corrupted JSON without crashing and removes it", () => {
    window.localStorage.setItem(SUPPORT_DRAFT_KEY, "{not valid json");
    render(<SupportRequestWizard />);

    expect(stepHeading()).toHaveTextContent("Select a support topic");
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't read the draft saved in this browser");
    expect(window.localStorage.getItem(SUPPORT_DRAFT_KEY)).toBeNull();
  });

  it("handles drafts with an unexpected shape", () => {
    seedDraft({ step: 42, values: { subject: 12345 } });
    render(<SupportRequestWizard />);
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't read the draft");
    expect(window.localStorage.getItem(SUPPORT_DRAFT_KEY)).toBeNull();
  });

  it("discards drafts saved by an older version of the form", () => {
    seedDraft({ step: 2, values: { subject: "Old" } }, 0);
    render(<SupportRequestWizard />);
    expect(screen.getByRole("alert")).toHaveTextContent("older version of this form");
    expect(stepHeading()).toHaveTextContent("Select a support topic");
  });

  it("lets the member discard a draft after confirming", async () => {
    seedDraft({ step: 1, values: { topic: "general-inquiry", subject: "Something to discard" } });
    const user = userEvent.setup();
    render(<SupportRequestWizard />);

    await user.click(screen.getByRole("button", { name: /Discard draft/ }));
    await user.click(screen.getByRole("button", { name: "Yes, discard" }));

    expect(window.localStorage.getItem(SUPPORT_DRAFT_KEY)).toBeNull();
    expect(stepHeading()).toHaveTextContent("Select a support topic");
    expect(screen.getByText(/Your draft was discarded/)).toBeInTheDocument();
    expect(screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
  });

  it("clears the draft after a successful submission", async () => {
    seedDraft({
      step: 3,
      values: {
        topic: "transfer-delay",
        subject: "Summit Federal transfer",
        description: "My transfer from Summit Federal has been delayed for a week.",
        accountId: "acc-checking",
        transactionId: "txn-1018",
        responseMethod: "secure-message",
        contactTime: "anytime",
      },
    });
    const user = userEvent.setup();
    render(<SupportRequestWizard />);
    expect(stepHeading()).toHaveTextContent("Review and submit");

    await user.click(screen.getByRole("button", { name: /Submit request/ }));
    expect(screen.getByRole("heading", { name: "Request submitted (demonstration)" })).toBeInTheDocument();
    expect(window.localStorage.getItem(SUPPORT_DRAFT_KEY)).toBeNull();
  });

  it("sends the member back to fix a restored draft that is incomplete", async () => {
    seedDraft({ step: 3, values: { topic: "transfer-delay", subject: "Too short?" } });
    const user = userEvent.setup();
    render(<SupportRequestWizard />);

    await user.click(screen.getByRole("button", { name: /Submit request/ }));
    expect(stepHeading()).toHaveTextContent("Provide details");
    expect(screen.getByRole("alert")).toHaveTextContent(/problems? to fix/);
  });
});

describe("readDraft", () => {
  const parse = parseSupportDraft;

  it("returns nothing when no draft or no storage exists", () => {
    expect(readDraft(window.localStorage, SUPPORT_DRAFT_KEY, 1, parse)).toEqual({ draft: null, issue: null });
    expect(readDraft(undefined, SUPPORT_DRAFT_KEY, 1, parse)).toEqual({ draft: null, issue: null });
  });

  it("round-trips a draft written with writeDraft", () => {
    writeDraft(window.localStorage, SUPPORT_DRAFT_KEY, 1, { step: 2, values: { subject: "Saved" } });
    const { draft, issue } = readDraft(window.localStorage, SUPPORT_DRAFT_KEY, 1, parse);
    expect(issue).toBeNull();
    expect(draft?.data).toEqual({ step: 2, values: { subject: "Saved" } });
  });

  it("survives storage that throws on access", () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error("SecurityError");
      },
    } as unknown as Storage;
    expect(readDraft(throwingStorage, SUPPORT_DRAFT_KEY, 1, parse)).toEqual({ draft: null, issue: null });
  });

  it("flags envelopes missing a version as corrupted", () => {
    window.localStorage.setItem(SUPPORT_DRAFT_KEY, JSON.stringify({ data: { step: 0, values: {} } }));
    expect(readDraft(window.localStorage, SUPPORT_DRAFT_KEY, 1, parse).issue).toBe("corrupted");
  });
});
