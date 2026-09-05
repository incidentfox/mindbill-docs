import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import {
  ActivityTimelinePlayground,
  LifecycleActionsPlayground,
  LifecyclePlayground,
} from "@/components/playground";

export const metadata: Metadata = { title: "Billing lifecycle and actions" };

const read = `const { data: status } = await mindbill.getBillStatus(billId);
const { data: eor } = await mindbill.getBillEor(billId);

// Render status.state and status.balanceDue in your application.
// eor.lineItems and eor.documents contain payer response details.`;

const actions = `// Payment received after an EOR.
await mindbill.performBillAction(billId, {
  action: "post_payment",
  amount: 650,
  method: "eft",
  depositDate: "2026-09-04",
}, "payment-bill-123-1");

// Close a bill at any stage.
await mindbill.performBillAction(
  billId,
  { action: "close", reason: "Resolved outside billing" },
  "close-bill-123",
);`;

const review = `const { data: secondReview } = await mindbill.createBillReview(
  billId,
  {
    type: "second_review",
    reason: "The report satisfies the medical-legal criteria.",
    payerClaimControlNumber: "PCCN-88421",
    disputedAmount: 2015,
    attachmentIds: [reportId, eorId],
  },
  "create-sbr-bill-123",
);

await mindbill.submitBillReview(
  billId,
  secondReview.id,
  "submit-sbr-bill-123",
);`;

const correction = `// correctedBill is the full, reviewed bill payload.
const response = await fetch(
  \`https://app.mindbill.org/partner/v2/bills/\${billId}/actions\`,
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.MINDBILL_API_KEY}\`,
      "Content-Type": "application/json",
      "Idempotency-Key": "correct-bill-123-attempt-2",
    },
    body: JSON.stringify({
      action: "resubmit",
      actorName: authorizedUser.displayName,
      reason: "Corrected the rejected claim number",
      bill: correctedBill,
      documents: selectedBillingDocuments,
    }),
  },
);
if (!response.ok) throw new Error(\`Correction failed: \${response.status}\`);`;

const event = `{
  "id": "evt_0189",
  "sequence": "4217",
  "type": "bill.denied",
  "apiVersion": "2026-08-01",
  "createdAt": "2026-08-25T17:42:18Z",
  "data": {
    "billId": "bill_123",
    "balanceDue": 2015,
    "reason": "Medical necessity or frequency"
  }
}`;

