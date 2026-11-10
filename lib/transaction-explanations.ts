import { getAccountById } from "@/lib/accounts";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  DescriptorReason,
  ExplanationKind,
  FeeType,
  HoldKind,
  Transaction,
  TransactionExplanation,
} from "@/types";

/**
 * Builds a plain-language explanation for a transaction.
 *
 * Every explanation answers four questions:
 *   1. What happened?
 *   2. Why might this have happened?
 *   3. What does this mean for your account?
 *   4. What should you do next?
 *
 * The wording describes common reasons ("may", "often", "can") and only states
 * facts that the synthetic data actually establishes. It never claims to know
 * the specific reason behind an individual transaction.
 */

const VERIFIED_CHANNEL_NOTE =
  "If you don't recognize this transaction or believe it's unauthorized, contact ClearMember through a verified official channel, such as the phone number on the back of your card or the number on our official website. Never use a phone number or link from an unexpected text or email, and never share your PIN, password, or one-time passcode.";

/** Decide which explanation scenario best fits a transaction. */
export function getExplanationKind(transaction: Transaction): ExplanationKind {
  if (transaction.transfer) return "transfer";
  if (transaction.type === "fee" && transaction.feeType) return "fee";
  if (transaction.hold) return "hold";
  if (transaction.unfamiliarMerchant) return "unfamiliar-merchant";
  if (transaction.status === "reversed") return "reversed";
  if (transaction.status === "pending") return "pending";
  if (transaction.type === "deposit") return "deposit";
  return "posted";
}

export function getTransactionExplanation(transaction: Transaction): TransactionExplanation {
  switch (getExplanationKind(transaction)) {
    case "transfer":
      return explainTransfer(transaction);
    case "fee":
      return explainFee(transaction);
    case "hold":
      return explainHold(transaction);
    case "unfamiliar-merchant":
      return explainUnfamiliarMerchant(transaction);
    case "reversed":
      return explainReversed(transaction);
    case "pending":
      return explainPending(transaction);
    case "deposit":
      return explainDeposit(transaction);
    case "posted":
      return explainPosted(transaction);
  }
}

function amountText(transaction: Transaction): string {
  return formatCurrency(Math.abs(transaction.amount));
}

// ── Pending ──────────────────────────────────────────────────────────────────

function explainPending(transaction: Transaction): TransactionExplanation {
  return {
    kind: "pending",
    headline: "This purchase is pending, which means it isn't final yet.",
    whatHappened: `${transaction.merchantName} asked to approve a ${amountText(transaction)} purchase on ${formatDate(transaction.transactionDate)}. The approval was granted, but the merchant hasn't sent the final transaction to post to your account yet.`,
    whyItMightHaveHappened: [
      "Pending is a normal first step for debit card purchases. The merchant authorizes the purchase first and submits the final amount later.",
      "Merchants submit transactions on their own schedules, so some purchases stay pending longer than others.",
      "Online orders may stay pending until the item ships.",
    ],
    whatItMeans:
      "Your available balance has been reduced by this amount, but your current balance hasn't changed yet. The final posted amount may be different from the pending amount, and if the merchant cancels the purchase, the pending transaction can drop off without posting.",
    whatToDoNext: [
      "Compare this amount with your receipt or order confirmation.",
      "Check back in a few days. The transaction will either post or drop off.",
      "If it stays pending longer than you expect, submit a support request with the topic Pending transaction.",
    ],
    securityNote: "If you didn't make this purchase, don't wait for it to post. " + VERIFIED_CHANNEL_NOTE,
    relatedArticleSlugs: ["pending-debit-card-transactions", "available-balance", "authorization-holds"],
    suggestedSupportTopic: "pending-transaction",
  };
}

// ── Authorization holds ──────────────────────────────────────────────────────

