import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SupportRequestWizard } from "@/components/support/SupportRequestWizard";
import { REFERENCE_NUMBER_PATTERN } from "@/lib/support";
import { SUPPORT_DRAFT_KEY } from "@/lib/support-draft";
import { SENSITIVE_NUMBER_MESSAGE } from "@/lib/validation";

const stepHeading = () => screen.getByRole("heading", { level: 2 });
const continueButton = () => screen.getByRole("button", { name: /Continue/ });

async function completeTopicStep(user: UserEvent, topic = /Pending transaction/) {
  await user.click(screen.getByRole("radio", { name: topic }));
  await user.click(continueButton());
}

async function completeDetailsStep(user: UserEvent) {
  await user.type(screen.getByLabelText(/^Subject/), "Hotel hold still showing");
  await user.type(
    screen.getByLabelText(/^Describe your question/),
    "The Harborview Inn hold from November 8 is still pending after checkout.",
  );
  await user.selectOptions(screen.getByLabelText(/^Related account/), "acc-checking");
  await user.selectOptions(screen.getByLabelText(/^Related transaction/), "txn-1002");
  await user.click(continueButton());
}

async function completeContactStep(user: UserEvent) {
  await user.click(screen.getByRole("radio", { name: /^Secure message/ }));
  await user.click(screen.getByRole("radio", { name: /^Afternoon/ }));
  await user.click(continueButton());
}

function setup() {
  const user = userEvent.setup();
  render(<SupportRequestWizard />);
  return { user };
}

