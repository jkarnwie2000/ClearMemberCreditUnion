import { accounts } from "@/data/accounts";
import { transactions as allTransactions } from "@/data/transactions";
import type { Account, Transaction } from "@/types";

export function getAccountById(accountId: string): Account | undefined {
  return accounts.find((account) => account.id === accountId);
}

/** e.g. "Everyday Checking ****4821" */
export function getAccountLabel(accountId: string): string {
  const account = getAccountById(accountId);
  return account ? `${account.name} ${account.maskedNumber}` : "Unknown account";
}

/** Sum of pending transaction amounts (as a positive number) for an account. */
export function getPendingTotal(accountId: string, transactions: Transaction[] = allTransactions): number {
  const total = transactions
    .filter((transaction) => transaction.accountId === accountId && transaction.status === "pending")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  return Math.round(total * 100) / 100;
}

export function getPendingTransactions(accountId: string, transactions: Transaction[] = allTransactions): Transaction[] {
  return transactions.filter((transaction) => transaction.accountId === accountId && transaction.status === "pending");
}

export function getTotalBalance(accountList: Account[] = accounts): number {
  return accountList.reduce((sum, account) => sum + account.currentBalance, 0);
}