const holdContext: Record<HoldKind, { place: string; reason: string }> = {
  fuel: {
    place: "a gas station",
    reason:
      "Gas stations often authorize a set amount before you start pumping because they don't know yet how much fuel you'll buy. The final charge is usually based on the fuel you actually pumped.",
  },
  hotel: {
    place: "a hotel",
    reason:
      "Hotels commonly place a hold at check-in to cover the room and possible incidentals, like room service or damages. The final charge is usually settled at checkout.",
  },
  restaurant: {
    place: "a restaurant",
    reason:
      "Restaurants often authorize the bill amount before a tip is added. When the merchant submits the final transaction, the posted amount may include the tip.",
  },
  "car-rental": {
    place: "a rental car company",
    reason:
      "Rental car companies commonly place a hold at pickup to cover the rental and possible extra charges, like fuel or late returns. The final charge is usually calculated when the car is returned.",
  },
};

function explainHold(transaction: Transaction): TransactionExplanation {
  const hold = transaction.hold!;
  const context = holdContext[hold.kind];
  const released = transaction.status === "reversed" || Boolean(hold.releasedOn);
  const authorized = formatCurrency(hold.authorizedAmount);

  const whatHappened = released
    ? `${transaction.merchantName} placed a temporary authorization hold of ${authorized} on ${formatDate(transaction.transactionDate)}. That hold has since been released${hold.releasedOn ? ` (on ${formatDate(hold.releasedOn)})` : ""}, so it no longer affects your balance.`
    : `${transaction.merchantName} placed a temporary authorization hold of ${authorized} on ${formatDate(transaction.transactionDate)}. A hold sets money aside while the merchant works out the final amount. It isn't a final charge.`;

  const whatItMeans = released
    ? "This hold no longer reduces your available balance. If the merchant sent a final charge, it appears as a separate posted transaction, and its amount may be different from the original hold."
    : `Your available balance is ${authorized} lower while this hold is active. Your current balance hasn't changed. When the merchant submits the final amount, the hold is replaced by the actual charge, which may be lower or higher than ${authorized}. If no final charge is submitted, the hold eventually drops off.`;

  return {
    kind: "hold",
    headline: released
      ? "This was a temporary hold that has been released."
      : `This is a temporary hold from ${context.place}, not a final charge.`,
    whatHappened,
    whyItMightHaveHappened: [
      context.reason,
      "Holds like this are common at gas stations, hotels, restaurants, and rental car companies, anywhere the final total isn't known at the moment you pay.",
    ],
    whatItMeans,
    whatToDoNext: released
      ? [
          "Use View related transactions to find the final charge, if one posted.",
          "Compare the final charge with your receipt.",
          "If the final amount doesn't match your receipt, submit a support request.",
        ]
      : [
          "Keep your receipt so you can compare it with the final amount.",
          "Look for the final charge to post in the coming days. The hold drops off when it does.",
          "If the hold is still showing after you expect it to be released, submit a support request with the topic Pending transaction.",
        ],
    relatedArticleSlugs: ["authorization-holds", "pending-debit-card-transactions", "available-balance"],
    suggestedSupportTopic: "pending-transaction",
  };
}

// ── Transfers ────────────────────────────────────────────────────────────────

