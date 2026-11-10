import {
  Banknote,
  Building2,
  Dumbbell,
  Fuel,
  Hammer,
  Landmark,
  Lightbulb,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  ArrowLeftRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionCategory } from "@/types";

const categoryIcons: Record<TransactionCategory, LucideIcon> = {
  Groceries: ShoppingCart,
  "Gas & Fuel": Fuel,
  Dining: Utensils,
  Subscriptions: Repeat,
  Shopping: ShoppingBag,
  Travel: Plane,
  Utilities: Lightbulb,
  "Health & Fitness": Dumbbell,
  Home: Hammer,
  "Cash & ATM": Banknote,
  Income: Building2,
  Dividends: PiggyBank,
  Transfers: ArrowLeftRight,
  Fees: Receipt,
};

export function CategoryIcon({ category, className }: { category: TransactionCategory; className?: string }) {
  const Icon = categoryIcons[category] ?? Landmark;
  const tone =
    category === "Fees"
      ? "bg-error-50 text-error-text"
      : category === "Income" || category === "Dividends"
        ? "bg-success-50 text-success-text"
        : category === "Transfers"
          ? "bg-brand-50 text-brand"
          : "bg-teal-50 text-teal-text";
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", tone, className)}>
      <Icon aria-hidden="true" className="size-5" />
    </span>
  );
}