export default function LifecyclePage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Follow the whole bill lifecycle"
      description="Submission is the beginning, not the end. MindBill normalizes acknowledgments, EORs, payments, denials, reviews, corrected replacements, and closure."
      toc={[
        { id: "states", label: "From submission to payment" },
        { id: "status", label: "Read status and EORs" },
        { id: "actions", label: "Take the next action" },
        { id: "history", label: "Show bill history" },
        { id: "reviews", label: "SBR and IBR" },
        { id: "communications", label: "Notes and courtesy copies" },
        { id: "events", label: "Events and webhooks" },
      ]}
      previous={{ href: "/guides/documents", label: "Documents" }}
      next={{ href: "/components/react", label: "React components" }}
    >
      <h2 id="states">From submission to payment</h2>
      <div className="plain-steps">
        <div><b>1</b><h3>Submitted</h3><p>MindBill sends the claim through the selected electronic or manual route.</p></div>
        <div><b>2</b><h3>Acknowledged</h3><p>999 and 277CA responses report whether the electronic transaction was structurally accepted. Acceptance is not payment.</p></div>
        <div><b>3</b><h3>Adjudicated</h3><p>The claims administrator issues an EOR explaining allowed amounts, payments, reductions, or denials.</p></div>
        <div><b>4</b><h3>Resolved</h3><p>Record payment, correct a rejection, request review of a disputed amount, or close the bill.</p></div>
      </div>
      <Callout title="One normalized state">Clearinghouse transport states and payer adjudication states are different. MindBill preserves the underlying events while exposing a compact status and the actions currently available.</Callout>

      <h2 id="status">Read status and EORs</h2>
      <p>The status endpoint is suitable for a case header, receivables list, or background reconciliation job. The EOR endpoint returns normalized line items plus the original PDF when available.</p>
      <CodeBlock code={read} filename="server/read-lifecycle.ts" />
      <p>The connected workspace combines that read model with native dialogs for every available action. The remittance surface distinguishes amount billed, payer allowed and reported paid amounts, principal posted to the bill, penalty and interest, total cash received, and remaining balance. Its payment ledger records partial payments, payment references, effective and deposit dates, and EOR source.</p>
      <Callout title="Bill ID and session only"><code>ConnectedBillLifecycle</code> accepts the bill ID plus <code>getSession</code> or <code>sessionEndpoint</code>. It does not accept bill initial data: the component always reads the current immutable snapshot and lifecycle data from MindBill.</Callout>
      <LifecyclePlayground />

      <h2 id="actions">Take the next action</h2>
      <p>Read <code>lifecycle.actions</code> instead of reproducing payer rules in your application. MindBill returns only the actions that make sense for the current bill and explains why an unavailable action is disabled.</p>
      <div className="data-table networks">
        <div className="table-head"><b>Bill state</b><b>Typical next actions</b></div>
        <div><code>rejected</code><span>Submit a new corrected snapshot, or close.</span></div>
        <div><code>accepted / processed</code><span>Track the response, or close.</span></div>
        <div><code>denied / partially_paid</code><span>View EOR, post payment, request Second Bill Review, or close.</span></div>
        <div><code>second_review</code><span>Track SBR; request IBR when MindBill reports eligibility.</span></div>
        <div><code>paid / closed</code><span>Read EOR and history; no collection action remains.</span></div>
      </div>
      <LifecycleActionsPlayground />
      <CodeBlock code={actions} filename="server/bill-actions.ts" />
      <details className="optional-detail"><summary>Correct a rejected bill</summary>
        <p>Use the <code>resubmit</code> action on the original bill. It preserves the logical bill ID and creates a new immutable submission attempt. Send the full corrected bill and the documents selected for that attempt; this is not a partial update or a new unrelated bill.</p>
        <CodeBlock code={correction} filename="server/correct-bill.ts" />
        <p>This server-side example assumes your application has authenticated <code>authorizedUser</code>, checked their access to <code>billId</code>, and prepared the <Link href="/api-reference/create-bill">bill and document payloads</Link>. The <Link href="/api-reference/bill-actions">action endpoint</Link> also accepts browser credentials. The connected lifecycle component provides the correction dialog for you.</p>
      </details>

      <h2 id="history">Show bill history</h2>
      <p>The connected lifecycle response includes newest-first <code>activity</code>. <code>BillActivityTimeline</code> renders it directly, or accepts the same records from your own webhook-backed store.</p>
      <p>In React 0.48.0 and later, submission cards open the selected submission&apos;s Bill details; Bill history remains a separate, explicit tab. Custom interfaces can read <code>lifecycle.submissionDetails</code>, matching both <code>attemptId</code> and <code>billId</code>. A <code>submission_snapshot</code> is the captured outgoing detail, <code>bill_record</code> is a labeled legacy fallback, and <code>unavailable</code> means no trustworthy detail exists. Do not replace missing historical data with today&apos;s bill or turn unrecorded historical payment amounts into zero.</p>
      <ActivityTimelinePlayground />
      <Callout title="Read for UI, webhooks for durable sync">The bill endpoint is enough to render the current screen. Use signed webhooks to trigger synchronization after the browser closes, then reconcile the current state from the API.</Callout>

      <h2 id="reviews">Second Bill Review before IBR</h2>
      <p>California payment disputes generally begin with Second Bill Review. If the dispute remains eligible after SBR, the provider may proceed to Independent Bill Review. Medical-legal SBR uses the DWC SBR-1 process and supporting documents.</p>
      <CodeBlock code={review} filename="server/second-review.ts" />
      <p>The connected Second Review dialog can correct a selected service line&apos;s units, modifiers, and charge for the new submission. Review the charge explicitly: changing units or modifiers does not automatically reprice the bill. For a custom browser UI using <code>@mindbill/browser</code> 0.29.0 or later, <code>submitSecondReview</code> accepts <code>lineItems[].correction</code> with all three absolute values: <code>units</code>, <code>modifiers</code>, and <code>charge</code>. Omit the correction to preserve that line. This lifecycle-action payload differs from the review-record example above; both endpoints accept server or browser credentials.</p>
      <Callout tone="warning" title="Deadlines matter">Your application should surface the dates and payer instructions returned with the EOR. MindBill provides the workflow primitives, but the provider remains responsible for timely and accurate review requests.</Callout>

      <h2 id="communications">Team notes and courtesy copies</h2>
      <p><code>ConnectedBillLifecycle</code> includes team notes and Forward copy on the current bill. Notes are workspace-only and do not enter the outgoing bill packet. Historical submission views remain read-only. Server actions require <code>bills:write</code>; browser actions require an origin-bound session with <code>bills:act</code> and access to the bill.</p>
      <p>Forward copy previews a combined PDF containing the mandatory submission cover sheet, the optional CMS-1500, and selected bill documents. The user reviews recipients, message, and packet before confirming. MindBill uses the workspace inbox for sender and reply routing. Forwarding is for the recipient&apos;s records: it neither submits the claim nor changes its billing status.</p>
      <p>Partners can supply their own case-contact options through the <code>courtesyCopyRecipientOptions</code> prop on <code>ConnectedBillLifecycle</code>, or the <code>getCourtesyCopyRecipientOptions</code> callback on <code>ConnectedBillingWorkspace</code>. These named email suggestions appear in the To/CC chooser; users can also enter an address manually. Suggestions do not grant permission to disclose the packet, trigger a send, or enroll contacts in automatic notifications.</p>
      <Callout title="Preview, confirm, then send">Custom integrations call <code>POST /partner/v2/bills/&#123;billId&#125;/courtesy-forward</code> with <code>mode: &quot;preview&quot;</code>, then confirm with <code>mode: &quot;send&quot;</code>, the returned <code>packetHash</code>, and an <code>Idempotency-Key</code>. Changes to recipients, message, or packet require another preview. Never create a new key to retry an uncertain delivery. A sandbox response is simulated: inspect <code>sent</code> and <code>simulated</code>, not only <code>ok</code>.</Callout>

      <h2 id="events">Use events for durable synchronization</h2>
      <p>Component callbacks keep the current screen responsive. Signed webhooks should update your database in the background. Store the event ID before processing so a retry is harmless.</p>
      <p>Verified console members can opt into their own status and aging emails in the developer console&apos;s Settings → Notifications. Preferences are separate for each workspace and environment; sandbox previews never send email. Opting in does not send historical catch-up messages. These notices contain no patient or bill details.</p>
      <Callout title="Notify your own application users">For doctors or staff who do not have a MindBill console membership, use signed webhooks to drive your application&apos;s notification preferences and delivery. Courtesy-copy recipient options are not notification subscriptions, and the console preference API cannot enroll arbitrary recipient addresses.</Callout>
      <CodeBlock code={event} language="json" filename="bill.denied.json" />
    </DocPage>
  );
}