function explainTransfer(transaction: Transaction): TransactionExplanation {
  const transfer = transaction.transfer!;
  const isInternal = transfer.direction === "internal";
  const directionPhrase =
    transfer.flow === "incoming" ? `from ${transfer.counterparty}` : `to ${transfer.counterparty}`;

  const typeDescription = isInternal
    ? "This is an internal transfer, which moves money between your own ClearMember accounts. Because the money stays inside the credit union, internal transfers are usually simpler to complete than external ones."
    : "This is an external transfer, which moves money between ClearMember and an account at another financial institution. Because two institutions and a payment network are involved, external transfers usually take longer than internal ones.";

  const stageSummary: Record<typeof transfer.stage, string> = {
    initiated: "The transfer has been requested but hasn't started processing yet.",
    processing: "The transfer is moving through processing and hasn't completed yet.",
    completed: "The transfer has completed.",
    delayed:
      "The transfer is taking longer than usual and hasn't completed yet. The synthetic records for this transfer don't include an expected completion date.",
  };

  const whyByStage: Record<typeof transfer.stage, string[]> = {
    initiated: [
      "Transfers often wait for the next processing window before money moves.",
      "Scheduled transfers stay in the initiated stage until their scheduled date.",
    ],
    processing: [
      "Processing time can vary depending on the type of transfer and when it was submitted.",
      "Each institution has its own processing schedule, and weekends and holidays can add time.",
    ],
    completed: [
      "Your transfer request was processed and the money moved as requested.",
      isInternal
        ? "Internal transfers create two matching entries: money leaving one account and arriving in the other."
        : "External transfers complete once both institutions have finished processing.",
    ],
    delayed: [
      "A transfer can be delayed by weekends, holidays, or each institution's processing schedule.",
      "Some transfers are held for additional review, or details like the receiving account number may not match.",
      "We can't tell from this screen which of these applies to this transfer.",
    ],
  };

  const meaningByStage: Record<typeof transfer.stage, string> = {
    initiated:
      transfer.flow === "outgoing"
        ? "The money hasn't moved yet. Make sure enough money stays available in this account until the transfer completes."
        : "The money hasn't arrived yet, so it isn't available to spend.",
    processing:
      transfer.flow === "outgoing"
        ? "The money has left your available balance and is on its way. It isn't available to spend from this account."
        : "The money isn't available to spend until the transfer completes.",
    completed:
      transfer.flow === "outgoing"
        ? "The money has moved out of this account."
        : "The money has arrived and is part of your balance.",
    delayed:
      transfer.flow === "outgoing"
        ? "The money isn't available in this account while the transfer is delayed. It hasn't been confirmed as received yet."
        : "The money hasn't arrived yet, so it isn't available to spend.",
  };

  const nextByStage: Record<typeof transfer.stage, string[]> = {
    initiated: [
      "Review the timeline below to see when the transfer was created.",
      "No action is needed unless you want to change the transfer.",
    ],
    processing: [
      "Review the timeline below to follow the transfer's progress.",
      isInternal ? "Check back later today." : "Confirm the receiving account details are correct.",
      "If the transfer doesn't complete when you expect, submit a support request with the topic Transfer delay.",
    ],
    completed: [
      isInternal
        ? "Use View related transactions to see the matching entry in your other account."
        : "Confirm the money arrived in the receiving account.",
    ],
    delayed: [
      "Confirm the account details with the other institution.",
      "Submit a support request with the topic Transfer delay so a representative can look into it.",
      "Avoid starting a second transfer for the same money until this one is resolved, so the money isn't sent twice.",
    ],
  };

  return {
    kind: "transfer",
    headline: `${isInternal ? "Internal" : "External"} transfer ${directionPhrase}: ${stageSummary[transfer.stage].charAt(0).toLowerCase()}${stageSummary[transfer.stage].slice(1)}`,
    whatHappened: `A ${amountText(transaction)} transfer ${directionPhrase} was requested on ${formatDate(transaction.transactionDate)}. ${stageSummary[transfer.stage]} ${typeDescription}`,
    whyItMightHaveHappened: whyByStage[transfer.stage],
    whatItMeans: meaningByStage[transfer.stage],
    whatToDoNext: nextByStage[transfer.stage],
    relatedArticleSlugs: isInternal
      ? ["internal-transfers", "scheduled-payments", "external-transfer-delays"]
      : ["external-transfer-delays", "ach-processing", "internal-transfers"],
    suggestedSupportTopic: "transfer-delay",
  };
}

// ── Fees ─────────────────────────────────────────────────────────────────────

