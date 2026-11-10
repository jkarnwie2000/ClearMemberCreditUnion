import { CircleAlert, CircleCheck, Clock, Hourglass, Inbox, RotateCcw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supportRequestStatusMeta, transactionStatusMeta, transferStageMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { SupportRequestStatus, TransactionStatus, TransferStage } from "@/types";

type Tone = "success" | "warning" | "info" | "neutral" | "error";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-50 text-success-text ring-success/30",
  warning: "bg-warning-50 text-warning-text ring-warning/40",
  info: "bg-brand-50 text-brand-dark ring-brand/25",
  neutral: "bg-slate-100 text-slate-700 ring-slate-300",
  error: "bg-error-50 text-error-text ring-error/30",
};

function Badge({ tone, icon: Icon, label, className }: { tone: Tone; icon: LucideIcon; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
      {label}
    </span>
  );
}

const transactionStatusStyle: Record<TransactionStatus, { tone: Tone; icon: LucideIcon }> = {
  posted: { tone: "success", icon: CircleCheck },
  pending: { tone: "warning", icon: Clock },
  processing: { tone: "info", icon: Hourglass },
  reversed: { tone: "neutral", icon: RotateCcw },
};

export function TransactionStatusBadge({ status, className }: { status: TransactionStatus; className?: string }) {
  const style = transactionStatusStyle[status];
  return <Badge tone={style.tone} icon={style.icon} label={transactionStatusMeta[status].label} className={className} />;
}

const transferStageStyle: Record<TransferStage, { tone: Tone; icon: LucideIcon }> = {
  initiated: { tone: "neutral", icon: Send },
  processing: { tone: "info", icon: Hourglass },
  completed: { tone: "success", icon: CircleCheck },
  delayed: { tone: "error", icon: CircleAlert },
};

export function TransferStageBadge({ stage }: { stage: TransferStage }) {
  const style = transferStageStyle[stage];
  return <Badge tone={style.tone} icon={style.icon} label={transferStageMeta[stage].label} />;
}

const supportStatusStyle: Record<SupportRequestStatus, { tone: Tone; icon: LucideIcon }> = {
  submitted: { tone: "neutral", icon: Inbox },
  "in-review": { tone: "info", icon: Hourglass },
  resolved: { tone: "success", icon: CircleCheck },
};

export function SupportStatusBadge({ status }: { status: SupportRequestStatus }) {
  const style = supportStatusStyle[status];
  return <Badge tone={style.tone} icon={style.icon} label={supportRequestStatusMeta[status].label} />;
}
