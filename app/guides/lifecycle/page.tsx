import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Lifecycle and actions" };

const status = `import { createBillLifecycleClient } from "@mindbill/browser";

const billing = createBillLifecycleClient({
  billId,
  sessionEndpoint: "/api/mindbill/session",
});

const lifecycle = await billing.getLifecycle();

if (lifecycle.bill.status === "denied") {
  await billing.submitSecondReview({
    reason: "The report satisfies the med-legal criteria.",
    payerClaimControlNumber,
    disputedAmount: lifecycle.bill.balanceDue,
    attachmentIds: lifecycle.bill.attachments.map((file) => file.id),
    route: "ebill",
  });
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
      toc={[{ id: "states", label: "State-aware actions" }, { id: "browser", label: "Browser client" }, { id: "events", label: "Events" }]}
      previous={{ href: "/guides/documents", label: "Documents" }} next={{ href: "/components/react", label: "React components" }}>
      <h2 id="states">State-aware actions</h2>
      <ul>
        <li><strong>Rejected:</strong> correct the bill and resubmit.</li>
        <li><strong>Denied or partially paid:</strong> attach support and submit Second Bill Review; use IBR when eligible.</li>
        <li><strong>EOR received:</strong> view the original PDF and record payment.</li>
        <li><strong>Any stage:</strong> close the bill with a reason.</li>
      </ul>
      <Callout title="Prefer the lifecycle component">The React and Angular components fetch status, EORs, denial context, and the allowed action set. Partners do not need to reproduce this decision tree.</Callout>
      <h2 id="browser">Use the same session-aware browser client</h2>
      <p>The browser client reads the normalized lifecycle and performs authorized actions directly. The API key remains on your server only for minting the short-lived session.</p>
      <CodeBlock code={status} filename="billing-actions.ts" />
      <h2 id="events">Receive signed events</h2>
      <p>Use component callbacks for immediate UI updates. Use signed webhooks or the ordered event feed for durable background synchronization; never treat a browser callback as your source of truth.</p>
      <CodeBlock code={event} language="json" filename="bill.denied" />
    </DocPage>
  );
}