function explainFee(transaction: Transaction): TransactionExplanation {
  const feeType = transaction.feeType as FeeType;
  const terms = getAccountById(transaction.accountId)?.feeTerms;
  const amount = amountText(transaction);
  const date = formatDate(transaction.transactionDate);

  const shared = {
    kind: "fee" as const,
    suggestedSupportTopic: "account-fee" as const,
  };

  switch (feeType) {
    case "monthly-maintenance":
      return {
        ...shared,
        headline: "This is a monthly maintenance fee for keeping the account open.",
        whatHappened: `A ${amount} monthly maintenance fee posted on ${date}. It applies to the statement cycle that ended that day.`,
        whyItMightHaveHappened: [
          terms?.maintenanceFeeWaiver
            ? `This account's demo terms say the fee is ${terms.maintenanceFeeWaiver.charAt(0).toLowerCase()}${terms.maintenanceFeeWaiver.slice(1)}`
            : "Many accounts charge a monthly fee unless certain requirements are met.",
          "A fee usually posts when a waiver requirement wasn't met during the cycle. We can't confirm from this screen which requirement applied.",
        ],
        whatItMeans: `Your balance was reduced by ${amount}. The fee reflects activity during the statement cycle, not the current month.`,
        whatToDoNext: [
          "Review your activity for the statement cycle to see whether a waiver requirement was met.",
          "Consider setting up direct deposit to this account if you'd like to meet the waiver requirement.",
          "If you believe the fee should have been waived, submit a support request with the topic Account fee.",
        ],
        relatedArticleSlugs: ["monthly-maintenance-fees", "overdraft-fees", "atm-fees"],
      };
    case "overdraft":
      return {
        ...shared,
        headline: "This is an overdraft fee, charged when a payment is paid without enough available money.",
        whatHappened: `A ${amount} overdraft fee posted on ${date}.${transaction.relatedTransactionIds?.length ? " It's linked to another transaction that posted the same day, which you can open from Related transactions." : ""}`,
        whyItMightHaveHappened: [
          "Overdraft fees are charged when a transaction is paid even though the available balance isn't enough to cover it.",
          "This often happens when an automatic payment posts while other purchases are still pending, or when a balance is lower than expected.",
          "We can't confirm the exact sequence of transactions from this screen.",
        ],
        whatItMeans: `Your balance was reduced by ${amount}.${terms?.overdraftFee ? ` In this demo, the overdraft fee for this account is ${formatCurrency(terms.overdraftFee)} per item.` : ""}`,
        whatToDoNext: [
          "Open the related transaction to see which payment the fee is linked to.",
          "Turn on low-balance alerts in Settings so you know when your balance drops.",
          "If you have questions about this fee, submit a support request with the topic Account fee.",
        ],
        relatedArticleSlugs: ["overdraft-fees", "available-balance", "account-alerts"],
      };
    case "atm":
      return {
        ...shared,
        headline: "This is an ATM fee for using a machine outside the ClearMember network.",
        whatHappened: `A ${amount} ATM fee posted on ${date}.${transaction.relatedTransactionIds?.length ? " It's linked to an ATM withdrawal from the same day." : ""}`,
        whyItMightHaveHappened: [
          "ClearMember may charge a fee when you withdraw cash from an ATM outside our network.",
          "The ATM's owner may also charge its own fee, which is usually added to the withdrawal amount rather than shown separately.",
        ],
        whatItMeans: `Your balance was reduced by ${amount}.${terms?.nonNetworkAtmFee ? ` In this demo, the non-network ATM fee is ${formatCurrency(terms.nonNetworkAtmFee)} per withdrawal.` : ""}`,
        whatToDoNext: [
          "Open the related withdrawal to confirm where the ATM was.",
          "Use ClearMember ATMs when possible to avoid this fee.",
          "If you don't recognize the withdrawal, contact the credit union through a verified official channel.",
        ],
        relatedArticleSlugs: ["atm-fees", "monthly-maintenance-fees"],
      };
    case "returned-payment":
      return {
        ...shared,
        headline: "This is a returned payment fee, charged when a payment from your account is sent back unpaid.",
        whatHappened: `A ${amount} returned payment fee posted on ${date}.${transaction.relatedTransactionIds?.length ? " It's linked to a payment that was returned and now shows as Reversed." : ""}`,
        whyItMightHaveHappened: [
          "Payments are often returned when there isn't enough available money in the account at the time the payment is presented.",
          "A payment can also be returned for other reasons, such as a closed or incorrect account. We can't confirm the reason from this screen.",
        ],
        whatItMeans: `Your balance was reduced by ${amount}. The payment itself didn't go through, so the company you were paying hasn't received that money and may contact you or try again.${terms?.returnedPaymentFee ? ` In this demo, the returned payment fee is ${formatCurrency(terms.returnedPaymentFee)} per item.` : ""}`,
        whatToDoNext: [
          "Open the related transaction to see which payment was returned.",
          "Contact the company you were paying to arrange payment.",
          "If you have questions about this fee, submit a support request with the topic Account fee.",
        ],
        relatedArticleSlugs: ["returned-payment-fees", "ach-processing", "overdraft-fees"],
      };
  }
}

