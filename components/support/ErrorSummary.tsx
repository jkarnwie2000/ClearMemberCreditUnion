import { CircleAlert } from "lucide-react";
import { forwardRef } from "react";

export interface SummaryError {
  fieldId: string;
  message: string;
}

/**
 * Lists every problem on the current step. Each item links to its field so
 * keyboard and screen reader users can jump straight to it.
 */
export const ErrorSummary = forwardRef<HTMLDivElement, { errors: SummaryError[] }>(function ErrorSummary({ errors }, ref) {
  if (errors.length === 0) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-heading"
      className="mb-6 rounded-xl border-2 border-error bg-error-50 p-4 focus:outline-none focus-visible:outline-3 focus-visible:outline-error"
    >
      <h3 id="error-summary-heading" className="flex items-center gap-2 font-semibold text-error-text">
        <CircleAlert aria-hidden="true" className="size-5" />
        {errors.length === 1 ? "There is 1 problem to fix" : `There are ${errors.length} problems to fix`}
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-7 text-sm">
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(error.fieldId)?.focus();
              }}
              className="font-medium text-error-text underline underline-offset-2"
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
