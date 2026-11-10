import { cn, formatCurrency, formatSignedAmount } from "@/lib/utils";
import type { Transaction } from "@/types";

/**
 * Shows a signed amount. Direction is communicated by the sign and by
 * screen-reader text, not by color alone.
 */
export function TransactionAmount({
  transaction,
  className,
}: {
  transaction: Pick<Transaction, "amount" | "status">;
  className?: string;
}) {
  const { amount, status } = transaction;
  const reversed = status === "reversed";
  const direction = amount > 0 ? "money in" : "money out";

  return (
    <span className={cn("tabular whitespace-nowrap font-semibold", className)}>
      <span
        aria-hidden="true"
        className={cn(reversed ? "text-muted line-through" : amount > 0 ? "text-success-text" : "text-ink")}
      >
        {formatSignedAmount(amount)}
      </span>
      <span className="sr-only">
        {formatCurrency(Math.abs(amount))} {direction}
        {reversed ? ", reversed and not charged" : ""}
      </span>
    </span>
  );
}