// ── Unfamiliar merchants ─────────────────────────────────────────────────────

const descriptorReasons: Record<DescriptorReason, string> = {
  "payment-processor":
    "The descriptor starts with a short code followed by an asterisk, which is often how a payment processor labels purchases it handles for smaller businesses.",
  "parent-company":
    "The descriptor looks like a company name rather than a store name. Businesses sometimes bill under a parent company or legal business name.",
  "shortened-name":
    "The descriptor looks like a shortened or abbreviated business name, which is common for subscriptions and online services with limited space for a name.",
  "billing-location":
    "The descriptor includes a city that may be the business's billing or corporate location rather than the store you visited.",
  "online-descriptor":
    "The descriptor looks like an online payment name, which can differ from the name of the website where you shopped.",
};

function explainUnfamiliarMerchant(transaction: Transaction): TransactionExplanation {
  const details = transaction.unfamiliarMerchant!;
  const hint = details.possibleBusiness
    ? `In this demo, this descriptor is associated with ${details.possibleBusiness}. That's a starting point to check against your receipts, not a confirmation.`
    : undefined;

  return {
    kind: "unfamiliar-merchant",
    headline: "The name on this transaction may not match the business you remember.",
    whatHappened: `A ${amountText(transaction)} ${transaction.status === "pending" ? "pending " : ""}transaction appeared on ${formatDate(transaction.transactionDate)} with the descriptor "${transaction.descriptor}".`,
    whyItMightHaveHappened: [
      descriptorReasons[details.reason],
      "Merchant descriptors can reflect a parent company, a payment processor, a shortened business name, a different billing location, or an online payment name.",
      ...(hint ? [hint] : []),
    ],
    whatItMeans:
      "An unfamiliar name doesn't necessarily mean the transaction is fraudulent. Many unfamiliar descriptors turn out to be businesses the member does recognize under another name.",
    whatToDoNext: [
      "Compare the date and amount with your receipts, order confirmations, and subscriptions.",
      "Ask anyone who shares or uses this card whether they made the purchase.",
      "Search for a phone number or website shown in the descriptor.",
      "If you still don't recognize it, contact the credit union through a verified official channel.",
    ],
    securityNote: VERIFIED_CHANNEL_NOTE,
    relatedArticleSlugs: ["unfamiliar-merchant-names", "suspicious-transactions", "contacting-us-safely"],
    suggestedSupportTopic: "unrecognized-merchant",
  };
}

// ── Reversed ─────────────────────────────────────────────────────────────────

