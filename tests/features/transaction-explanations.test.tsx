import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionDetailPanel } from "@/components/transactions/TransactionDetailPanel";
import { transactions } from "@/data/transactions";

function openDetails(id: string) {
  const transaction = transactions.find((item) => item.id === id)!;
  render(<TransactionDetailPanel transaction={transaction} onClose={vi.fn()} onSelectTransaction={vi.fn()} />);
  const dialog = screen.getByRole("dialog", { name: transaction.merchantName });
  const explanation = within(dialog).getByRole("region", { name: "Understanding This Transaction" });
  return { dialog, explanation };
}

describe("Understanding This Transaction", () => {
  it("always follows the four-question structure", () => {
    const { explanation } = openDetails("txn-1005");
    for (const question of [
      "What happened?",
      "Why might this have happened?",
      "What does this mean for your account?",
      "What should you do next?",
    ]) {
      expect(within(explanation).getByRole("heading", { name: new RegExp(question.replace("?", "\\?")) })).toBeInTheDocument();
    }
  });

  it("explains pending transactions", () => {
    const { explanation } = openDetails("txn-1004");
    expect(explanation).toHaveAttribute("data-explanation-kind", "pending");
    expect(explanation).toHaveTextContent("This purchase is pending, which means it isn't final yet.");
    expect(explanation).toHaveTextContent("The final posted amount may be different from the pending amount");
    expect(explanation).toHaveTextContent("Your available balance has been reduced by this amount");
    expect(explanation).toHaveTextContent("can drop off without posting");
  });

  it("explains a gas station authorization hold", () => {
    const { dialog, explanation } = openDetails("txn-1001");
    expect(explanation).toHaveAttribute("data-explanation-kind", "hold");
    expect(explanation).toHaveTextContent("This is a temporary hold from a gas station, not a final charge.");
    expect(explanation).toHaveTextContent("Gas stations often authorize a set amount before you start pumping");
    expect(explanation).toHaveTextContent("may be lower or higher than $100.00");
    expect(within(dialog).getByText("Authorized hold")).toBeInTheDocument();
  });

  it("explains hotel holds in plain language", () => {
    const hotel = openDetails("txn-1002").explanation;
    expect(hotel).toHaveTextContent("Hotels commonly place a hold at check-in");
  });

  it("explains restaurant holds that may change when a tip is added", () => {
    const { explanation } = openDetails("txn-1003");
    expect(explanation).toHaveTextContent("Restaurants often authorize the bill amount before a tip is added.");
  });

  it("explains a released rental car hold and points to the final charge", () => {
    const { dialog, explanation } = openDetails("txn-1031");
    expect(explanation).toHaveTextContent("This was a temporary hold that has been released.");
    expect(explanation).toHaveTextContent("Rental car companies commonly place a hold at pickup");
    const related = within(dialog).getByRole("region", { name: "Related transactions" });
    expect(within(related).getByRole("button", { name: /Swiftway Car Rental/ })).toHaveTextContent("$212.45");
  });

  it("explains a delayed external transfer without promising a date", () => {
    const { dialog, explanation } = openDetails("txn-1018");
    expect(explanation).toHaveAttribute("data-explanation-kind", "transfer");
    expect(explanation).toHaveTextContent("This is an external transfer");
    expect(explanation).toHaveTextContent("weekends, holidays");
    expect(explanation).toHaveTextContent("We can't tell from this screen which of these applies");

    const timeline = within(dialog).getByRole("region", { name: "Transfer status" });
    expect(within(timeline).getAllByText("Delayed").length).toBeGreaterThan(0);
    expect(within(timeline).getByText("Initiated")).toBeInTheDocument();
    expect(timeline).toHaveTextContent("we won't guess one");
  });

  it("explains an internal transfer and links its matching entry", () => {
    const { dialog, explanation } = openDetails("txn-1008");
    expect(explanation).toHaveTextContent("This is an internal transfer");
    const related = within(dialog).getByRole("region", { name: "Related transactions" });
    expect(within(related).getByRole("button", { name: /Transfer from Everyday Checking/ })).toBeInTheDocument();
  });

  it.each([
    ["txn-1019", "overdraft fee", "Overdraft fees are charged when a transaction is paid"],
    ["txn-1013", "ATM fee", "outside our network"],
    ["txn-1015", "monthly maintenance fee", "waived in any statement cycle with at least one direct deposit"],
    ["txn-1021", "returned payment fee", "sent back unpaid"],
  ])("explains fees: %s (%s)", (id, name, phrase) => {
    const { explanation } = openDetails(id);
    expect(explanation).toHaveAttribute("data-explanation-kind", "fee");
    expect(explanation.textContent?.toLowerCase()).toContain(name.toLowerCase());
    expect(explanation).toHaveTextContent(phrase);
  });

  it("gives guidance for unfamiliar merchant descriptors and safe contact advice", () => {
    const { explanation } = openDetails("txn-1010");
    expect(explanation).toHaveAttribute("data-explanation-kind", "unfamiliar-merchant");
    expect(explanation).toHaveTextContent("The name on this transaction may not match the business you remember.");
    expect(explanation).toHaveTextContent("payment processor");
    expect(explanation).toHaveTextContent("Morningside Café");
    expect(explanation).toHaveTextContent("not a confirmation");
    expect(within(explanation).getByRole("note")).toHaveTextContent("verified official channel");
  });

  it("offers contextual actions and related Help Center articles", () => {
    const { dialog } = openDetails("txn-1010");
    expect(within(dialog).getByRole("link", { name: /View related transactions/ })).toHaveAttribute(
      "href",
      "/activity?q=CPX*MRNGSDE+CAFE",
    );
    expect(within(dialog).getByRole("link", { name: /Visit the Help Center/ })).toHaveAttribute("href", "/help");
    expect(within(dialog).getByRole("link", { name: "Identifying unfamiliar merchant names" })).toHaveAttribute(
      "href",
      "/help/unfamiliar-merchant-names",
    );
  });
});
