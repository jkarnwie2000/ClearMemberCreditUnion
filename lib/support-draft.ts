import { z } from "zod";
import { member } from "@/data/member";
import { contactTimes, responseMethods, type SupportRequestFormValues } from "@/lib/validation";

export const SUPPORT_DRAFT_KEY = "clearmember:support-request-draft";
/** Increase when the draft shape changes so older drafts are discarded safely. */
export const SUPPORT_DRAFT_VERSION = 1;
export const SUPPORT_STEP_COUNT = 4;

export interface SupportDraft {
  step: number;
  values: Partial<SupportRequestFormValues>;
}

export const defaultSupportValues: SupportRequestFormValues = {
  topic: "",
  subject: "",
  description: "",
  accountId: "",
  transactionId: "",
  responseMethod: "secure-message",
  email: member.email,
  phone: member.phone,
  contactTime: "",
};

const draftSchema = z.object({
  step: z.number().int().min(0).max(SUPPORT_STEP_COUNT - 1),
  values: z
    .object({
      topic: z.string().max(60),
      subject: z.string().max(500),
      description: z.string().max(5000),
      accountId: z.string().max(60),
      transactionId: z.string().max(60),
      responseMethod: z.enum(responseMethods),
      email: z.string().max(320),
      phone: z.string().max(40),
      contactTime: z.union([z.enum(contactTimes), z.literal("")]),
    })
    .partial(),
});

/** Validates data read from localStorage. Returns null for anything unexpected. */
export function parseSupportDraft(data: unknown): SupportDraft | null {
  const result = draftSchema.safeParse(data);
  return result.success ? result.data : null;
}
