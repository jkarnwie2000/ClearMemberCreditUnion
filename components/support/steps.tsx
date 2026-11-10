"use client";

import { Pencil, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { RadioCardGroup, SelectField, TextAreaField, TextField } from "@/components/forms/FormFields";
import { Button } from "@/components/ui/Button";
import { accounts } from "@/data/accounts";
import { transactions } from "@/data/transactions";
import { getAccountLabel } from "@/lib/accounts";
import { supportTopicMeta, supportTopicOrder } from "@/lib/labels";
import { sortTransactions } from "@/lib/transactions";
import { formatDate, formatSignedAmount } from "@/lib/utils";
import {
  contactTimeLabels,
  contactTimes,
  responseMethodLabels,
  responseMethods,
  type SupportRequestFormValues,
} from "@/lib/validation";
import type { SupportTopic } from "@/types";

export const fieldId = (name: keyof SupportRequestFormValues) => `support-${name}`;

const DESCRIPTION_MAX = 1000;

function transactionOptionLabel(id: string): string {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return "None";
  return `${formatDate(transaction.transactionDate)} · ${transaction.merchantName} · ${formatSignedAmount(transaction.amount)}`;
}

// ── Step 1 ───────────────────────────────────────────────────────────────────

export function TopicStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SupportRequestFormValues>();
  const topic = useWatch<SupportRequestFormValues, "topic">({ name: "topic" });

  return (
    <RadioCardGroup
      id={fieldId("topic")}
      legend="What is your question about?"
      hint="Choose the closest match. You can explain more in the next step."
      required
      registration={register("topic")}
      selectedValue={topic}
      error={errors.topic?.message}
      options={supportTopicOrder.map((value) => ({
        value,
        label: supportTopicMeta[value].label,
        description: supportTopicMeta[value].description,
      }))}
    />
  );
}

// ── Step 2 ───────────────────────────────────────────────────────────────────

export function DetailsStep() {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<SupportRequestFormValues>();
  const accountId = useWatch<SupportRequestFormValues, "accountId">({ name: "accountId" });
  const description = useWatch<SupportRequestFormValues, "description">({ name: "description" }) ?? "";

  const transactionOptions = sortTransactions(
    accountId ? transactions.filter((transaction) => transaction.accountId === accountId) : transactions,
    "newest",
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand/20 bg-brand-50 p-4 text-sm leading-relaxed text-ink">
        <p className="font-semibold text-navy">What to include</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>What you expected to happen, and what happened instead.</li>
          <li>Dates and amounts, if your question is about a transaction.</li>
          <li>Anything you&apos;ve already tried, like contacting the merchant.</li>
        </ul>
        <p className="mt-3 flex items-start gap-2 font-medium text-navy">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
          Never include passwords, PINs, full account numbers, or full card numbers. The last 4 digits are enough.
        </p>
      </div>

      <TextField
        id={fieldId("subject")}
        label="Subject"
        hint="A short summary, like “Hotel hold still showing”."
        required
        registration={register("subject")}
        error={errors.subject?.message}
        autoComplete="off"
      />

      <TextAreaField
        id={fieldId("description")}
        label="Describe your question"
        required
        registration={register("description")}
        error={errors.description?.message}
        rows={6}
        footer={
          <p className="mt-1 text-right text-xs text-muted" aria-live="off">
            {description.length.toLocaleString("en-US")} / {DESCRIPTION_MAX.toLocaleString("en-US")} characters
          </p>
        }
      />

      <SelectField
        id={fieldId("accountId")}
        label="Related account"
        required
        registration={register("accountId", {
          onChange: (event: { target: { value: string } }) => {
            const selectedTransaction = transactions.find((item) => item.id === getValues("transactionId"));
            if (selectedTransaction && selectedTransaction.accountId !== event.target.value) {
              setValue("transactionId", "", { shouldDirty: true });
            }
          },
        })}
        error={errors.accountId?.message}
      >
        <option value="">Choose an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} {account.maskedNumber}
          </option>
        ))}
      </SelectField>

      <SelectField
        id={fieldId("transactionId")}
        label="Related transaction"
        hint={
          accountId
            ? "Showing transactions from the selected account."
            : "Choose an account first to narrow this list, or pick from all recent activity."
        }
        registration={register("transactionId")}
        error={errors.transactionId?.message}
      >
        <option value="">Not about a specific transaction</option>
        {transactionOptions.map((transaction) => (
          <option key={transaction.id} value={transaction.id}>
            {transactionOptionLabel(transaction.id)}
          </option>
        ))}
      </SelectField>
    </div>
  );
}

