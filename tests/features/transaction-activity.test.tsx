import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TransactionActivity } from "@/components/transactions/TransactionActivity";
import { transactions } from "@/data/transactions";

const TOTAL = transactions.length;

function setup(props: Parameters<typeof TransactionActivity>[0] = {}) {
  const user = userEvent.setup();
  render(<TransactionActivity {...props} />);
  const resultsList = () => screen.queryByRole("list", { name: "Transactions" });
  const rows = () => (resultsList() ? within(resultsList()!).getAllByRole("listitem") : []);
  return { user, rows };
}

describe("Account Activity", () => {
  it("shows every transaction with a result count by default", () => {
    const { rows } = setup();
    expect(rows()).toHaveLength(TOTAL);
    expect(screen.getByText(`Showing ${TOTAL} of ${TOTAL} transactions`)).toBeInTheDocument();
  });

  it("searches transactions by merchant name as the member types", async () => {
    const { user, rows } = setup();
    await user.type(screen.getByLabelText("Search transactions"), "FreshMart");

    expect(rows()).toHaveLength(2);
    rows().forEach((row) => expect(row).toHaveTextContent("FreshMart Grocery #118"));
    expect(screen.getByText(`Showing 2 of ${TOTAL} transactions`)).toBeInTheDocument();
  });

  it("filters by transaction status", async () => {
    const { user, rows } = setup();
    await user.selectOptions(screen.getByLabelText("Status"), "pending");

    expect(rows()).toHaveLength(4);
    rows().forEach((row) => expect(row).toHaveTextContent("Pending"));
  });

  it("combines multiple filters with a search", async () => {
    const { user, rows } = setup();
    await user.selectOptions(screen.getByLabelText("Account"), "acc-checking");
    await user.selectOptions(screen.getByLabelText("Type"), "fee");
    expect(rows()).toHaveLength(4);

    await user.type(screen.getByLabelText("Minimum ($)"), "20");
    expect(rows()).toHaveLength(2);

    await user.type(screen.getByLabelText("Search transactions"), "overdraft");
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent("Overdraft Fee");

    // Active filters appear as removable chips.
    expect(screen.getByRole("button", { name: "Remove filter: Type: Fees" })).toBeInTheDocument();
  });

  it("clears all filters and the search at once", async () => {
    const { user, rows } = setup();
    await user.type(screen.getByLabelText("Search transactions"), "quickfuel");
    await user.selectOptions(screen.getByLabelText("Status"), "pending");
    expect(rows()).toHaveLength(1);

    const [clearAll] = screen.getAllByRole("button", { name: "Clear all filters" });
    await user.click(clearAll);

    expect(rows()).toHaveLength(TOTAL);
    expect(screen.getByLabelText("Search transactions")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("all");
  });

  it("shows a helpful message when nothing matches, and recovers", async () => {
    const { user, rows } = setup();
    await user.type(screen.getByLabelText("Search transactions"), "zebra rentals");

    expect(screen.getByRole("heading", { name: /No transactions match “zebra rentals”/ })).toBeInTheDocument();
    expect(rows()).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(rows()).toHaveLength(TOTAL);
  });

  it("warns when the amount range is impossible", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Minimum ($)"), "100");
    await user.type(screen.getByLabelText("Maximum ($)"), "10");
    expect(screen.getByRole("alert")).toHaveTextContent("The minimum amount is greater than the maximum amount.");
  });

  it("sorts by highest amount", async () => {
    const { user, rows } = setup();
    await user.selectOptions(screen.getByLabelText("Sort by"), "highest");
    expect(rows()[0]).toHaveTextContent("Brightline Logistics Payroll");
  });

  it("opens transaction details with an explanation, then closes with Escape and restores focus", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Search transactions"), "Harborview");
    const row = screen.getByRole("button", { name: /Harborview Inn/ });
    await user.click(row);

    const dialog = screen.getByRole("dialog", { name: "Harborview Inn" });
    expect(within(dialog).getByRole("heading", { name: "Understanding This Transaction" })).toBeInTheDocument();
    expect(within(dialog).getByText("CM2611080042")).toBeInTheDocument();
    expect(within(dialog).getByText("Not posted")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Submit a support request/ })).toHaveAttribute(
      "href",
      "/support/new?topic=pending-transaction&account=acc-checking&transaction=txn-1002",
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(row).toHaveFocus();
  });

  it("opens a transaction from the URL and navigates to related transactions", async () => {
    const user = userEvent.setup();
    render(<TransactionActivity initialSelectedId="txn-1019" />);

    const dialog = screen.getByRole("dialog", { name: "Overdraft Fee" });
    await user.click(within(dialog).getByRole("button", { name: /Northwind Utilities/ }));
    expect(screen.getByRole("dialog", { name: "Northwind Utilities" })).toBeInTheDocument();
  });
});
