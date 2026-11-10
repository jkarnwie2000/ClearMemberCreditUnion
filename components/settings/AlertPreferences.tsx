"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useIsClient } from "@/hooks/useIsClient";
import { getBrowserStorage, removeDraft } from "@/hooks/useLocalDraft";
import { SUPPORT_DRAFT_KEY } from "@/lib/support-draft";

const PREFERENCES_KEY = "clearmember:alert-preferences";

const ALERTS = [
  { id: "transaction-posted", label: "A transaction posts", description: "Get notified when a purchase or deposit posts." },
  { id: "low-balance", label: "Low available balance", description: "Get notified when available balance drops below $100." },
  { id: "transfer-updates", label: "Transfer updates", description: "Get notified when a transfer is processing, completed, or delayed." },
  { id: "statements", label: "Statements are ready", description: "Get notified when a monthly statement is available." },
] as const;

type AlertId = (typeof ALERTS)[number]["id"];
type Preferences = Record<AlertId, boolean>;

const DEFAULT_PREFERENCES: Preferences = {
  "transaction-posted": true,
  "low-balance": true,
  "transfer-updates": true,
  statements: false,
};

function loadPreferences(): Preferences {
  try {
    const raw = getBrowserStorage()?.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_PREFERENCES;
    const result = { ...DEFAULT_PREFERENCES };
    for (const alert of ALERTS) {
      const value = (parsed as Record<string, unknown>)[alert.id];
      if (typeof value === "boolean") result[alert.id] = value;
    }
    return result;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function AlertPreferencesForm() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [message, setMessage] = useState("");

  function toggle(id: AlertId) {
    const next = { ...preferences, [id]: !preferences[id] };
    setPreferences(next);
    try {
      getBrowserStorage()?.setItem(PREFERENCES_KEY, JSON.stringify(next));
      setMessage("Alert preferences saved in this browser.");
    } catch {
      setMessage("Couldn't save preferences in this browser.");
    }
  }

  function clearBrowserData() {
    const storage = getBrowserStorage();
    removeDraft(storage, SUPPORT_DRAFT_KEY);
    removeDraft(storage, PREFERENCES_KEY);
    setPreferences(DEFAULT_PREFERENCES);
    setMessage("Demo data stored in this browser was cleared.");
  }

  return (
    <>
      <fieldset>
        <legend className="sr-only">Alerts</legend>
        <ul className="divide-y divide-line">
          {ALERTS.map((alert) => (
            <li key={alert.id} className="flex items-center justify-between gap-4 py-3.5">
              <label htmlFor={`alert-${alert.id}`} className="min-w-0 flex-1 cursor-pointer">
                <span className="block font-semibold text-ink">{alert.label}</span>
                <span className="block text-sm text-muted">{alert.description}</span>
              </label>
              <span className="relative inline-flex shrink-0 items-center">
                <input
                  id={`alert-${alert.id}`}
                  type="checkbox"
                  role="switch"
                  checked={preferences[alert.id]}
                  onChange={() => toggle(alert.id)}
                  className="peer h-7 w-12 cursor-pointer appearance-none rounded-full bg-line-strong transition-colors checked:bg-brand"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
                />
              </span>
            </li>
          ))}
        </ul>
      </fieldset>
      <p role="status" className="mt-2 flex min-h-6 items-center gap-1.5 text-sm text-success-text">
        {message ? (
          <>
            <CircleCheck aria-hidden="true" className="size-4" />
            {message}
          </>
        ) : null}
      </p>

      <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
        <h3 className="font-semibold text-navy">Data stored in this browser</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          This demo saves your alert choices and any unfinished support request draft in this browser&apos;s local
          storage. Nothing is sent to a server.
        </p>
        <Button variant="danger" size="sm" className="mt-3" onClick={clearBrowserData}>
          Clear demo data from this browser
        </Button>
      </div>
    </>
  );
}

export function AlertPreferences() {
  const isClient = useIsClient();
  if (!isClient) return <p className="py-6 text-sm text-muted">Loading your preferences…</p>;
  return <AlertPreferencesForm />;
}