function explainReversed(transaction: Transaction): TransactionExplanation {
  const isReturnedPayment = transaction.type === "withdrawal";
  return {
    kind: "reversed",
    headline: isReturnedPayment
      ? "This payment was returned unpaid, so the money didn't leave your account."
      : "This transaction was reversed, so it didn't reduce your balance.",
    whatHappened: isReturnedPayment
      ? `A ${amountText(transaction)} payment to ${transaction.merchantName} was presented on ${formatDate(transaction.transactionDate)} and then returned unpaid.`
      : `A ${amountText(transaction)} transaction from ${transaction.merchantName} on ${formatDate(transaction.transactionDate)} was reversed before it posted.`,
    whyItMightHaveHappened: isReturnedPayment
      ? [
          "Payments are often returned when there isn't enough available money at the time they're presented.",
          "A payment can also be returned for other reasons, like an account mismatch. We can't confirm the reason from this screen.",
        ]
      : [
          "Merchants sometimes cancel an authorization when an order is changed, canceled, or entered twice.",
          "A reversal can also happen when a merchant replaces a hold with a final charge.",
        ],
    whatItMeans: isReturnedPayment
      ? "The money stayed in your account, but the company you were paying hasn't been paid. A returned payment fee may apply, and the company may try again or contact you."
      : "The amount is no longer held or charged. It doesn't affect your available or current balance.",
    whatToDoNext: isReturnedPayment
      ? [
          "Check Related transactions for any fee linked to this return.",
          "Contact the company you were paying to arrange payment.",
          "Submit a support request if you have questions.",
        ]
      : [
          "No action is usually needed.",
          "If you expected this purchase to go through, check with the merchant.",
        ],
    relatedArticleSlugs: isReturnedPayment
      ? ["returned-payment-fees", "ach-processing"]
      : ["pending-debit-card-transactions", "authorization-holds"],
    suggestedSupportTopic: "transaction-question",
  };
}

// ── Deposits and posted purchases ────────────────────────────────────────────

function explainDeposit(transaction: Transaction): TransactionExplanation {
  const isDividend = transaction.category === "Dividends";
  return {
    kind: "deposit",
    headline: isDividend
      ? "This is a dividend: money your savings earned."
      : "This deposit has posted and is part of your balance.",
    whatHappened: isDividend
      ? `A ${amountText(transaction)} dividend was credited on ${formatDate(transaction.transactionDate)}. Credit unions call the earnings on savings "dividends," because members are part-owners of the credit union.`
      : `A ${amountText(transaction)} deposit from ${transaction.merchantName} posted on ${formatDate(transaction.postedDate ?? transaction.transactionDate)}.`,
    whyItMightHaveHappened: isDividend
      ? ["Dividends are calculated on your balance and credited at the end of each month."]
      : [
          transaction.descriptor.includes("DIRECT DEP")
            ? "Direct deposits like payroll arrive electronically through the ACH network."
            : "Deposits post once they've been received and processed.",
        ],
    whatItMeans: "This money is included in your current balance.",
    whatToDoNext: ["No action is needed."],
    relatedArticleSlugs: ["current-balance", "ach-processing"],
    suggestedSupportTopic: "transaction-question",
  };
}

function explainPosted(transaction: Transaction): TransactionExplanation {
  return {
    kind: "posted",
    headline: "This transaction has fully posted to your account.",
    whatHappened: `A ${amountText(transaction)} ${transaction.type === "withdrawal" ? "withdrawal" : "purchase"} at ${transaction.merchantName} was made on ${formatDate(transaction.transactionDate)}${transaction.postedDate ? ` and posted on ${formatDate(transaction.postedDate)}` : ""}.`,
    whyItMightHaveHappened: [
      transaction.postedDate && transaction.postedDate !== transaction.transactionDate
        ? "It's common for a purchase to post a day or more after you make it, because the merchant submits the final transaction later."
        : "The transaction was submitted and posted the same day.",
    ],
    whatItMeans: "This amount is final and is included in your current balance.",
    whatToDoNext: [
      "Compare the amount with your receipt.",
      "If you don't recognize this transaction, review the unfamiliar merchant guidance or contact the credit union through a verified official channel.",
    ],
    relatedArticleSlugs: ["current-balance", "unfamiliar-merchant-names"],
    suggestedSupportTopic: "transaction-question",
  };
}
