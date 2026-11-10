import { describe, expect, it } from "vitest";
import { getArticleBySlug } from "@/data/articles";
import { transactions } from "@/data/transactions";
import { getExplanationKind, getTransactionExplanation } from "@/lib/transaction-explanations";

const byId = (id: string) => transactions.find((transaction) => transaction.id === id)!;

describe("getExplanationKind", () => {
  it.each([
    ["txn-1004", "pending"],
    ["txn-1001", "hold"],
    ["txn-1031", "hold"],
    ["txn-1018", "transfer"],
    ["txn-1008", "transfer"],
    ["txn-1019", "fee"],
    ["txn-1010", "unfamiliar-merchant"],
    ["txn-1023", "reversed"],
    ["txn-1007", "deposit"],
    ["txn-1005", "posted"],
  ])("classifies %s as %s", (id, kind) => {
    expect(getExplanationKind(byId(id))).toBe(kind);
  });
});

describe("getTransactionExplanation", () => {
  it("produces all four explanation sections for every transaction", () => {
    for (const transaction of transactions) {
      const explanation = getTransactionExplanation(transaction);
      expect(explanation.whatHappened.length).toBeGreaterThan(20);
      expect(explanation.whyItMightHaveHappened.length).toBeGreaterThan(0);
      expect(explanation.whatItMeans.length).toBeGreaterThan(10);
      expect(explanation.whatToDoNext.length).toBeGreaterThan(0);
    }
  });

  it("only links to Help Center articles that exist", () => {
    for (const transaction of transactions) {
      for (const slug of getTransactionExplanation(transaction).relatedArticleSlugs) {
        expect(getArticleBySlug(slug), `${transaction.id} → ${slug}`).toBeDefined();
      }
    }
  });

  it("never promises a specific processing time for transfers", () => {
    for (const transaction of transactions.filter((item) => item.transfer)) {
      const text = JSON.stringify(getTransactionExplanation(transaction));
      expect(text).not.toMatch(/\d+\s*(business\s*)?(day|hour)s?/i);
      expect(text).not.toMatch(/will arrive (by|on|within)/i);
    }
  });

  it("explains hotel holds with the authorized amount", () => {
    const explanation = getTransactionExplanation(byId("txn-1002"));
    expect(explanation.headline).toMatch(/temporary hold from a hotel/i);
    expect(explanation.whatHappened).toContain("$150.00");
  });

  it("explains a released car rental hold", () => {
    const explanation = getTransactionExplanation(byId("txn-1031"));
    expect(explanation.headline).toMatch(/released/i);
    expect(explanation.whyItMightHaveHappened.join(" ")).toMatch(/rental car/i);
  });

  it("references the account's demo fee terms for maintenance fees", () => {
    const explanation = getTransactionExplanation(byId("txn-1015"));
    expect(explanation.whyItMightHaveHappened[0]).toMatch(/waived in any statement cycle/i);
    expect(explanation.whyItMightHaveHappened.join(" ")).toMatch(/can't confirm/i);
  });
});
