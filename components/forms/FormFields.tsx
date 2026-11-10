import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export function fieldIds(id: string) {
  return { hint: `${id}-hint`, error: `${id}-error` };
}

function describedBy(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = fieldIds(id);
  const parts = [hint ? ids.hint : null, error ? ids.error : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/** Error text with an icon and "Error:" prefix so it never relies on color alone. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-error-text">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>
        <span className="sr-only">Error: </span>
        {message}
      </span>
    </p>
  );
}

function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-ink">
      {label}
      {required ? <span className="font-normal text-muted"> (required)</span> : <span className="font-normal text-muted"> (optional)</span>}
    </label>
  );
}

interface BaseFieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  registration: UseFormRegisterReturn;
}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  registration,
  type = "text",
  autoComplete,
  inputMode,
}: BaseFieldProps & {
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
}) {
  const ids = fieldIds(id);
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      {hint ? (
        <p id={ids.hint} className="mb-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className="input"
        {...registration}
      />
      <FieldError id={ids.error} message={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required,
  registration,
  rows = 5,
  footer,
}: BaseFieldProps & { rows?: number; footer?: ReactNode }) {
  const ids = fieldIds(id);
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      {hint ? (
        <div id={ids.hint} className="mb-1.5 text-sm text-muted">
          {hint}
        </div>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className="input resize-y leading-relaxed"
        {...registration}
      />
      {footer}
      <FieldError id={ids.error} message={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  registration,
  children,
}: BaseFieldProps & { children: ReactNode }) {
  const ids = fieldIds(id);
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      {hint ? (
        <p id={ids.hint} className="mb-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className="input"
        {...registration}
      >
        {children}
      </select>
      <FieldError id={ids.error} message={error} />
    </div>
  );
}

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * A group of radio buttons styled as selectable cards. The first radio carries
 * the group's id so error-summary links can move focus into the group.
 */
export function RadioCardGroup({
  id,
  legend,
  hint,
  error,
  required,
  registration,
  options,
  selectedValue,
  columns = 2,
}: Omit<BaseFieldProps, "label"> & {
  legend: string;
  options: RadioOption[];
  selectedValue: string;
  columns?: 1 | 2;
}) {
  const ids = fieldIds(id);
  return (
    <fieldset aria-describedby={describedBy(id, hint, error)} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 text-sm font-semibold text-ink">
        {legend}
        {required ? <span className="font-normal text-muted"> (required)</span> : null}
      </legend>
      {hint ? (
        <p id={ids.hint} className="mb-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")}>
        {options.map((option, index) => {
          const optionId = index === 0 ? id : `${id}-${option.value}`;
          const checked = selectedValue === option.value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
                checked ? "border-brand bg-brand-50 ring-1 ring-brand" : "border-line-strong bg-white hover:bg-canvas",
                error && !checked && "border-error/60",
              )}
            >
              <input
                id={optionId}
                type="radio"
                value={option.value}
                className="mt-0.5 size-4 shrink-0 accent-brand focus-visible:outline-none"
                {...registration}
              />
              <span>
                <span className="block font-semibold text-ink">{option.label}</span>
                {option.description ? <span className="mt-0.5 block text-sm text-muted">{option.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={ids.error} message={error} />
    </fieldset>
  );
}