describe("Support request workflow", () => {
  it("starts on step 1 with an accessible progress indicator", () => {
    setup();
    expect(stepHeading()).toHaveTextContent("Select a support topic");
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    const progress = screen.getByRole("navigation", { name: "Support request progress" });
    expect(within(progress).getByText(/Step 1: Topic \(current step\)/)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(8);
  });

  it("prevents moving on until a topic is chosen and explains why", async () => {
    const { user } = setup();
    await user.click(continueButton());

    expect(stepHeading()).toHaveTextContent("Select a support topic");
    const summary = screen.getByRole("alert");
    expect(summary).toHaveTextContent("There is 1 problem to fix");
    expect(summary).toHaveTextContent("Choose the topic that best describes your question.");
    expect(summary).toHaveFocus();

    // The summary link moves focus to the field.
    await user.click(within(summary).getByRole("link"));
    expect(screen.getAllByRole("radio")[0]).toHaveFocus();
  });

  it("advances through the steps when the information is valid", async () => {
    const { user } = setup();
    await completeTopicStep(user);
    expect(stepHeading()).toHaveTextContent("Provide details");
    expect(stepHeading()).toHaveFocus();

    await completeDetailsStep(user);
    expect(stepHeading()).toHaveTextContent("Contact preferences");

    await completeContactStep(user);
    expect(stepHeading()).toHaveTextContent("Review and submit");
  });

  it("shows field-level validation messages linked to their inputs", async () => {
    const { user } = setup();
    await completeTopicStep(user);
    await user.type(screen.getByLabelText(/^Subject/), "Hi");
    await user.click(continueButton());

    expect(stepHeading()).toHaveTextContent("Provide details");
    expect(screen.getByRole("alert")).toHaveTextContent("There are 3 problems to fix");

    const subject = screen.getByLabelText(/^Subject/);
    expect(subject).toHaveAttribute("aria-invalid", "true");
    expect(subject).toHaveAccessibleDescription(/Enter a subject of at least 5 characters\./);
    expect(screen.getByLabelText(/^Describe your question/)).toHaveAccessibleDescription(
      /Describe your question in at least 20 characters/,
    );
    expect(screen.getByLabelText(/^Related account/)).toHaveAccessibleDescription(/Choose the account this is about\./);
  });

  it("rejects full card or account numbers in the description", async () => {
    const { user } = setup();
    await completeTopicStep(user);
    await user.type(screen.getByLabelText(/^Subject/), "Card question");
    await user.type(screen.getByLabelText(/^Describe your question/), "My card number is 4111 1111 1111 1111 and it was declined.");
    await user.selectOptions(screen.getByLabelText(/^Related account/), "acc-checking");
    await user.click(continueButton());

    expect(stepHeading()).toHaveTextContent("Provide details");
    expect(screen.getByLabelText(/^Describe your question/)).toHaveAccessibleDescription(new RegExp(SENSITIVE_NUMBER_MESSAGE.slice(0, 40)));
  });

  it("requires a valid email when email is the response method", async () => {
    const { user } = setup();
    await completeTopicStep(user);
    await completeDetailsStep(user);

    await user.click(screen.getByRole("radio", { name: /^Email/ }));
    const email = screen.getByLabelText(/^Email address/);
    await user.clear(email);
    await user.type(email, "alex@");
    await user.click(screen.getByRole("radio", { name: /^Morning/ }));
    await user.click(continueButton());

    expect(stepHeading()).toHaveTextContent("Contact preferences");
    expect(email).toHaveAccessibleDescription(/Enter a valid email address/);

    await user.clear(email);
    await user.type(email, "alex@example.com");
    await user.click(continueButton());
    expect(stepHeading()).toHaveTextContent("Review and submit");
  });

  it("navigates backward without losing answers", async () => {
    const { user } = setup();
    await completeTopicStep(user, /Account fee/);
    await user.type(screen.getByLabelText(/^Subject/), "Question about a fee");

    await user.click(screen.getByRole("button", { name: /Back/ }));
    expect(stepHeading()).toHaveTextContent("Select a support topic");
    expect(screen.getByRole("radio", { name: /Account fee/ })).toBeChecked();

    await user.click(continueButton());
    expect(screen.getByLabelText(/^Subject/)).toHaveValue("Question about a fee");
  });

  it("lets the member edit a section from the review step", async () => {
    const { user } = setup();
    await completeTopicStep(user);
    await completeDetailsStep(user);
    await completeContactStep(user);

    const details = screen.getByRole("region", { name: "Details" });
    expect(details).toHaveTextContent("Hotel hold still showing");
    expect(details).toHaveTextContent("Everyday Checking ****4821");
    expect(details).toHaveTextContent("Harborview Inn");

    await user.click(within(details).getByRole("button", { name: /Edit details/ }));
    expect(stepHeading()).toHaveTextContent("Provide details");
    const subject = screen.getByLabelText(/^Subject/);
    await user.clear(subject);
    await user.type(subject, "Hotel hold after checkout");
    await user.click(continueButton());
    await user.click(continueButton());
    expect(screen.getByRole("region", { name: "Details" })).toHaveTextContent("Hotel hold after checkout");
  });

  it("submits a valid request and shows a demonstration confirmation", async () => {
    const { user } = setup();
    await completeTopicStep(user);
    await completeDetailsStep(user);
    await completeContactStep(user);
    expect(window.localStorage.getItem(SUPPORT_DRAFT_KEY)).not.toBeNull();

    await user.click(screen.getByRole("button", { name: /Submit request/ }));

    const heading = screen.getByRole("heading", { name: "Request submitted (demonstration)" });
    expect(heading).toHaveFocus();
    expect(screen.getByTestId("reference-number").textContent).toMatch(REFERENCE_NUMBER_PATTERN);
    expect(screen.getByRole("note")).toHaveTextContent("No support ticket was created or transmitted");
    // The saved draft is cleared after a successful submission.
    expect(window.localStorage.getItem(SUPPORT_DRAFT_KEY)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Start another request" }));
    expect(stepHeading()).toHaveTextContent("Select a support topic");
    expect(screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
  });

  it("pre-fills the topic and transaction when opened from a transaction", async () => {
    const user = userEvent.setup();
    render(<SupportRequestWizard prefill={{ topic: "transfer-delay", accountId: "acc-checking", transactionId: "txn-1018" }} />);
    expect(screen.getByRole("radio", { name: /Transfer delay/ })).toBeChecked();
    await user.click(continueButton());
    expect(screen.getByLabelText(/^Related account/)).toHaveValue("acc-checking");
    expect(screen.getByLabelText(/^Related transaction/)).toHaveValue("txn-1018");
  });
});