// ── Step 3 ───────────────────────────────────────────────────────────────────

export function ContactStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SupportRequestFormValues>();
  const responseMethod = useWatch<SupportRequestFormValues, "responseMethod">({ name: "responseMethod" });
  const contactTime = useWatch<SupportRequestFormValues, "contactTime">({ name: "contactTime" });

  return (
    <div className="space-y-6">
      <RadioCardGroup
        id={fieldId("responseMethod")}
        legend="How would you like us to respond?"
        required
        columns={1}
        registration={register("responseMethod")}
        selectedValue={responseMethod}
        error={errors.responseMethod?.message}
        options={responseMethods.map((value) => ({
          value,
          label: responseMethodLabels[value],
          description:
            value === "secure-message"
              ? "We reply inside online banking. Recommended for account details."
              : value === "email"
                ? "We email you when there's an update. We won't include account details."
                : "A representative calls you.",
        }))}
      />

      {responseMethod === "email" ? (
        <TextField
          id={fieldId("email")}
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          registration={register("email")}
          error={errors.email?.message}
        />
      ) : null}

      {responseMethod === "phone" ? (
        <TextField
          id={fieldId("phone")}
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          hint="We'll call from the number on the back of your card. We'll never ask for your PIN or password."
          required
          registration={register("phone")}
          error={errors.phone?.message}
        />
      ) : null}

      <RadioCardGroup
        id={fieldId("contactTime")}
        legend="When is the best time to reach you?"
        hint="Times are in your local time zone."
        required
        registration={register("contactTime")}
        selectedValue={contactTime}
        error={errors.contactTime?.message}
        options={contactTimes.map((value) => ({ value, label: contactTimeLabels[value] }))}
      />
    </div>
  );
}

// ── Step 4 ───────────────────────────────────────────────────────────────────

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line p-4" aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-navy">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>
          <Pencil aria-hidden="true" className="size-4" />
          Edit
        </Button>
      </div>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function ReviewItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="sm:flex sm:gap-4">
      <dt className="text-sm text-muted sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-[0.9375rem] font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ReviewStep({ onEditStep }: { onEditStep: (step: number) => void }) {
  const values = useWatch<SupportRequestFormValues>() as SupportRequestFormValues;
  const topicLabel = values.topic ? supportTopicMeta[values.topic as SupportTopic]?.label : undefined;
  const contactDetail =
    values.responseMethod === "email"
      ? values.email
      : values.responseMethod === "phone"
        ? values.phone
        : "Secure message in online banking";

  return (
    <div className="space-y-4">
      <p className="text-[0.9375rem] text-muted">
        Check your request before you submit it. Use Edit to go back and make changes. Your answers are kept.
      </p>
      <ReviewSection title="Topic" onEdit={() => onEditStep(0)}>
        <ReviewItem label="Topic" value={topicLabel ?? "Not selected"} />
      </ReviewSection>
      <ReviewSection title="Details" onEdit={() => onEditStep(1)}>
        <ReviewItem label="Subject" value={values.subject || "Not provided"} />
        <ReviewItem label="Description" value={values.description || "Not provided"} />
        <ReviewItem label="Account" value={values.accountId ? getAccountLabel(values.accountId) : "Not selected"} />
        <ReviewItem
          label="Transaction"
          value={values.transactionId ? transactionOptionLabel(values.transactionId) : "Not about a specific transaction"}
        />
      </ReviewSection>
      <ReviewSection title="Contact preferences" onEdit={() => onEditStep(2)}>
        <ReviewItem label="Response method" value={responseMethodLabels[values.responseMethod]} />
        <ReviewItem label="Contact details" value={contactDetail} />
        <ReviewItem
          label="Preferred time"
          value={values.contactTime ? contactTimeLabels[values.contactTime] : "Not selected"}
        />
      </ReviewSection>
    </div>
  );
}
