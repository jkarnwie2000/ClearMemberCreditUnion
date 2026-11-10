import type { Metadata } from "next";
import { AccountDetailsCard } from "@/components/accounts/AccountDetailsCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { accounts } from "@/data/accounts";
import { getTotalBalance } from "@/lib/accounts";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Accounts",
  description: "Balances, account details, and fee terms for your ClearMember accounts.",
};

export default function AccountsPage() {
  return (
    <>
      <PageHeader
        title="Accounts"
        description={
          <>
            You have {accounts.length} accounts with a total current balance of{" "}
            <span className="tabular font-semibold text-ink">{formatCurrency(getTotalBalance())}</span>.
          </>
        }
      />
      <div className="space-y-6">
        {accounts.map((account) => (
          <AccountDetailsCard key={account.id} account={account} />
        ))}
      </div>
    </>
  );
}
