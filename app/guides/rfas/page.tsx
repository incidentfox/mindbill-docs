import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Requests for Authorization" };

const draft = `// Server-side example. Resolve these saved IDs within the authorized organization.
const response = await fetch("https://app.mindbill.org/partner/v2/rfas", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + process.env.MINDBILL_API_KEY,
    "Content-Type": "application/json",
    "Idempotency-Key": "rfa-example-plan-1",
  },
  body: JSON.stringify({
    claimId: savedClaim.id,
    patientId: savedClaim.patientId,
    renderingProviderId: savedProvider.id,
    employeeName: reviewedEmployeeName,
    providerName: reviewedProviderName,
    items: [{ diagnosisCode: "M54.50", serviceDescription: "Reviewed treatment plan" }],
  }),
});
if (!response.ok) throw new Error("Unable to save authorization request");
const { data: rfa } = await response.json();
// Persist rfa.id with your treatment plan. This saves an unsigned draft; it sends no fax.`;

const dashboard = `"use client";
import { RfaDashboard, type RfaDashboardProps } from "@mindbill/react";

// Resolve these props from your authenticated host session and authorized case.
export function Authorizations(props: Pick<
  RfaDashboardProps, "claimId" | "initialDraft" | "permissions" | "actorReference"
>) {
  return <RfaDashboard
    sessionEndpoint="/api/mindbill/rfa-session"
    {...props}
    environment="sandbox" />;
}
// The host endpoint authenticates the user and grants only authorized scopes.
// permissions defaults to [] (read-only); map host roles to create/edit/sign/send.
// actorReference: stable host human ID, e.g. session.user.id, never an API key.
// Resolve initialDraft's saved claim/provider IDs within the authorized organization.
// Use environment="live" only with a live session and enabled fax configuration.`;

