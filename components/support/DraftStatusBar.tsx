"use client";

import { CircleAlert, CircleCheck, Save, Trash2, CloudOff, PencilLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { DraftSaveStatus } from "@/hooks/useLocalDraft";

interface DraftStatusBarProps {
  status: DraftSaveStatus;
  lastSavedAt: string | null;
  canDiscard: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

function statusText(status: DraftSaveStatus, lastSavedAt: string | null): string {
  switch (status) {
    case "saved":
      return lastSavedAt
        ? `Draft saved at ${new Date(lastSavedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
        : "Draft saved";
    case "unsaved":
      return "Saving draft…";
    case "error":
      return "Couldn't save your draft in this browser";
    case "idle":
      return "No draft saved yet";
  }
}

export function DraftStatusBar({ status, lastSavedAt, canDiscard, onSave, onDiscard }: DraftStatusBarProps) {
  const [confirming, setConfirming] = useState(false);
  const Icon = status === "saved" ? CircleCheck : status === "error" ? CircleAlert : status === "unsaved" ? PencilLine : CloudOff;

  return (
    <div className="rounded-xl border border-line bg-canvas p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-ink">
          <Icon
            aria-hidden="true"
            className={status === "saved" ? "size-4 text-success-text" : status === "error" ? "size-4 text-error-text" : "size-4 text-muted"}
          />
          {statusText(status, lastSavedAt)}
        </p>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink">Discard this draft?</span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setConfirming(false);
                onDiscard();
              }}
            >
              Yes, discard
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
              Keep draft
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={onSave}>
              <Save aria-hidden="true" className="size-4" />
              Save draft
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setConfirming(true)} disabled={!canDiscard}>
              <Trash2 aria-hidden="true" className="size-4" />
              Discard draft
            </Button>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        Drafts are saved automatically and stored only in this browser on this device. They are never sent anywhere.
      </p>
    </div>
  );
}
