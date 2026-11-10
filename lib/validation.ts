import { z } from "zod";
import { accounts } from "@/data/accounts";
import { supportTopicOrder } from "@/lib/labels";

/**
 * Validation for the support request workflow.
 *
 * Each step has its own schema so the form only checks the fields on the
 * current step. The final review step validates everything together.
 */

const accountIds = accounts.map((account) => account.id) as [string, ...string[]];

/** Nine or more digits in a row (allowing spaces or dashes) could be a full account or card number. */
const LONG_NUMBER_PATTERN = /(?:\d[\s-]?){9,}/;
/** Phrases that suggest someone is sharing a password or PIN. */
const CREDENTIAL_PATTERN = /\b(password|passcode|pin)\b\s*(is|:|=)/i;

export const SENSITIVE_NUMBER_MESSAGE =
  "For your security, don't include full account or card numbers. Use only the last 4 digits.";
export const CREDENTIAL_MESSAGE = "Please don't include passwords or PINs. ClearMember will never ask for them.";

function noSensitiveData(schema: z.ZodString) {
  return schema
    .refine((value) => !LONG_NUMBER_PATTERN.test(value), { message: SENSITIVE_NUMBER_MESSAGE })
    .refine((value) => !CREDENTIAL_PATTERN.test(value), { message: CREDENTIAL_MESSAGE });
}

export const topicStepSchema = z.object({
  topic: z.enum(supportTopicOrder as [string, ...string[]], {
    error: "Choose the topic that best describes your question.",
  }),
});

export const detailsStepSchema = z.object({
  subject: noSensitiveData(
    z
      .string()
      .trim()
      .min(5, "Enter a subject of at least 5 characters.")
      .max(100, "Keep the subject to 100 characters or fewer."),
  ),
  description: noSensitiveData(
    z
      .string()
      .trim()
      .min(20, "Describe your question in at least 20 characters so we can help.")
      .max(1000, "Keep the description to 1,000 characters or fewer."),
  ),
  accountId: z.enum(accountIds, { error: "Choose the account this is about." }),
  transactionId: z.string(),
});

export const responseMethods = ["secure-message", "email", "phone"] as const;
export const contactTimes = ["morning", "afternoon", "evening", "anytime"] as const;

export const responseMethodLabels: Record<(typeof responseMethods)[number], string> = {
  "secure-message": "Secure message in online banking",
  email: "Email",
  phone: "Phone call",
};

export const contactTimeLabels: Record<(typeof contactTimes)[number], string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 5 PM)",
  evening: "Evening (5 PM – 8 PM)",
  anytime: "Any time",
};

const PHONE_PATTERN = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const contactStepSchema = z
  .object({
    responseMethod: z.enum(responseMethods, { error: "Choose how you'd like us to respond." }),
    email: z.string().trim(),
    phone: z.string().trim(),
    contactTime: z.enum(contactTimes, { error: "Choose a preferred contact time." }),
  })
  .superRefine((values, context) => {
    if (values.responseMethod === "email") {
      if (!values.email) {
        context.addIssue({ code: "custom", path: ["email"], message: "Enter an email address so we can reply." });
      } else if (!z.email().safeParse(values.email).success) {
        context.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address, like name@example.com." });
      }
    }
    if (values.responseMethod === "phone") {
      if (!values.phone) {
        context.addIssue({ code: "custom", path: ["phone"], message: "Enter a phone number so we can call you." });
      } else if (!PHONE_PATTERN.test(values.phone)) {
        context.addIssue({ code: "custom", path: ["phone"], message: "Enter a 10-digit phone number, like (555) 010-0142." });
      }
    }
  });

export type SupportRequestFormValues = {
  topic: string;
  subject: string;
  description: string;
  accountId: string;
  transactionId: string;
  responseMethod: (typeof responseMethods)[number];
  email: string;
  phone: string;
  contactTime: (typeof contactTimes)[number] | "";
};

export const supportStepSchemas = [topicStepSchema, detailsStepSchema, contactStepSchema] as const;

export const stepFieldNames: Array<Array<keyof SupportRequestFormValues>> = [
  ["topic"],
  ["subject", "description", "accountId", "transactionId"],
  ["responseMethod", "email", "phone", "contactTime"],
  [],
];

/** Validate every step. Used before final submission. */
export function validateFullRequest(values: SupportRequestFormValues) {
  const results = supportStepSchemas.map((schema) => schema.safeParse(values));
  const firstInvalidStep = results.findIndex((result) => !result.success);
  return { valid: firstInvalidStep === -1, firstInvalidStep };
}
