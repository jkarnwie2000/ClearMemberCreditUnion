import type { Account } from "@/types";

/**
 * Synthetic accounts. Everyday Checking's available balance is $300.00 lower
 * than its current balance because of four pending items in data/transactions.ts
 * that total $300.00 (see getPendingTotal in lib/accounts.ts).
 */
export const accounts: Account[] = [
  {
    id: "acc-checking",
    name: "Everyday Checking",
    type: "checking",
    maskedNumber: "****4821",
    currentBalance: 4825.6,
    availableBalance: 4525.6,
    openedDate: "2019-04-12",
    description: "Your primary account for debit card purchases, direct deposits, and bill payments.",
    statementCycle: "Statements are produced on the last day of each month.",
    feeTerms: {
      monthlyMaintenanceFee: 5,
      maintenanceFeeWaiver:
        "Waived in any statement cycle with at least one direct deposit or an average daily balance of $1,500 or more.",
      overdraftFee: 29,
      nonNetworkAtmFee: 3,
      returnedPaymentFee: 25,
    },
  },
  {
    id: "acc-savings",
    name: "High-Yield Savings",
    type: "savings",
    maskedNumber: "****1904",
    currentBalance: 12450,
    availableBalance: 12450,
    dividendRate: 3.75,
    openedDate: "2019-04-12",
    description: "Earns dividends monthly. A good home for your emergency fund.",
    statementCycle: "Dividends are credited on the last day of each month.",
  },
  {
    id: "acc-holiday",
    name: "Holiday Savings",
    type: "savings",
    maskedNumber: "****7732",
    currentBalance: 2150,
    availableBalance: 2150,
    dividendRate: 1.25,
    openedDate: "2023-01-05",
    description: "Set money aside throughout the year for holiday spending.",
    statementCycle: "Dividends are credited on the last day of each month.",
    goal: { label: "Holiday gifts and travel", targetAmount: 2500, targetDate: "2026-12-01" },
  },
];
