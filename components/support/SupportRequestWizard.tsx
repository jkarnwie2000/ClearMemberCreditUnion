"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CircleCheck, Info, Send, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useLocalDraft } from "@/hooks/useLocalDraft";
import { generateReferenceNumber } from "@/lib/support";
import {
  defaultSupportValues,
  parseSupportDraft,
  SUPPORT_DRAFT_KEY,
  SUPPORT_DRAFT_VERSION,
  type SupportDraft,
} from "@/lib/support-draft";
import {
  stepFieldNames,
  supportStepSchemas,
  validateFullRequest,
  type SupportRequestFormValues,
} from "@/lib/validation";
import type { SupportTopic } from "@/types";
import { DraftStatusBar } from "./DraftStatusBar";
import { ErrorSummary, type SummaryError } from "./ErrorSummary";
import { StepIndicator } from "./StepIndicator";
import { ContactStep, DetailsStep, fieldId, ReviewStep, TopicStep } from "./steps";
import { SubmissionConfirmation } from "./SubmissionConfirmation";

export interface SupportPrefill {
  topic?: SupportTopic;
  accountId?: string;
  transactionId?: string;
}

const STEPS = [
  { short: "Topic", title: "Select a support topic" },
  { short: "Details", title: "Provide details" },
  { short: "Contact", title: "Contact preferences" },
  { short: "Review", title: "Review and submit" },
] as const;

const LAST_STEP = STEPS.length - 1;

type FocusTarget = "heading" | "summary" | "confirmation";

function definedPrefill(prefill: SupportPrefill): Partial<SupportRequestFormValues> {
  const values: Partial<SupportRequestFormValues> = {};
  if (prefill.topic) values.topic = prefill.topic;
  if (prefill.accountId) values.accountId = prefill.accountId;
  if (prefill.transactionId) values.transactionId = prefill.transactionId;
  return values;
}

