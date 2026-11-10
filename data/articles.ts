import type { ArticleCategory, SupportArticle } from "@/types";

export const articleCategories: ArticleCategory[] = [
  "Account Management",
  "Debit Cards",
  "Transfers and Payments",
  "Fees and Charges",
  "Security",
];

/**
 * Synthetic Help Center articles. Content is general education written for a
 * fictional credit union and does not describe any real institution's policies.
 */
export const articles: SupportArticle[] = [
  // ── Account Management ─────────────────────────────────────────────────────
  {
    slug: "available-balance",
    title: "Understanding your available balance",
    category: "Account Management",
    summary: "Your available balance is the money you can use right now, after pending transactions and holds.",
    body: [
      "Your available balance is the amount you can spend or withdraw at this moment. It starts with your current balance and then subtracts pending transactions, authorization holds, and any deposits that haven't been made available yet.",
      "Because pending items are included, your available balance often changes before your current balance does. For example, when you pay at a gas pump, a temporary hold may lower your available balance right away even though the purchase hasn't posted yet.",
      "When you're deciding whether you have enough money for a purchase, the available balance is usually the better number to check.",
    ],
    nextSteps: [
      "Open Account Activity and look for items marked Pending to see what is affecting your available balance.",
      "Select any pending transaction to read a plain-language explanation of what it means.",
      "If a hold seems to be lasting longer than expected, submit a support request so we can take a look.",
    ],
    relatedSlugs: ["current-balance", "pending-debit-card-transactions", "authorization-holds"],
    keywords: ["available", "balance", "spend", "pending", "hold", "difference", "money"],
  },
  {
    slug: "current-balance",
    title: "Understanding your current balance",
    category: "Account Management",
    summary: "Your current balance includes transactions that have fully posted to your account.",
    body: [
      "Your current balance (sometimes called the ledger balance) is the total of all transactions that have fully posted to your account. Pending transactions and holds aren't included yet.",
      "That's why your current balance can be higher than your available balance. The difference is usually made up of pending purchases or temporary holds that will post, change, or drop off in the coming days.",
      "Your current balance is useful for reconciling your account against your statement, since statements only list posted transactions.",
    ],
    nextSteps: [
      "Compare your current and available balances on the Overview page.",
      "Review pending items in Account Activity to understand the difference.",
      "Use your monthly statement to review posted transactions for a full cycle.",
    ],
    relatedSlugs: ["available-balance", "pending-debit-card-transactions"],
    keywords: ["current", "ledger", "balance", "posted", "statement", "difference"],
  },
  {
    slug: "update-contact-information",
    title: "Updating your contact information",
    category: "Account Management",
    summary: "Keep your phone number, email, and mailing address up to date so you never miss an important alert.",
    body: [
      "Accurate contact information helps us reach you about account alerts, card activity we need to verify, and statements. If your phone number or email changes, update it as soon as you can.",
      "In this demo, contact details appear on the Settings page. In a real credit union app, changes to contact information may require extra verification to keep your account safe.",
      "We will never ask you to update your contact information through a link in an unexpected text or email. If you receive a message like that, don't click it.",
    ],
    nextSteps: [
      "Review the contact details on the Settings page.",
      "If you suspect someone changed your information without your permission, contact the credit union through a verified channel right away.",
    ],
    relatedSlugs: ["account-alerts", "phishing", "contacting-us-safely"],
    keywords: ["contact", "phone", "email", "address", "update", "change", "profile"],
  },
  {
    slug: "account-alerts",
    title: "Managing account alerts",
    category: "Account Management",
    summary: "Alerts can tell you when a transaction posts, a balance runs low, or a transfer is processing.",
    body: [
      "Account alerts are short notifications about activity on your accounts. Common alerts include large purchases, low balances, posted deposits, and transfer updates.",
      "Alerts are one of the easiest ways to spot something unusual quickly. A low-balance alert, for example, can help you move money before a payment comes through and avoid an overdraft.",
      "You can choose which alerts you want on the Settings page. In this demo, your choices are saved only in this browser.",
    ],
    nextSteps: [
      "Turn on low-balance and large-transaction alerts on the Settings page.",
      "Check the notification bell at the top of the page for recent updates.",
    ],
    relatedSlugs: ["overdraft-fees", "suspicious-transactions", "update-contact-information"],
    keywords: ["alerts", "notifications", "low balance", "settings", "text", "email"],
  },

  // ── Debit Cards ────────────────────────────────────────────────────────────
  {
    slug: "pending-debit-card-transactions",
    title: "Understanding pending debit card transactions",
    category: "Debit Cards",
    summary: "A pending transaction has been approved by the merchant but hasn't fully posted to your account yet.",
    body: [
      "When you use your debit card, the merchant first asks for approval. That approval shows up as a pending transaction. It reduces your available balance right away, but it isn't final.",
      "Later, the merchant sends the final transaction to be posted. The final amount may be the same as the pending amount, or it may be different. For example, a restaurant tip or a fuel purchase can change the final total.",
      "Sometimes a pending transaction drops off without posting, such as when a merchant cancels an order. How long a transaction stays pending depends on the merchant and when they submit it.",
    ],
    nextSteps: [
      "Select the pending transaction in Account Activity to see what it may mean.",
      "Check your receipt to compare the final amount with the pending amount.",
      "If a pending transaction doesn't look familiar, review it right away and contact us through a verified channel.",
    ],
    relatedSlugs: ["authorization-holds", "available-balance", "unfamiliar-merchant-names"],
    keywords: ["pending", "debit", "card", "authorization", "posted", "waiting", "not posted"],
  },
  {
    slug: "authorization-holds",
    title: "Understanding temporary authorization holds",
    category: "Debit Cards",
    summary: "Some merchants place a temporary hold for an estimated amount before the final charge is known.",
    body: [
      "An authorization hold is a temporary amount a merchant sets aside when the final total isn't known yet. The hold lowers your available balance, but it isn't a final charge.",
      "Gas stations often place a hold before you pump, because they don't know how much fuel you'll buy. Hotels and rental car companies commonly place holds at check-in or pickup to cover incidentals. Restaurants may authorize the bill amount before a tip is added.",
      "When the merchant submits the final amount, the hold is replaced by the actual charge. The final posted amount can be lower or higher than the original hold. If the merchant never submits a final charge, the hold eventually drops off.",
    ],
    nextSteps: [
      "Keep receipts from gas stations, hotels, and rental car companies so you can compare the final amount.",
      "Look for a related posted transaction after the hold drops off.",
      "If a hold is still showing after you expected it to be released, submit a support request.",
    ],
    relatedSlugs: ["pending-debit-card-transactions", "available-balance", "card-declined"],
    keywords: ["hold", "authorization", "gas", "fuel", "hotel", "rental car", "restaurant", "tip", "temporary"],
  },
  {
    slug: "card-declined",
    title: "What to do when your card is declined",
    category: "Debit Cards",
    summary: "Common reasons for a declined card and the steps that usually help.",
    body: [
      "A card can be declined for several reasons. Common ones include not enough available balance, a daily spending limit, an expired card, an incorrect PIN or expiration date, or a security check on unusual activity.",
      "Holds and pending transactions lower your available balance, so a card can be declined even when your current balance looks high enough.",
      "If we've paused your card to protect you, we'll try to reach you using the contact information on file.",
    ],
    nextSteps: [
      "Check your available balance, not just your current balance.",
      "Confirm your card's expiration date and that you entered your details correctly.",
      "If you still can't use your card, submit a support request with the topic Debit card issue. Never include your full card number or PIN.",
    ],
    relatedSlugs: ["available-balance", "authorization-holds", "lost-or-stolen-card"],
    keywords: ["declined", "denied", "card", "not working", "rejected", "limit"],
  },
  {
    slug: "unfamiliar-merchant-names",
    title: "Identifying unfamiliar merchant names",
    category: "Debit Cards",
    summary: "The name on your statement doesn't always match the store name you remember. Here's why.",
    body: [
      "The name that appears on your account, called the merchant descriptor, is set by the business and its payment provider. It doesn't always match the name on the sign or website.",
      "A descriptor might show a parent company, a payment processor prefix (like a few letters followed by an asterisk), a shortened business name, a corporate billing city instead of the store's location, or an online payment name.",
      "Before assuming a charge is fraudulent, it helps to compare the date and amount with your receipts, email confirmations, and subscriptions. Many unfamiliar descriptors turn out to be businesses the member does recognize.",
    ],
    nextSteps: [
      "Compare the date and amount with your receipts, order emails, and subscriptions.",
      "Ask household members who may use the card whether they recognize the charge.",
      "Search for the descriptor's phone number or website if one is shown.",
      "If you still don't recognize it, contact the credit union through a verified channel. Don't call numbers from unexpected texts or emails.",
    ],
    relatedSlugs: ["suspicious-transactions", "contacting-us-safely", "pending-debit-card-transactions"],
    keywords: ["unfamiliar", "unknown", "merchant", "descriptor", "don't recognize", "strange name", "processor", "asterisk"],
  },
  {
    slug: "lost-or-stolen-card",
    title: "Reporting a lost or stolen card",
    category: "Debit Cards",
    summary: "Act quickly if your card is lost or stolen to help protect your money.",
    body: [
      "If your debit card is lost or stolen, report it as soon as possible. Reporting quickly helps limit unauthorized transactions.",
      "Call the number on the back of a ClearMember card or the number listed on our official website. After the card is reported, it can be blocked and a replacement can be ordered.",
      "Review your recent activity for transactions you don't recognize and let us know about any you didn't make.",
    ],
    nextSteps: [
      "Contact the credit union right away through a verified official channel.",
      "Review recent activity for any transactions you didn't make.",
      "Update any automatic payments that used your old card number once your replacement arrives.",
    ],
    relatedSlugs: ["suspicious-transactions", "contacting-us-safely", "card-declined"],
    keywords: ["lost", "stolen", "card", "missing", "report", "replace", "block"],
  },

  // ── Transfers and Payments ─────────────────────────────────────────────────
  {
    slug: "internal-transfers",
    title: "Understanding internal transfers",
    category: "Transfers and Payments",
    summary: "Transfers between your own ClearMember accounts move within the credit union.",
    body: [
      "An internal transfer moves money between accounts held at ClearMember, such as from checking to savings. Because the money never leaves the credit union, internal transfers are often among the simplest to complete.",
      "Each internal transfer creates two matching entries: money leaving one account and the same amount arriving in the other. You can open either entry to find the related one.",
      "Scheduled internal transfers wait until their scheduled processing window before money moves.",
    ],
    nextSteps: [
      "Open the transfer in Account Activity to see its status and the matching entry.",
      "If a scheduled transfer hasn't moved, check the date it was scheduled for.",
    ],
    relatedSlugs: ["external-transfer-delays", "scheduled-payments"],
    keywords: ["internal", "transfer", "between accounts", "checking", "savings", "move money"],
  },
  {
    slug: "external-transfer-delays",
    title: "Why an external transfer may be delayed",
    category: "Transfers and Payments",
    summary: "Transfers to or from other financial institutions depend on more than one organization's schedule.",
    body: [
      "An external transfer moves money between ClearMember and an account at another financial institution. Because two institutions and a payment network are involved, external transfers usually take longer than internal ones.",
      "Processing times can vary depending on the type of transfer, when it was submitted, each institution's processing schedule, weekends, and holidays. A transfer requested late on a Friday, for example, may not begin processing until the next business day.",
      "Occasionally a transfer is held for additional review, or information like an account number doesn't match. In those cases the transfer may show as delayed until the review is complete.",
    ],
    nextSteps: [
      "Open the transfer to see its current stage and timeline.",
      "Confirm the receiving account details are correct.",
      "If the transfer is marked Delayed, submit a support request with the topic Transfer delay so we can look into it.",
    ],
    relatedSlugs: ["ach-processing", "internal-transfers", "scheduled-payments"],
    keywords: ["external", "transfer", "delayed", "late", "hasn't arrived", "missing", "other bank", "slow"],
  },
  {
    slug: "ach-processing",
    title: "Understanding ACH processing",
    category: "Transfers and Payments",
    summary: "ACH is the network many direct deposits, bill payments, and external transfers use.",
    body: [
      "ACH stands for Automated Clearing House. It's a network financial institutions use to send payments to each other in batches. Direct deposits, automatic bill payments, and many external transfers use ACH.",
      "Because ACH payments are processed in batches on business days, they aren't always instant. Weekends and federal holidays can add time.",
      "An ACH payment can also be returned, for example if the account it's drawn from doesn't have enough available money. A returned payment may lead to a fee from one or both institutions.",
    ],
    nextSteps: [
      "Check the transaction status in Account Activity.",
      "Plan ahead for payments due near weekends or holidays.",
    ],
    relatedSlugs: ["external-transfer-delays", "returned-payment-fees", "scheduled-payments"],
    keywords: ["ach", "automated clearing house", "direct deposit", "batch", "business day", "autopay"],
  },
  {
    slug: "scheduled-payments",
    title: "Understanding scheduled payments",
    category: "Transfers and Payments",
    summary: "Scheduled payments and transfers move money on a date you choose.",
    body: [
      "A scheduled payment or transfer is set up ahead of time to happen on a specific date or on a repeating schedule. Until that date, it shows as initiated or scheduled rather than completed.",
      "If a scheduled date falls on a weekend or holiday, processing may happen on the next business day.",
      "Make sure enough money is available in the account on the scheduled date. Otherwise the payment could be returned or could overdraw the account.",
    ],
    nextSteps: [
      "Review upcoming transfers in Account Activity by filtering for the Transfers type.",
      "Keep enough available balance for payments scheduled in the next few days.",
    ],
    relatedSlugs: ["internal-transfers", "overdraft-fees", "ach-processing"],
    keywords: ["scheduled", "recurring", "automatic", "payment", "future", "autopay", "bill"],
  },

  // ── Fees and Charges ───────────────────────────────────────────────────────
  {
    slug: "monthly-maintenance-fees",
    title: "Understanding monthly maintenance fees",
    category: "Fees and Charges",
    summary: "Some accounts have a monthly fee that can be waived when certain requirements are met.",
    body: [
      "A monthly maintenance fee is a recurring charge for keeping an account open. Many accounts offer ways to waive it, such as receiving a direct deposit or keeping a minimum balance.",
      "In this demo, Everyday Checking has a $5.00 monthly maintenance fee that's waived in any statement cycle with at least one direct deposit or an average daily balance of $1,500 or more.",
      "The fee is assessed at the end of the statement cycle, so it reflects activity during that cycle, not the current month.",
    ],
    nextSteps: [
      "Check your account details for the fee waiver requirements.",
      "Review the statement cycle when the fee posted to see whether a waiver requirement was met.",
      "If you believe the fee should have been waived, submit a support request with the topic Account fee.",
    ],
    relatedSlugs: ["overdraft-fees", "atm-fees", "returned-payment-fees"],
    keywords: ["monthly", "maintenance", "service fee", "waive", "waiver", "fee", "charge"],
  },
  {
    slug: "overdraft-fees",
    title: "Understanding overdraft fees",
    category: "Fees and Charges",
    summary: "An overdraft fee may be charged when a payment is approved even though there isn't enough available money.",
    body: [
      "An overdraft happens when a transaction is paid even though there isn't enough available money in the account to cover it. The credit union may charge an overdraft fee for paying that item.",
      "Overdrafts often happen when a payment posts while other transactions are still pending, or when an automatic payment comes out on a day the balance is lower than expected.",
      "In this demo, the overdraft fee for Everyday Checking is $29.00 per item.",
    ],
    nextSteps: [
      "Look at the transactions posted on the same day as the fee to understand what may have caused it.",
      "Turn on low-balance alerts so you know when your balance drops.",
      "Consider linking a savings account for overdraft protection.",
      "If you have questions about a specific fee, submit a support request with the topic Account fee.",
    ],
    relatedSlugs: ["available-balance", "account-alerts", "returned-payment-fees"],
    keywords: ["overdraft", "nsf", "insufficient", "negative", "fee", "overdrawn"],
  },
  {
    slug: "atm-fees",
    title: "Identifying ATM fees",
    category: "Fees and Charges",
    summary: "Using an ATM outside the ClearMember network may lead to a fee.",
    body: [
      "Using a ClearMember ATM is free. When you use an ATM outside our network, ClearMember may charge a non-network ATM fee, and the ATM's owner may also charge its own fee.",
      "Our fee appears as a separate transaction near the withdrawal. A fee charged by the ATM owner is usually added to the withdrawal amount itself.",
      "In this demo, the ClearMember non-network ATM fee is $3.00 per withdrawal.",
    ],
    nextSteps: [
      "Look for a fee transaction posted on the same day as the ATM withdrawal.",
      "Use ClearMember ATMs when possible to avoid ClearMember's fee.",
    ],
    relatedSlugs: ["monthly-maintenance-fees", "overdraft-fees"],
    keywords: ["atm", "cash", "withdrawal", "surcharge", "non-network", "fee", "machine"],
  },
  {
    slug: "returned-payment-fees",
    title: "Understanding returned payment fees",
    category: "Fees and Charges",
    summary: "A returned payment fee may be charged when a payment from your account is sent back unpaid.",
    body: [
      "A returned payment fee may be charged when a payment drawn from your account, such as an automatic bill payment or a check you wrote, is sent back unpaid. Payments are often returned because there wasn't enough available money at the time.",
      "When a payment is returned, the company you were paying hasn't received your money. They may try again or contact you, and they may charge a fee of their own.",
      "In this demo, the returned payment fee for Everyday Checking is $25.00 per item.",
    ],
    nextSteps: [
      "Find the returned payment in Account Activity. It will show as Reversed.",
      "Contact the company you were paying to arrange payment.",
      "If you have questions about the fee, submit a support request with the topic Account fee.",
    ],
    relatedSlugs: ["ach-processing", "overdraft-fees", "monthly-maintenance-fees"],
    keywords: ["returned", "payment", "nsf", "bounced", "unpaid", "fee", "returned item"],
  },

  // ── Security ───────────────────────────────────────────────────────────────
  {
    slug: "suspicious-transactions",
    title: "Recognizing suspicious transactions",
    category: "Security",
    summary: "Signs a transaction might be unauthorized and what to do if you see one.",
    body: [
      "Suspicious transactions can include charges you didn't make, small test charges from unknown merchants, purchases in places you've never been, or several charges in a short time.",
      "Before deciding a charge is fraudulent, check whether the descriptor could be a business you know under a different name. Many unfamiliar descriptors belong to a parent company or payment processor.",
      "If you believe a transaction is unauthorized, contact the credit union as soon as possible through a verified official channel.",
    ],
    nextSteps: [
      "Review the transaction details and the unfamiliar merchant guidance.",
      "If you didn't make the transaction, contact the credit union using the number on the back of your card or our official website.",
      "Don't share one-time passcodes, PINs, or passwords with anyone who contacts you.",
    ],
    relatedSlugs: ["unfamiliar-merchant-names", "contacting-us-safely", "lost-or-stolen-card"],
    keywords: ["suspicious", "fraud", "unauthorized", "didn't make", "scam", "stolen", "dispute"],
  },
  {
    slug: "protecting-account-information",
    title: "Protecting your account information",
    category: "Security",
    summary: "Simple habits that help keep your accounts safe.",
    body: [
      "Use a strong, unique password for online banking and turn on multi-factor sign-in when it's available.",
      "ClearMember will never ask for your password, PIN, or a one-time passcode by phone, text, or email. Anyone asking for those is not us.",
      "When sending us a message, include only the last four digits of an account or card number. Never send full account numbers, card numbers, or passwords.",
    ],
    nextSteps: [
      "Update your password if you've used it on another site.",
      "Turn on account alerts so you notice unexpected activity quickly.",
    ],
    relatedSlugs: ["phishing", "contacting-us-safely", "account-alerts"],
    keywords: ["protect", "password", "pin", "security", "safe", "privacy", "passcode"],
  },
  {
    slug: "phishing",
    title: "Recognizing phishing attempts",
    category: "Security",
    summary: "Phishing messages pretend to be from a trusted source to trick you into sharing information.",
    body: [
      "Phishing is when someone pretends to be a trusted organization, like your credit union, to get you to share personal information or click a harmful link.",
      "Warning signs include urgent language (\"your account will be closed today\"), requests for passwords or passcodes, unexpected links, and sender addresses or phone numbers that look slightly off.",
      "If you aren't sure whether a message is real, don't use any link or phone number in it. Contact the credit union directly using a number or address you already trust.",
    ],
    nextSteps: [
      "Don't click links or call numbers from unexpected messages.",
      "Contact the credit union through a verified channel to confirm any request.",
      "If you shared information by mistake, contact us right away so we can help protect your account.",
    ],
    relatedSlugs: ["contacting-us-safely", "protecting-account-information", "suspicious-transactions"],
    keywords: ["phishing", "scam", "email", "text", "link", "fake", "impersonation", "smishing"],
  },
  {
    slug: "contacting-us-safely",
    title: "Contacting the credit union safely",
    category: "Security",
    summary: "How to make sure you're really talking to ClearMember.",
    body: [
      "Always contact the credit union through a channel you've verified yourself: the phone number on the back of your card, the number on our official website, or secure messaging after signing in.",
      "If someone calls you claiming to be from ClearMember and something feels wrong, hang up and call us back using a verified number.",
      "Through any channel, we'll never ask for your password, PIN, or full card number.",
    ],
    nextSteps: [
      "Save the official phone number from the back of your card in your contacts.",
      "Use the Support Requests page in this app for non-urgent questions.",
      "For suspected fraud, call the credit union using a verified number.",
    ],
    relatedSlugs: ["phishing", "suspicious-transactions", "protecting-account-information"],
    keywords: ["contact", "call", "phone", "verify", "official", "safe", "reach", "support"],
  },
];

export function getArticleBySlug(slug: string): SupportArticle | undefined {
  return articles.find((article) => article.slug === slug);
}
