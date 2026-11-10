import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <nav aria-label="Support request progress">
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={label} aria-current={isCurrent ? "step" : undefined} className="flex flex-col gap-2">
              <span
                aria-hidden="true"
                className={cn("h-1.5 rounded-full", isComplete || isCurrent ? "bg-brand" : "bg-line")}
              />
              <span className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem]",
                    isComplete && "bg-brand text-white",
                    isCurrent && "bg-white text-brand ring-2 ring-brand",
                    !isComplete && !isCurrent && "bg-line text-muted",
                  )}
                >
                  {isComplete ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                </span>
                <span className={cn("hidden sm:inline", isCurrent ? "text-navy" : "text-muted")}>{label}</span>
                <span className="sr-only">
                  {`Step ${index + 1}: ${label}`}
                  {isComplete ? " (completed)" : isCurrent ? " (current step)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