export default function RfasPage() {
  return <DocPage eyebrow="Build" title="Requests for Authorization" description="Create a treatment request, review and send its signed packet, then track receipt, review, decisions, and treatment scheduling."
    toc={[{ id: "access", label: "Access and setup" }, { id: "component", label: "Prebuilt dashboard" }, { id: "draft", label: "Draft and sign" }, { id: "send", label: "Packet and fax" }, { id: "track", label: "Dashboard and decisions" }, { id: "billing", label: "Link authorized treatment" }, { id: "routes", label: "API map" }]}
    previous={{ href: "/learn/treatment-quickstart", label: "Treatment quickstart" }} next={{ href: "/guides/documents", label: "Documents and attachments" }}>
    <h2 id="access">Enable treatment access and resolve saved records</h2>
    <p>Requests for Authorization (RFAs) are separate from bills. The organization must have <code>treatmentBilling</code> enabled. Server API keys use <code>rfas:read</code> and <code>rfas:write</code>; browser sessions use the narrower <code>rfas:read</code>, <code>rfas:create</code>, <code>rfas:edit</code>, <code>rfas:act</code>, and <code>rfas:sign</code> permissions appropriate to the user. Opening stored RFA documents also needs <code>documents:read</code>. Browser RFA access requires an organization-wide session and its exact allowed origin.</p>
    <p>A draft needs a saved claim, its matching patient, and a rendering provider in the same organization. Resolve and authorize those records before opening the form. A display name, external case ID, or NPI is not a substitute for a saved MindBill ID. Bill-scoped sessions cannot access RFAs.</p>
    <h2 id="component">Mount the prebuilt dashboard</h2>
    <p>React 0.62.0&apos;s <code>RfaDashboard</code> handles filters, status totals, request details, draft creation, clinical PDF upload, signing preview and authorized signature, packet and cover-sheet review, claims administrator destinations, explicit fax sending, and delivery evidence. It displays existing item decisions and review history. Supply a separate host session endpoint for the authorized RFA permissions.</p>
    <CodeBlock code={dashboard} language="tsx" filename="Authorizations.tsx" />
    <p>The dashboard works without a custom continuation page. Its optional <code>onContinue</code> adds an “Open in your application” action. All changes require an explicit user action; rendering the dashboard never signs or sends. The default environment is sandbox, where fax delivery stays disabled. For a custom interface, browser 0.38.0 exports <code>createRfaClient</code> with <code>list</code>, <code>get</code>, <code>createDraft</code>, <code>getDocument</code>, <code>uploadDocument</code>, <code>prepareSigning</code>, <code>sign</code>, <code>previewPacket</code>, <code>sendFax</code>, and <code>refreshFaxes</code>.</p>
    <p>Grant <code>rfas:read</code> for the list, detail, and packet; <code>documents:read</code> for document/signing previews; and <code>payers:read</code> for the destination directory. Match the component&apos;s <code>permissions</code> controls to server scopes: <code>create → rfas:create</code>, <code>edit → rfas:edit</code>, <code>sign → rfas:sign</code>, and <code>send → rfas:act</code>. The server enforces access independently of these UI props. Before signing, save the physician&apos;s signature once in <a href="https://app.mindbill.org/settings/rendering-providers" target="_blank" rel="noreferrer">MindBill → Settings → Rendering providers</a>. The public BillingSettings profile does not accept signature fields. An authorized human must review the exact preview and confirm physician authorization.</p>
    <h2 id="draft">Create the draft and review the signed form</h2>
    <p>Capture the treatment items and diagnoses, requesting provider, claims administrator, rationale, request/review type, and any expedited-review information. React&apos;s <code>RfaDraftForm</code> provides a structured editor; the <Link href="/learn/treatment-quickstart#rfa">treatment quickstart</Link> shows its draft input.</p>
    <CodeBlock code={draft} language="ts" filename="server/create-rfa.ts" />
    <p>Generate the form with <code>POST /rfas/&#123;rfaId&#125;/form</code>. Generation alone does not sign the request or make it ready to send. Upload a reviewed, signed form as an <code>rfa_form</code> document with its actual signing date, or use the signing-preview and sign endpoints with an authorized signer. Keep the signed form and relevant clinical support in the RFA&apos;s document list.</p>
    <h2 id="send">Review the authorization destination and exact packet</h2>
    <p>Use the claims administrator&apos;s authorization contact or utilization review destination. It can differ from the destination used to send bills. <code>RfaAuthorizationDestination</code> provides the React destination control. Confirm the intended recipient and fax number before sending; a directory match still needs user review.</p>
    <p>Preview the packet assembled from the exact stored signed <code>rfa_form</code> and clinical supporting PDFs. The server verifies stored hashes and PDF content. Packet assembly does not transmit anything. When no stored fax cover is selected, packet assembly generates a cover sheet. Review the complete packet and cover details before authorizing the send.</p>
    <Callout title="Track delivery and receipt separately">Queued, dispatched, delivered, received, and approved describe different events. A send acknowledgment is not proof of delivery or authorization. Refresh transmission evidence after sending. If the outcome is uncertain, reconcile the existing transmission before retrying; do not send a second fax just because a request timed out.</Callout>
    <p>Live fax requires the enabled organization configuration. Use sandbox to test drafts and review states without contacting a real claims administrator. Keep RFA packets separate from ordinary bill attachments and routing.</p>
    <h2 id="track">Track the request and each treatment item</h2>
    <p>List RFAs with filters for claim, rendering provider, status, and inclusive UTC creation dates. The list&apos;s <code>summary</code> covers the complete filtered result, while <code>nextCursor</code> pages through records. A dashboard should show draft/ready requests, submission and receipt evidence, requests for information, deferred review, item decisions, and follow-up work.</p>
    <p>Read transmissions and events for the history. The dashboard displays existing information requests and decisions. Use the API routes below for recording information requests, receipt of requested materials, decisions, corrections, and scheduling; those editors are not included in the dashboard. Review any resulting clock changes. Record approval, modification, or denial per treatment item from actual utilization review evidence. Mixed decisions remain visible at the item level. Store response documents and use decision corrections when evidence changes.</p>
    <p>Follow-up tasks and calculated deadlines help staff prioritize work; they do not establish authorization. Track scheduling for approved treatment separately from the authorization decision. Copy a prior RFA or use a template to start another request without changing the prior signed record.</p>
    <h2 id="billing">Link authorization to the treatment bill</h2>
    <p>After the service occurs, create a <code>professional</code> bill with reviewed dates, procedure codes, charges, and line-level diagnosis pointers. Set <code>serviceLines[].rfaItemId</code> when a line relates to a saved RFA item. The server validates the relationship and authorization constraints; the presence of the ID alone is not evidence of approval.</p>
    <p>Attach relevant authorization or Medical Provider Network (MPN) records as optional <code>other</code> bill documents when needed. See <Link href="/guides/documents#authorization">authorization and network documents</Link>. The full RFA packet stays in its separate authorization workflow.</p>
    <h2 id="routes">Canonical API map</h2>
    <p>Short suffixes in each row continue after <code>/rfas/&#123;rfaId&#125;</code>; top-level paths start with <code>/rfa</code>. All routes below are relative to <code>https://app.mindbill.org/partner/v2</code>. Read the <a href="https://app.mindbill.org/partner-openapi.yaml" target="_blank" rel="noreferrer">OpenAPI contract</a> for request fields, permissions, response envelopes, and idempotency requirements. Browser and server clients use the same business routes with their respective credentials.</p>
    <table><thead><tr><th>Workflow</th><th>Routes</th></tr></thead><tbody>
      <tr><td>List, create, inspect, edit</td><td><code>/rfas</code>, <code>/rfas/&#123;rfaId&#125;</code></td></tr>
      <tr><td>Draft, copy, templates</td><td><code>/rfas/&#123;rfaId&#125;/draft</code>, <code>/copy</code>, <code>/rfa-templates</code></td></tr>
      <tr><td>Form and signing</td><td><code>/rfas/&#123;rfaId&#125;/form</code>, <code>/signing-preview</code>, <code>/sign</code></td></tr>
      <tr><td>Stored documents and packet preview</td><td><code>/rfas/&#123;rfaId&#125;/documents</code>, <code>/document-library</code>, <code>/packet</code>, <code>/packets</code></td></tr>
      <tr><td>Fax and delivery evidence</td><td><code>/rfas/&#123;rfaId&#125;/fax</code>, <code>/fax/refresh</code>, <code>/transmissions</code></td></tr>
      <tr><td>Review, decisions, and history</td><td><code>/rfas/&#123;rfaId&#125;/information-requests</code>, <code>/information-receipt-review</code>, <code>/decisions</code>, <code>/decision-corrections</code>, <code>/events</code></td></tr>
      <tr><td>Follow-up and scheduling</td><td><code>/rfa-follow-ups</code>, <code>/rfas/&#123;rfaId&#125;/scheduling</code>, <code>/items/&#123;itemId&#125;/scheduling</code></td></tr>
    </tbody></table>
  </DocPage>;
}
