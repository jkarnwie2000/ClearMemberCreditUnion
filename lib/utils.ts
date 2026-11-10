/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Format a number as US dollars, e.g. 1234.5 → "$1,234.50". */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/**
 * Format a signed transaction amount with an explicit sign so meaning never
 * depends on color alone, e.g. -86.43 → "−$86.43", 2140.18 → "+$2,140.18".
 */
export function formatSignedAmount(amount: number): string {
  const formatted = currencyFormatter.format(Math.abs(amount));
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `−${formatted}`;
  return formatted;
}

/** Parse an ISO date (YYYY-MM-DD) or datetime as a local date without timezone shifting. */
export function parseLocalDate(value: string): Date {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (!timePart) return new Date(year, month - 1, day);
  const [hours = 0, minutes = 0] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/** "Nov 9, 2026" */
export function formatDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Monday, November 9, 2026" */
export function formatLongDate(value: string | Date): string {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "Nov 8, 9:15 AM" */
export function formatDateTime(value: string): string {
  return parseLocalDate(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Convert free text into a normalized, lowercase search string. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .trim();
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
