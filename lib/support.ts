/**
 * Generate a synthetic support reference number, e.g. "CM-SR-20261110-4821".
 * The number is created locally and is not registered anywhere.
 */
export function generateReferenceNumber(now: Date = new Date(), random: () => number = Math.random): string {
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = String(Math.floor(random() * 9000) + 1000);
  return `CM-SR-${datePart}-${suffix}`;
}

export const REFERENCE_NUMBER_PATTERN = /^CM-SR-\d{8}-\d{4}$/;
