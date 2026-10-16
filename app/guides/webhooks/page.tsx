import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { webhookEventGroups, webhookEventTypes } from "@/lib/webhook-events";

export const metadata: Metadata = { title: "Webhook events" };

const envelope = `POST /mindbill/webhooks HTTP/1.1
content-type: application/json
user-agent: MindBill-Webhooks/1.0
mindbill-event-id: evt_example
mindbill-signature: t=1791910800,v1=5f0c…hex HMAC-SHA256…

{
  "id": "evt_example",
  "organizationId": "org_example",
  "sequence": "4218",
  "type": "rfa.decision_recorded",
  "apiVersion": "2026-08-16",
  "createdAt": "2026-10-08T17:02:11.000Z",
  "data": {
    "rfaId": "rfa_example",
    "decidedAt": "2026-10-08",
    "itemIds": ["rfaitem_example"],
    "status": "approved"
  }
}`;

const verify = `import crypto from "node:crypto";

// rawBody is the exact request body string; do not re-serialize parsed JSON.
export function verifyMindBillWebhook(rawBody: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((part) => part.split("=")));
  const expected = crypto.createHmac("sha256", secret).update(\`\${parts.t}.\${rawBody}\`).digest("hex");
  const valid = typeof parts.v1 === "string" && parts.v1.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
  const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
  return valid && fresh;
}`;

const subscribe = `curl https://app.mindbill.org/partner/v2/developer/account/webhook-endpoints \\
  --header "Authorization: Bearer $MINDBILL_ACCOUNT_KEY" \\
  --header 'Content-Type: application/json' \\
  --header 'Idempotency-Key: rfa-webhook-1' \\
  --data '{"url":"https://example.com/mindbill/webhooks","eventTypes":["rfa.submitted","rfa.received","rfa.decision_recorded","rfa.follow_up_due"]}'`;

export default function WebhooksPage() {
  return <DocPage eyebrow="Reference" title="Webhook events" description={`All ${webhookEventTypes.length} event types MindBill sends to webhooks and the events stream, with the signed envelope.`}
    toc={[{ id: "envelope", label: "Envelope and signature" }, { id: "subscribe", label: "Subscribe" }, ...webhookEventGroups.map(({ id, title }) => ({ id, label: title }))]}
    previous={{ href: "/api-reference/events", label: "List lifecycle events" }} next={{ href: "/api-reference/webhook-deliveries", label: "Webhook deliveries" }}>
    <p>Webhooks and <Link href="/api-reference/events">GET /partner/v2/events</Link> carry the same event types and data. A webhook tells you something changed; reread the bill or RFA for its current state. Delivery is at least once and can arrive out of order, so deduplicate by <code>id</code> and use <code>sequence</code> to order events within an organization.</p>
    <h2 id="envelope">Envelope and signature</h2>
    <p>Each delivery is a JSON <code>POST</code>. The body includes <code>organizationId</code> so one receiver can route events for several customer organizations. The events stream returns the same fields without <code>organizationId</code>, because it is already scoped to one organization.</p>
    <CodeBlock code={envelope} language="http" filename="rfa.decision_recorded delivery" />
    <p>Verify <code>mindbill-signature</code> before trusting the body: compute an HMAC-SHA256 of <code>{"{t}.{raw body}"}</code> with the endpoint&apos;s signing secret and compare it with <code>v1</code>. Reject stale timestamps. Return a 2xx response only after you have durably stored the event; MindBill retries failures up to ten times with increasing delays.</p>
    <CodeBlock code={verify} language="ts" filename="server/verify-webhook.ts" />
    <Callout title="No clinical details in events">RFA events carry opaque IDs, status, and dates. Notes, reasons, and documents stay behind authenticated reads.</Callout>
    <h2 id="subscribe">Subscribe to specific events</h2>
    <p>Create an endpoint with <code>eventTypes</code> to receive a subset, or omit it to receive every type. Set <code>organizationId</code> to limit an endpoint to one customer organization. See <Link href="/guides/partner-integration">partner integration</Link> for account-wide endpoints.</p>
    <CodeBlock code={subscribe} language="bash" filename="Create an RFA webhook endpoint" />
    {webhookEventGroups.map((group) => <section key={group.id}>
      <h2 id={group.id}>{group.title}</h2>
      <p>{group.description}</p>
      <div className="term-list compact webhook-events">
        {group.events.map(([type, meaning]) => <div key={type}><b><code>{type}</code></b><p>{meaning}</p></div>)}
      </div>
    </section>)}
    <p>RFA events require the organization&apos;s <code>treatmentBilling</code> capability. See <Link href="/guides/treatment-billing#webhooks">treatment billing</Link> for which events to act on.</p>
  </DocPage>;
}
