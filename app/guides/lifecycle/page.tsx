import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Billing lifecycle and actions" };

const read = `const { data: status } = await mindbill.getBillStatus(billId);
const { data: eor } = await mindbill.getBillEor(billId);

console.log(status.state, status.balanceDue);
console.log(eor.lineItems, eor.documents);`;

const actions = `// A clearinghouse rejection: create an editable correction draft.
const correction = await mindbill.performBillAction(
  billId,
  { action: "start_correction" },
  "correct-bill-123-v1",
);

// Payment received after an EOR.
await mindbill.performBillAction(billId, {
  action: "post_payment",
  amount: 2015,
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
      description="Submission is the beginning, not the end. MindBill normalizes acknowledgments, EORs, payments, denials, reviews, corrections, and closure behind one bill ID."
      toc={[
        { id: "states", label: "From submission to payment" },
        { id: "status", label: "Read status and EORs" },
        { id: "actions", label: "Take the next action" },
        { id: "reviews", label: "SBR and IBR" },
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

      <h2 id="actions">Take the next action</h2>
      <ul>
        <li><strong>Rejected:</strong> start a correction, edit the replacement draft, and submit it again.</li>
        <li><strong>EOR received:</strong> show the original EOR and record check or EFT payment.</li>
        <li><strong>Denied or underpaid:</strong> add support and request Second Bill Review.</li>
        <li><strong>Any stage:</strong> close the bill with an auditable reason.</li>
      </ul>
      <CodeBlock code={actions} filename="server/bill-actions.ts" />

      <h2 id="reviews">Second Bill Review before IBR</h2>
      <p>California payment disputes generally begin with Second Bill Review. If the dispute remains eligible after SBR, the provider may proceed to Independent Bill Review. Medical-legal SBR uses the DWC SBR-1 process and supporting documents.</p>
      <CodeBlock code={review} filename="server/second-review.ts" />
      <Callout tone="warning" title="Deadlines matter">Your application should surface the dates and payer instructions returned with the EOR. MindBill provides the workflow primitives, but the provider remains responsible for timely and accurate review requests.</Callout>

      <h2 id="events">Use events for durable synchronization</h2>
      <p>Component callbacks keep the current screen responsive. Signed webhooks or the ordered event feed should update your database in the background. Store the event ID before processing so a retry is harmless.</p>
      <CodeBlock code={event} language="json" filename="bill.denied.json" />
    </DocPage>
  );
}