export function SupportRequestWizard({ prefill = {} }: { prefill?: SupportPrefill }) {
  const draft = useLocalDraft<SupportDraft>({
    key: SUPPORT_DRAFT_KEY,
    version: SUPPORT_DRAFT_VERSION,
    parse: parseSupportDraft,
  });
  const { scheduleSave, saveNow, clearDraft } = draft;

  // Work out the starting point once: saved draft first, then anything passed in the URL.
  const [start] = useState(() => {
    const restored = draft.initialDraft;
    const prefillValues = definedPrefill(prefill);
    const hasPrefill = Object.keys(prefillValues).length > 0;
    return {
      values: { ...defaultSupportValues, ...restored?.values, ...prefillValues },
      step: restored && !hasPrefill ? restored.step : 0,
      notice: restored
        ? hasPrefill
          ? "We restored your saved draft and added the transaction you selected."
          : "Welcome back. We restored your saved draft, including the step you were on."
        : null,
    };
  });

  const [step, setStep] = useState(start.step);
  const stepRef = useRef(start.step);
  const [notice, setNotice] = useState<string | null>(start.notice);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [submission, setSubmission] = useState<{ reference: string; values: SupportRequestFormValues } | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ target: FocusTarget; id: number } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  // Validate only the current step's fields. The review step has nothing new to validate.
  const resolver = useCallback<Resolver<SupportRequestFormValues>>((values, context, options) => {
    const schema = supportStepSchemas[stepRef.current as 0 | 1 | 2];
    if (!schema) return { values, errors: {} };
    const stepResolver = zodResolver(schema as never) as unknown as Resolver<SupportRequestFormValues>;
    return stepResolver(values, context, options);
  }, []);

  const form = useForm<SupportRequestFormValues>({
    defaultValues: start.values,
    resolver,
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const { subscribe, getValues, trigger, reset, formState } = form;

  // Autosave (debounced) whenever the member edits a field.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values, name }) => {
          if (!name) return; // Ignore programmatic resets.
          scheduleSave({ step: stepRef.current, values: { ...values } });
        },
      }),
    [subscribe, scheduleSave],
  );

  // Move focus after navigation so keyboard and screen reader users land in the right place.
  // Runs on every commit until the requested target exists (e.g. the error summary renders
  // only after validation errors reach form state), then handles each request exactly once.
  const handledFocusId = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!focusRequest || handledFocusId.current === focusRequest.id) return;
    const target =
      focusRequest.target === "heading"
        ? headingRef.current
        : focusRequest.target === "summary"
          ? summaryRef.current
          : confirmationRef.current;
    if (!target) return;
    target.focus();
    handledFocusId.current = focusRequest.id;
  });

  const requestFocus = (target: FocusTarget) => setFocusRequest({ target, id: Date.now() + Math.random() });

  function goToStep(nextStep: number, { save = true }: { save?: boolean } = {}) {
    stepRef.current = nextStep;
    setStep(nextStep);
    setShowErrorSummary(false);
    requestFocus("heading");
    if (save) saveNow({ step: nextStep, values: getValues() });
  }

  async function handleNext() {
    const valid = await trigger(stepFieldNames[stepRef.current]);
    if (!valid) {
      setShowErrorSummary(true);
      requestFocus("summary");
      return;
    }
    goToStep(stepRef.current + 1);
  }

  async function handleSubmitRequest() {
    const values = getValues();
    const { valid, firstInvalidStep } = validateFullRequest(values);
    if (!valid) {
      goToStep(firstInvalidStep, { save: false });
      await trigger(stepFieldNames[firstInvalidStep]);
      setShowErrorSummary(true);
      requestFocus("summary");
      return;
    }
    clearDraft();
    setNotice(null);
    setSubmission({ reference: generateReferenceNumber(), values });
    requestFocus("confirmation");
  }

  function handleDiscard() {
    clearDraft();
    reset(defaultSupportValues);
    goToStep(0, { save: false });
    setNotice("Your draft was discarded. You can start a new request below.");
  }

  function handleStartOver() {
    reset(defaultSupportValues);
    stepRef.current = 0;
    setStep(0);
    setSubmission(null);
    setShowErrorSummary(false);
    requestFocus("heading");
  }

  // Read errors during render so React Hook Form re-renders this component when they change.
  const summaryErrors: SummaryError[] = stepFieldNames[step]
    .map((name) => {
      const message = formState.errors[name]?.message;
      return message ? { fieldId: fieldId(name), message } : null;
    })
    .filter((item): item is SummaryError => item !== null);

  if (submission) {
    return (
      <SubmissionConfirmation
        ref={confirmationRef}
        referenceNumber={submission.reference}
        values={submission.values}
        onStartOver={handleStartOver}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <div className="card p-5 sm:p-7">
        <StepIndicator steps={STEPS.map((item) => item.short)} currentStep={step} />

        {draft.loadIssue ? (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-warning/50 bg-warning-50 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning-text" />
            <p className="flex-1">
              {draft.loadIssue === "outdated"
                ? "A draft saved by an older version of this form couldn't be restored, so it was removed. You can start a new request below."
                : "We couldn't read the draft saved in this browser, so it was removed. You can start a new request below."}
            </p>
            <button
              type="button"
              onClick={draft.dismissLoadIssue}
              aria-label="Dismiss message"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-white"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : null}

        {notice ? (
          <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-success/40 bg-success-50 p-3 text-sm text-ink">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success-text" />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss message"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-white"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : null}

        <form
          noValidate
          className="mt-6"
          aria-labelledby="support-step-heading"
          onSubmit={(event) => {
            event.preventDefault();
            if (stepRef.current < LAST_STEP) void handleNext();
            else void handleSubmitRequest();
          }}
        >
          <p className="text-sm font-semibold text-teal-text">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2
            id="support-step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mb-5 mt-1 text-xl font-bold text-navy focus:outline-none"
          >
            {STEPS[step].title}
          </h2>

          {showErrorSummary ? <ErrorSummary ref={summaryRef} errors={summaryErrors} /> : null}

          {step === 0 ? <TopicStep /> : null}
          {step === 1 ? <DetailsStep /> : null}
          {step === 2 ? <ContactStep /> : null}
          {step === 3 ? <ReviewStep onEditStep={(target) => goToStep(target)} /> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <Button variant="secondary" onClick={() => goToStep(step - 1)}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back
              </Button>
            ) : (
              <ButtonLink href="/support" variant="secondary">
                Cancel
              </ButtonLink>
            )}
            {step < LAST_STEP ? (
              <Button type="submit">
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button type="submit">
                <Send aria-hidden="true" className="size-4" />
                Submit request
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6">
          <DraftStatusBar
            status={draft.status}
            lastSavedAt={draft.lastSavedAt}
            canDiscard={draft.status !== "idle" || formState.isDirty}
            onSave={() => saveNow({ step: stepRef.current, values: getValues() })}
            onDiscard={handleDiscard}
          />
        </div>
      </div>
    </FormProvider>
  );
}
