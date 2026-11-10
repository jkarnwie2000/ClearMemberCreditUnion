import { describe, expect, it } from "vitest";
import { accounts } from "@/data/accounts";
import { transactions } from "@/data/transactions";
import { getPendingTotal } from "@/lib/accounts";
import {
  countActiveFilters,
  defaultFilters,
  filterTransactions,
  getFilterRangeIssues,
  matchesQuery,
  sortTransactions,
} from "@/lib/transactions";

const ids = (list: { id: string }[]) => list.map((item) => item.id);

describe("transaction search", () => {
  it("matches merchant names case-insensitively", () => {
    const results = filterTransactions(transactions, { ...defaultFilters, query: "freshmart" });
    expect(ids(results).sort()).toEqual(["txn-1005", "txn-1025"]);
  });

  it("matches by amount, with or without a dollar sign", () => {
    expect(ids(filterTransactions(transactions, { ...defaultFilters, query: "86.43" }))).toEqual(["txn-1005"]);
    expect(ids(filterTransactions(transactions, { ...defaultFilters, query: "$212.45" }))).toEqual(["txn-1027"]);
  });

  it("matches by reference number and category", () => {
    expect(ids(filterTransactions(transactions, { ...defaultFilters, query: "CM2610290038" }))).toEqual(["txn-1019"]);
    const fees = filterTransactions(transactions, { ...defaultFilters, query: "fees" });
    expect(fees.every((transaction) => transaction.category === "Fees")).toBe(true);
    expect(fees).toHaveLength(4);
  });

  it("finds an unfamiliar descriptor by the business it may belong to", () => {
    const match = transactions.find((transaction) => transaction.id === "txn-1010")!;
    expect(matchesQuery(match, "morningside")).toBe(true);
  });

  it("requires every word in the query to match", () => {
    expect(filterTransactions(transactions, { ...defaultFilters, query: "quickfuel pending" })).toHaveLength(1);
  });
});

describe("transaction filters", () => {
  it("combines account, type, and amount filters", () => {
    const results = filterTransactions(transactions, {
      ...defaultFilters,
      accountId: "acc-checking",
      type: "fee",
      amountMin: "20",
    });
    expect(ids(results).sort()).toEqual(["txn-1019", "txn-1021"]);
  });

  it("filters by an inclusive date range", () => {
    const results = filterTransactions(transactions, { ...defaultFilters, dateFrom: "2026-11-08", dateTo: "2026-11-08" });
    expect(results.every((transaction) => transaction.transactionDate === "2026-11-08")).toBe(true);
    expect(ids(results).sort()).toEqual(["txn-1002", "txn-1003"]);
  });

  it("counts active filters and reports impossible ranges", () => {
    const filters = { ...defaultFilters, status: "pending" as const, amountMin: "50", amountMax: "10" };
    expect(countActiveFilters(filters)).toBe(3);
    expect(getFilterRangeIssues(filters)).toContain("The minimum amount is greater than the maximum amount.");
  });
});

describe("sorting", () => {
  it("sorts by newest, oldest, highest, and lowest amount", () => {
    expect(sortTransactions(transactions, "newest")[0].transactionDate).toBe("2026-11-09");
    expect(sortTransactions(transactions, "oldest")[0].transactionDate).toBe("2026-10-13");
    expect(Math.abs(sortTransactions(transactions, "highest")[0].amount)).toBe(2140.18);
    expect(Math.abs(sortTransactions(transactions, "lowest")[0].amount)).toBe(2.21);
  });
});

describe("synthetic data consistency", () => {
  it("explains the checking balance difference with pending transactions", () => {
    const checking = accounts.find((account) => account.id === "acc-checking")!;
    expect(getPendingTotal("acc-checking")).toBeCloseTo(checking.currentBalance - checking.availableBalance, 2);
  });

  it("uses unique transaction IDs and references", () => {
    expect(new Set(ids(transactions)).size).toBe(transactions.length);
    expect(new Set(transactions.map((transaction) => transaction.reference)).size).toBe(transactions.length);
  });

  it("only links to related transactions that exist", () => {
    const known = new Set(ids(transactions));
    for (const transaction of transactions) {
      for (const relatedId of transaction.relatedTransactionIds ?? []) expect(known.has(relatedId)).toBe(true);
    }
  });
});
