import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h2" | "h3";
}

export function EmptyState({ icon: Icon, title, description, actions, headingLevel = "h2" }: EmptyStateProps) {
  const Heading = headingLevel;
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <Heading className="text-lg font-semibold text-ink">{title}</Heading>
      <div className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted">{description}</div>
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
