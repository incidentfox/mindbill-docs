// Every webhook and event-stream type MindBill emits (PARTNER_WEBHOOK_EVENT_TYPES in the MindBill API).
// Subscribe an endpoint to a subset with eventTypes, or omit it to receive all of them.

export type WebhookEventGroup = { id: string; title: string; description: string; events: Array<[type: string, meaning: string]> };

export const webhookEventGroups: WebhookEventGroup[] = [
  {
    id: "bill-events", title: "Bills",
    description: "Lifecycle changes for a submitted bill. data carries billId plus event-specific fields; reread the bill for its current state.",
    events: [
      ["bill.created", "A bill was created."],
      ["bill.submitted", "The bill was submitted through its delivery route."],
      ["bill.accepted", "The clearinghouse or payer acknowledged the submission. Acceptance is not payment."],
      ["bill.rejected", "The submission was rejected and needs correction."],
      ["bill.denied", "The claims administrator denied the bill."],
      ["bill.partially_paid", "A payment left a balance due."],
      ["bill.paid", "The bill was paid in full."],
      ["bill.second_review", "A Second Bill Review was requested."],
      ["bill.ibr", "Independent Bill Review was requested."],
      ["bill.lien", "The bill moved to a lien."],
      ["bill.closed", "The bill was closed."],
      ["bill.written_off", "The remaining balance was written off."],
      ["bill.no_response", "No payer response arrived within the follow-up threshold."],
      ["bill.aging_bucket_changed", "The bill moved to a new aging bucket."],
      ["bill.follow_up_opened", "A no-response follow-up task opened. data: billId, followUpId, kind, dueAt."],
      ["bill.follow_up_resolved", "The follow-up task was resolved by response or payment evidence, dismissal, or closure."],
      ["bill.note_added", "A note was added to the bill."],
      ["bill.courtesy_copy_sent", "A user sent a courtesy copy of the bill."],
      ["bill.autofill_completed", "Report autofill finished extracting suggestions."],
    ],
  },
  {
    id: "payment-events", title: "Payments and EORs",
    description: "Money and payer responses. Reconcile amounts from the bill's EOR and payment reads, not from callback order.",
    events: [
      ["payment.posted", "A payment was posted to the bill."],
      ["eor.received", "An Explanation of Review (EOR) or remittance was received."],
    ],
  },
  {
    id: "organization-events", title: "Organization",
    description: "Customer organization setup.",
    events: [["org.onboarding_completed", "The organization completed onboarding and can submit bills."]],
  },
  {
    id: "rfa-activity", title: "RFA activity",
    description: "Changes to a Request for Authorization. data carries rfaId plus opaque IDs for the change; clinical notes and reasons are not included.",
    events: [
      ["rfa.created", "A draft RFA was created."],
      ["rfa.updated", "The request changed, for example a draft edit, signature, or treatment closure (action treatment_closed or treatment_reopened)."],
      ["rfa.document_added", "A document was attached to the RFA."],
      ["rfa.transmission_recorded", "Delivery or receipt evidence was recorded for a transmission."],
      ["rfa.information_requested", "The claims administrator requested more information."],
      ["rfa.information_request_responded", "A response to an information request was recorded."],
      ["rfa.information_receipt_reviewed", "Requested-information receipt was reviewed."],
      ["rfa.decision_recorded", "Utilization review decisions were recorded for one or more treatments. data: rfaId, decidedAt, itemIds, status."],
      ["rfa.decision_corrected", "A recorded decision was corrected; the previous decision stays in history."],
    ],
  },
  {
    id: "rfa-status", title: "RFA status",
    description: "Emitted when the request's status changes to the named value. lifecycleStatus on the RFA read summarizes delivery separately.",
    events: [
      ["rfa.draft", "Draft."], ["rfa.ready", "Signed and ready to send."], ["rfa.submitted", "Sent to the claims administrator."],
      ["rfa.received", "Receipt by the claims administrator was recorded."], ["rfa.incomplete", "Marked incomplete."],
      ["rfa.under_review", "Under utilization review."], ["rfa.deferred", "Review deferred."], ["rfa.approved", "All treatments approved."],
      ["rfa.modified", "Treatments approved with modification."], ["rfa.denied", "All treatments denied."],
      ["rfa.mixed", "Treatments have different outcomes."], ["rfa.canceled", "Canceled."], ["rfa.closed", "Every treatment has a final decision or administrative closure."],
    ],
  },
  {
    id: "rfa-follow-ups", title: "RFA follow-ups",
    description: "Backend-derived follow-up tasks such as no response, deadline review, Post UR, and scheduling. data carries opaque IDs and the task kind, without contact notes.",
    events: [
      ["rfa.follow_up_opened", "A follow-up task opened."],
      ["rfa.follow_up_due", "A follow-up task became due."],
      ["rfa.follow_up_updated", "A follow-up task was assigned, snoozed, or updated."],
      ["rfa.follow_up_resolved", "The underlying work was completed and the task resolved."],
    ],
  },
];

export const webhookEventTypes = webhookEventGroups.flatMap((group) => group.events.map(([type]) => type));
