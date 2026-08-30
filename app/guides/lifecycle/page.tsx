import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Lifecycle and actions" };

const status = `const status = await mindbill.getBillStatus(billId);
const eor = await mindbill.getBillEor(billId);

if (status.data.state === "denied") {
  const review = await mindbill.createBillReview(
    billId,
    {
      type: "second_review",
      reason: "The report satisfies the med-legal criteria.",
      attachmentIds: ["doc_report", "doc_eor"],
    },
    "second-review-bill-123",
  );

  await mindbill.submitBillReview(
    billId,
    review.data.id,
    "submit-second-review-bill-123",
  );
}`;

const event = `{
  "id": "evt_0189",
  "type": "bill.denied",
  "billId": "bill_123",
  "occurredAt": "2026-08-25T17:42:18Z",
  "data": {
    "state": "denied",
    "balanceDue": 2015,
    "reason": "Medical necessity or frequency"
  }
}`;

export default function LifecyclePage() {
  return (
    <DocPage eyebrow="Build" title="Status, EORs, and next actions" description="MindBill owns the lifecycle. Your product can read one normalized status and offer only the actions that make sense for that state."
      toc={[{ id: "states", label: "State-aware actions" }, { id: "server", label: "Server API" }, { id: "events", label: "Events" }]}
      previous={{ href: "/guides/documents", label: "Documents" }} next={{ href: "/components/react", label: "React components" }}>
      <h2 id="states">State-aware actions</h2>
      <ul>
        <li><strong>Rejected:</strong> correct the bill and resubmit.</li>
        <li><strong>Denied or partially paid:</strong> attach support and submit Second Bill Review; use IBR when eligible.</li>
        <li><strong>EOR received:</strong> view the original PDF and record payment.</li>
        <li><strong>Any stage:</strong> close the bill with a reason.</li>
      </ul>
      <Callout title="Prefer the lifecycle component">The React and Angular components fetch status, EORs, denial context, and the allowed action set. Partners do not need to reproduce this decision tree.</Callout>
      <h2 id="server">Use the server API when you need control</h2>
      <CodeBlock code={status} filename="server/lifecycle.ts" />
      <h2 id="events">Receive signed events</h2>
      <p>Use events or webhooks for background synchronization. Each event has an ordered cursor, stable bill ID, and normalized state.</p>
      <CodeBlock code={event} language="json" filename="bill.denied" />
    </DocPage>
  );
}

