import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DemoVideo } from "@/components/demo-video";
import { BillUrDecisionsPlayground, RelatedRecordsPlayground, RfaClaimIndexPlayground, TreatmentBillPlayground } from "@/components/playground";
import { Callout, DocPage } from "@/components/doc-page";
import { WidgetScreenshot } from "@/components/widget-screenshot";
import { installReact, sdkVersions } from "@/lib/sdk-versions";

export const metadata: Metadata = { title: "Treatment billing and RFAs" };

const session = `// server: POST /api/mindbill/treatment-session (any framework)
// Map the signed-in user's role to the smallest set of permissions they need.
const session = await mindbill.createBrowserSession({
  subject: user.id,
  allowedOrigin: process.env.APP_ORIGIN!, // exact origin, e.g. https://app.example.com
  permissions: [
    "bills:read", "bills:create", "bills:act",          // treatment bills and UR attachments
    "rfas:read", "rfas:create", "rfas:edit",            // RFA list, drafts, documents
    ...(user.canSign ? ["rfas:sign"] : []),             // physician signature
    ...(user.canSend ? ["rfas:act"] : []),              // delivery, receipt, decisions, tasks
    "documents:read", "payers:read",                   // PDF previews, recipient directory
  ],
  expiresIn: 900,
});
return Response.json({ token: session.token, expiresAt: session.expiresAt });`;

const billForm = `"use client";
import { ConnectedTreatmentBillForm } from "@mindbill/react";

export function NewTreatmentBill({ bill, ids }: { bill: TreatmentBillInput; ids: SavedIds }) {
  return <ConnectedTreatmentBillForm
    sessionEndpoint="/api/mindbill/treatment-session"
    initialBill={bill}                       // billingMode: "professional"
    encounter={{
      renderingProviderId: ids.renderingProviderId, // saved rendering provider
      placeOfServiceId: ids.locationId,             // saved service location
      claimId: ids.claimId,                         // optional: payer + prior therapy visits
    }}
    onEncounterQuote={(estimate) => setExpected(estimate?.totals.estimatedPayableCents ?? null)}
  />;
}`;

const draftForm = `"use client";
import { ConnectedTreatmentBillForm } from "@mindbill/react";

export function TreatmentVisitBill({ visit, ids }: { visit: Visit; ids: SavedIds }) {
  return <ConnectedTreatmentBillForm
    sessionEndpoint="/api/mindbill/treatment-session" // bills:read + bills:create
    initialBill={visit.bill}
    encounter={{ renderingProviderId: ids.renderingProviderId, placeOfServiceId: ids.locationId, claimId: ids.claimId }}
    drafts                                  // shows "Save draft"
    draftId={visit.mindbillDraftId}         // omit for a new bill; set to resume a saved one
    draftExternalId={\`visit_\${visit.id}\`}  // optional: your reference for a new draft
    onDraftSaved={(draft) => saveVisitDraftId(visit.id, draft.id)}
    onDraftError={() => clearVisitDraftId(visit.id)} // the saved draft could not be opened
    onSubmitted={(result) => openBill(result.billId)}
  />;
}`;

const draftsClient = `import { createBillDraftsClient } from "@mindbill/browser";

const drafts = createBillDraftsClient({ sessionEndpoint: "/api/mindbill/treatment-session" });

const { data } = await drafts.list({ claimId: "clm_example" });      // unsent drafts for a claim
const saved = await drafts.create({ bill, encounter, externalId: "visit_example" });
const updated = await drafts.update(saved.id, saved.revision, { bill: editedBill });
await drafts.remove(updated.id, updated.revision);                   // unsent drafts only`;

const draftApi = `# Save (201) — later saves PATCH with the current revision
curl https://app.mindbill.org/partner/v2/bill-drafts \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: visit_example-draft" \\
  --header "Content-Type: application/json" \\
  --data '{"externalId":"visit_example","bill":{"billingMode":"professional","claim":{"id":"clm_example"},"serviceLines":[{"code":"99213","units":1,"charge":150}]},"encounter":{"renderingProviderId":"rp_example","placeOfServiceId":"loc_example"}}'

# Submit the completed bill through the normal create-bill request
curl https://app.mindbill.org/partner/v2/bills \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: visit_example-submit" \\
  --header "Content-Type: application/json" \\
  --data '{"bill": { …the complete bill… }, "draft": {"id":"billdraft_example","revision":2}}'`;

const encounterApi = `const response = await fetch("https://app.mindbill.org/partner/v2/fee-quotes/encounter", {
  method: "POST",
  headers: { Authorization: \`Bearer \${process.env.MINDBILL_API_KEY}\`, "Content-Type": "application/json" },
  body: JSON.stringify({
    claimId: "clm_example",
    renderingProviderId: "rp_example",
    placeOfServiceId: "loc_example",
    dateOfService: "2026-09-18",
    lines: [
      { id: "line-1", code: "99213", units: 1, modifiers: ["25"], chargeCents: 18000 },
      { id: "line-2", code: "97110", units: 2, chargeCents: 12000 },
    ],
  }),
});
const { data } = await response.json();
for (const line of data.lines) {
  // Only priced lines have an expected amount. Never substitute the charge.
  const expected = line.assessment === "priced"
    ? (line.paymentAdjustment?.amountCents ?? line.quote.amountCents)
    : null;
  render(line.id, expected, line.displayNotes);
}
renderVisitNotes(data.visitNotes); // shown once for the visit`;

const quoter = `import { createBillReferenceClient, createEncounterQuoter, encounterQuoteRequest } from "@mindbill/browser";

const client = createBillReferenceClient({ sessionEndpoint: "/api/mindbill/treatment-session" });
// Pass to your own <BillSubmissionForm onQuoteEncounter={...} />
const onQuoteEncounter = createEncounterQuoter(client, { renderingProviderId, placeOfServiceId, claimId });
// Or call it directly:
const estimate = await client.quoteEncounter(encounterQuoteRequest(lines, { renderingProviderId, placeOfServiceId }));`;

const dashboard = `"use client";
import { RfaDashboard } from "@mindbill/react";

export function Authorizations({ user, claimId }: { user: SignedInUser; claimId?: string }) {
  return <RfaDashboard
    sessionEndpoint="/api/mindbill/treatment-session"
    officialForm                 // DWC Form RFA field order and labels
    layout="simple"              // All RFAs list + bill-style request detail
    claimId={claimId}            // optional: restrict to one claim
    actorReference={user.id}     // the authenticated human who signs or sends
    permissions={user.rfaControls} // e.g. ["create", "edit", "sign", "send", "act"]
    environment="sandbox"        // "live" only for approved organizations
  />;
}`;

const claimPage = `"use client";
import { BillUrDecisions, RelatedAuthorizationRecords, RfaClaimIndex } from "@mindbill/react";

const session = { sessionEndpoint: "/api/mindbill/treatment-session" };

// Claim page: every RFA on the claim, by request or by requested treatment.
<RfaClaimIndex {...session} claimId={claimId} canCreate
  createHref={\`/rfas/new?claimId=\${claimId}\`}
  getRfaHref={(rfaId) => \`/rfas/\${rfaId}\`} />

// RFA page: bills that use this authorization, then other bills for the injury.
<RelatedAuthorizationRecords {...session} rfaId={rfaId} getBillHref={(billId) => \`/bills/\${billId}\`} />

// Bill page: signed RFAs and UR decisions; attach letters while the bill is unsent.
<BillUrDecisions {...session} billId={billId} canEdit={bill.unsent}
  getRfaHref={(rfaId) => \`/rfas/\${rfaId}\`} onAttached={() => refreshDocuments()} />`;

const recordsClient = `import { createRfaRecordsClient } from "@mindbill/browser";

const records = createRfaRecordsClient({ sessionEndpoint: "/api/mindbill/treatment-session" });
const rfas = await records.listClaimRfas("clm_example");
const related = await records.listRelated({ billId: "bill_example" });
const decisions = await records.listBillUrDecisions("bill_example");
await records.attachBillUrDecisions("bill_example", { documentIds: ["rfadoc_example"] });`;

export default function TreatmentBillingPage() {
  return <DocPage eyebrow="Build" title="Treatment billing and RFAs" description="Embed treatment bills with expected OMFS payment and the complete Request for Authorization workflow in your application."
    toc={[
      { id: "enablement", label: "Enable the organization" },
      { id: "session", label: "Session permissions" },
      { id: "bill", label: "Treatment bill with OMFS pricing" },
      { id: "drafts", label: "Save and resume drafts" },
      { id: "encounter-api", label: "Encounter quote API" },
      { id: "rfa", label: "RFA workflow" },
      { id: "records", label: "Claim, RFA, and bill pages" },
      { id: "webhooks", label: "Webhooks" },
      { id: "routes", label: "API routes" },
    ]}
    previous={{ href: "/learn/treatment-quickstart", label: "Treatment quickstart" }} next={{ href: "/guides/rfas", label: "Requests for authorization" }}>
    <p>A treatment integration has two connected parts. Billers enter a treatment (CMS-1500 professional) bill and see the expected California OMFS payment for every line as they type. Clinicians and staff request authorization for that treatment with a DWC Form RFA, send it, and record the utilization review (UR) decision. MindBill links the two: an approved treatment can be attached to the bill line it authorizes.</p>
    <p>Install <code>@mindbill/react</code> {sdkVersions.react}, which brings <code>@mindbill/browser</code> {sdkVersions.browser}:</p>
    <CodeBlock language="bash" filename="Terminal" code={installReact} />

    <h2 id="enablement">Enable the organization</h2>
    <p>Treatment billing, RFAs, and fee quotes require the <code>treatmentBilling</code> capability on the customer organization. MindBill enables it during onboarding. Until then, these endpoints return HTTP 403 with problem code <code>treatment_billing_not_enabled</code>. Show a clear &quot;not enabled for this practice&quot; state rather than retrying. Enabling the capability does not grant any user access: every request still needs the matching scope or browser permission.</p>
    <p>The organization also needs saved records the workflow refers to by ID: rendering providers (with a saved signature for physicians who sign RFAs), service locations, and a billing provider. Manage them in <Link href="/guides/practice-settings">billing settings</Link>. Live RFA delivery uses the organization&apos;s managed return fax number, which MindBill configures; sandbox never sends.</p>

    <h2 id="session">Session permissions</h2>
    <p>Your server authenticates the user and mints a short-lived, exact-origin browser session. RFA and fee-quote routes need an organization-wide session; bill-scoped sessions are rejected.</p>
    <table><thead><tr><th>Capability</th><th>Browser permission</th><th>Server scope</th></tr></thead><tbody>
      <tr><td>Expected OMFS payment, related records, UR decisions on a bill</td><td><code>bills:read</code> (+ <code>rfas:read</code> for related records)</td><td><code>bills:read</code> (+ <code>rfas:read</code>)</td></tr>
      <tr><td>Submit the treatment bill</td><td><code>bills:create</code></td><td><code>bills:write</code></td></tr>
      <tr><td>List and resume bill drafts / save, replace, and delete them</td><td><code>bills:read</code> / <code>bills:create</code></td><td><code>bills:read</code> / <code>bills:write</code></td></tr>
      <tr><td>Attach UR decisions to an unsent bill</td><td><code>bills:act</code></td><td><code>bills:write</code></td></tr>
      <tr><td>List, view, export RFAs; form and packet previews</td><td><code>rfas:read</code> (+ <code>documents:read</code> for stored PDFs)</td><td><code>rfas:read</code></td></tr>
      <tr><td>Creation choices, new drafts, draft preview</td><td><code>rfas:create</code></td><td><code>rfas:write</code></td></tr>
      <tr><td>Edit drafts, upload documents, close a treatment</td><td><code>rfas:edit</code></td><td><code>rfas:write</code></td></tr>
      <tr><td>Sign; save a physician signature (+ <code>organization:manage</code>)</td><td><code>rfas:sign</code></td><td><code>rfas:sign</code></td></tr>
      <tr><td>Deliver, forward, record receipt and decisions, read UR responses, tasks</td><td><code>rfas:act</code></td><td><code>rfas:write</code></td></tr>
    </tbody></table>
    <CodeBlock code={session} language="ts" filename="server/treatment-session.ts" />
    <p>See <Link href="/guides/authentication#session">authentication</Link> for origin checks and error handling. Never send a permanent API key to the browser.</p>

    <h2 id="bill">Create a treatment bill with expected OMFS payment</h2>
    <p><code>ConnectedTreatmentBillForm</code> is the treatment bill form with three columns per service line: an editable <strong>Charge</strong>, the <strong>Expected (OMFS)</strong> payment, and the <strong>Difference</strong>. Every line of the visit is priced together, exactly as MindBill prices the saved bill, so multiple-procedure, bundling, add-on, NCCI, and same-day rules apply across lines. A line can instead show <em>Bundled</em>, <em>Not payable</em>, or <em>Needs review</em> with a short note. Totals never present a final amount while a line needs review. Visit-wide notes, such as a per-visit cap or the LC 4604.5 therapy visit count, appear once under the heading.</p>
    <WidgetScreenshot id="treatment-bill-encounter-fees" alt="Treatment bill service lines with Charge, Expected (OMFS), and Difference columns and a totals row" caption="ConnectedTreatmentBillForm with synthetic lines: a modifier note on 99213, 97014 not payable, and visit totals." />
    <p>Try it live: the preview below runs the published component against a mocked encounter quote. Change a code, units, modifier, or charge to reprice the visit.</p>
    <TreatmentBillPlayground />
    <CodeBlock code={billForm} language="tsx" filename="NewTreatmentBill.tsx" />
    <p>The <code>encounter</code> IDs are saved MindBill records, not free text:</p>
    <ul>
      <li><code>renderingProviderId</code>: from <Link href="/api-reference/rfa-creation-context">GET /rfas/creation-context</Link> (<code>renderingProviders[].id</code>) or the organization billing profile.</li>
      <li><code>placeOfServiceId</code>: a saved service location, <code>locations[].id</code> from <code>GET /partner/v2/organization/billing-profile</code> (see <Link href="/guides/practice-settings">billing settings</Link>). Provider type, facility setting, and practice charges come from these saved records.</li>
      <li><code>claimId</code> (optional): the claim&apos;s claims administrator is used, and prior therapy visits count toward LC 4604.5 limits. <code>billingProviderId</code> is optional; the organization default applies when omitted.</li>
    </ul>
    <p>Submission is unchanged: the form submits a <code>professional</code> bill through <Link href="/api-reference/create-bill">POST /bills</Link>. Link a line to an approved treatment with <code>serviceLines[].rfaItemId</code>; the server validates the relationship, and the ID alone is not evidence of approval.</p>
    <DemoVideo id="treatment-bill-omfs" />

    <h3 id="drafts">Save and resume drafts</h3>
    <p>A biller often starts a treatment bill before every detail is known. From React 0.79.0, pass <code>drafts</code> to show a <strong>Save draft</strong> button next to Submit. It saves the bill exactly as entered, even if incomplete, plus the <code>encounter</code> pricing IDs, to <Link href="/api-reference/create-bill-draft"><code>POST /bill-drafts</code></Link>; later saves replace the same draft at its current revision. Saving validates nothing for submission, prices nothing as final, and sends nothing. A draft is not a bill: it does not appear in bill lists, events, or usage.</p>
    <p>Pass <code>draftId</code> to resume. The form loads the draft, its saved bill replaces <code>initialBill</code>, and any <code>encounter</code> IDs you leave out come from the draft. When the biller presses Submit, the form sends the bill through <Link href="/api-reference/create-bill"><code>POST /bills</code></Link> with <code>draft: &#123; id, revision &#125;</code>. MindBill reserves the draft, creates the bill, and marks the draft <code>submitted</code> with <code>submittedBillId</code>. If no bill is created, the draft is released so the biller can fix it and try again. A submitted draft cannot be edited, and opening one shows that it was already submitted.</p>
    <CodeBlock code={draftForm} language="tsx" filename="TreatmentVisitBill.tsx" />
    <table><thead><tr><th>Prop</th><th>Purpose</th></tr></thead><tbody>
      <tr><td><code>drafts</code></td><td>Show Save draft. The session needs <code>bills:create</code>.</td></tr>
      <tr><td><code>draftId</code></td><td>Resume this saved draft; submitting it marks the draft submitted.</td></tr>
      <tr><td><code>draftExternalId</code></td><td>Your reference for a new draft, unique per organization. Reusing one returns <code>external_id_owned</code>.</td></tr>
      <tr><td><code>onDraftSaved(draft)</code></td><td>Called after each save. Store <code>draft.id</code> with your visit to resume later.</td></tr>
      <tr><td><code>onDraftError(error)</code></td><td>Called when <code>draftId</code> cannot be loaded, for example after it was deleted.</td></tr>
    </tbody></table>
    <p>Using your own <code>BillSubmissionForm</code>? It accepts <code>onSaveDraft(bill)</code> (a secondary button that skips validation), <code>saveDraftLabel</code>, and <code>draft: &#123; id, revision &#125;</code>, which it forwards on submission. Call the drafts client yourself:</p>
    <CodeBlock code={draftsClient} language="ts" filename="bill-drafts.ts" />
    <p>Server integrations use the same routes: <Link href="/api-reference/list-bill-drafts">list</Link>, <Link href="/api-reference/create-bill-draft">save</Link>, <Link href="/api-reference/get-bill-draft">read</Link>, <Link href="/api-reference/update-bill-draft">replace</Link>, and <Link href="/api-reference/delete-bill-draft">delete</Link>. Writes need an <code>Idempotency-Key</code>; reads need <code>bills:read</code> and writes <code>bills:write</code> (browser <code>bills:create</code>).</p>
    <CodeBlock code={draftApi} language="bash" filename="Save, then submit a draft" />
    <Callout title="Revisions prevent lost edits">Every save increments <code>revision</code>. Updates, deletes, and submissions must send the current revision; a stale one returns 409 <code>bill_draft_revision_conflict</code> without changes, so reload the draft and reapply the edit. A draft that is being submitted or was submitted returns 409 <code>bill_draft_not_editable</code>.</Callout>

    <h3 id="encounter-api">Price a visit from your own UI</h3>
    <p>Call <Link href="/api-reference/encounter-fee-quote">POST /fee-quotes/encounter</Link> from your server or with a browser session. Amounts are integer cents. A quote creates and changes nothing.</p>
    <CodeBlock code={encounterApi} language="ts" filename="server/quote-visit.ts" />
    <p>To keep your own <code>BillSubmissionForm</code> layout, pass an encounter quoter instead:</p>
    <CodeBlock code={quoter} language="ts" filename="encounter-pricing.ts" />
    <Callout title="Encounter quote or claim quote?">Use the encounter quote while entering a bill for saved providers and locations; it matches what the saved bill will show. Use <Link href="/guides/fee-schedules">POST /fee-quotes/ca/claim</Link> when you have clinical context but no saved MindBill records, such as a stand-alone calculator. See <Link href="/guides/fee-schedules#encounter">the comparison</Link>.</Callout>

    <h2 id="rfa">Run the full RFA workflow</h2>
    <p><code>RfaDashboard</code> embeds the complete workflow: search and filter requests, create a request on the official DWC Form RFA, attach clinical PDFs, preview the form, sign, review the exact packet, send by fax or email, and then record receipt, information requests, and UR decisions per treatment. Its task board covers no-response follow-up, matching incoming responses, and posting decisions.</p>
    <CodeBlock code={dashboard} language="tsx" filename="Authorizations.tsx" />
    <ul>
      <li><code>officialForm</code> lays out creation in DWC Form RFA order (request type, Employee, Requesting Physician, Claims Administrator, Requested Treatment) with the official labels. Values that come from saved records are read-only.</li>
      <li><code>layout=&quot;simple&quot;</code> opens on the searchable All RFAs list and shows each request like a bill detail page: a milestone status card, RFA details, documents, review and send (or utilization review after delivery), history, and a sticky next-action bar.</li>
      <li>Built-in defaults from React 0.78.0: when you do not supply your own handlers, form and draft previews open in the built-in PDF viewer (<code>previewForm</code>, <code>previewDraft</code>), UR responses are read with <code>readResponse</code> to prefill decisions for the user to confirm, and treatment templates load and save through the API (<code>listTemplates</code>, <code>saveTemplate</code>). Host props such as <code>formPreviewUrl</code> and <code>onPreviewRequest</code> still take precedence.</li>
      <li>Nothing is signed or sent on render. Signing and delivery each need explicit confirmation by an authorized user, and <code>permissions</code> only controls which buttons appear; the server enforces access.</li>
    </ul>
    <DemoVideo id="rfa-create-sign-send" />
    <p>For a custom interface, <code>createRfaClient()</code> exposes the same operations, including <code>previewForm(rfaId, {"{ packet: true }"})</code>, <code>previewDraft(draft)</code>, <code>readResponse(rfaId, documentId)</code>, <code>listTemplates()</code>, <code>saveTemplate(input)</code>, and <code>exportCsv(filters)</code>. The <Link href="/guides/rfas">RFA guide</Link> covers drafts, signing, delivery evidence, review clocks, and corrections in detail.</p>

    <h2 id="records">Show authorizations on claim, RFA, and bill pages</h2>
    <p>Three components connect authorization records to the rest of your application. Each accepts the same session options, or a host loader if your backend serves the data.</p>
    <h3>RfaClaimIndex: every RFA on a claim</h3>
    <p>Treatment counts (Incomplete, No response, Approved, Modified, Denied), an RFAs tab and a Requested treatments tab, sortable columns, and an Add RFA action. Unsent requests count once as Incomplete; a treatment closed as no longer needed shows &quot;Not required&quot;.</p>
    <WidgetScreenshot id="rfa-claim-index" alt="RfaClaimIndex showing status counts and three requests on one claim" caption="RfaClaimIndex, RFAs tab (synthetic claim)." />
    <WidgetScreenshot id="rfa-claim-treatments" alt="RfaClaimIndex Requested treatments tab listing each treatment with its decision" caption="Requested treatments tab: one row per treatment with code, decision, and authorization number." />
    <RfaClaimIndexPlayground />
    <h3>RelatedAuthorizationRecords: bills and RFAs on the same claim</h3>
    <p>On an RFA page (<code>rfaId</code>) it lists bills; on a bill page (<code>billId</code>) it lists RFAs. Records where a bill line uses one of the request&apos;s approved treatments (&quot;Linked authorization&quot;) come first; other records for the injury are folded below.</p>
    <WidgetScreenshot id="related-authorization-records" alt="RelatedAuthorizationRecords listing a linked bill and another bill for the same injury" caption="RelatedAuthorizationRecords on an RFA page." />
    <RelatedRecordsPlayground />
    <h3>BillUrDecisions: authorizations for a bill</h3>
    <p>Shows the signed RFA and UR decision for each authorization linked to a service line, then every other UR decision on the bill&apos;s patient and claim. While the bill is unsent and <code>canEdit</code> is set, a biller can attach selected decision letters or retry the linked attachments. Attaching copies documents onto the bill; nothing is sent.</p>
    <WidgetScreenshot id="bill-ur-decisions" alt="BillUrDecisions with linked authorizations and a table of UR decisions" caption="BillUrDecisions on an unsent treatment bill." />
    <BillUrDecisionsPlayground />
    <CodeBlock code={claimPage} language="tsx" filename="Claim, RFA, and bill pages" />
    <CodeBlock code={recordsClient} language="ts" filename="records-client.ts" />
    <DemoVideo id="rfa-claim-records" />

    <h2 id="webhooks">Keep your application in sync</h2>
    <p>Subscribe your server to the RFA events you act on and reread the request when one arrives. Useful starting points:</p>
    <ul>
      <li><code>rfa.submitted</code> and <code>rfa.received</code>: delivery and receipt; receipt starts the review clock.</li>
      <li><code>rfa.decision_recorded</code> and <code>rfa.decision_corrected</code>: UR outcomes per treatment; refresh the bill&apos;s <Link href="/api-reference/bill-ur-decisions">UR decisions</Link>.</li>
      <li><code>rfa.information_requested</code> and <code>rfa.follow_up_due</code>: work that needs a person.</li>
      <li>Bill events such as <code>bill.accepted</code>, <code>bill.paid</code>, and <code>payment.posted</code> for the treatment bill.</li>
    </ul>
    <p>See <Link href="/guides/webhooks">webhook events</Link> for every type, the envelope, and signature verification.</p>

    <h2 id="routes">API routes used by this workflow</h2>
    <table><thead><tr><th>Step</th><th>Routes</th></tr></thead><tbody>
      <tr><td>Saved choices</td><td><Link href="/api-reference/rfa-creation-context"><code>GET /rfas/creation-context</code></Link>, <code>GET /organization/billing-profile</code></td></tr>
      <tr><td>Expected payment</td><td><Link href="/api-reference/encounter-fee-quote"><code>POST /fee-quotes/encounter</code></Link></td></tr>
      <tr><td>Bill drafts</td><td><Link href="/api-reference/list-bill-drafts"><code>GET|POST /bill-drafts</code></Link>, <Link href="/api-reference/get-bill-draft"><code>GET|PATCH|DELETE /bill-drafts/&#123;draftId&#125;</code></Link></td></tr>
      <tr><td>Treatment bill</td><td><Link href="/api-reference/create-bill"><code>POST /bills</code></Link>, <Link href="/api-reference/bill-ur-decisions"><code>GET|POST /bills/&#123;billId&#125;/ur-decisions</code></Link></td></tr>
      <tr><td>Form previews</td><td><Link href="/api-reference/rfa-draft-preview"><code>POST /rfas/draft-preview</code></Link>, <Link href="/api-reference/rfa-form-preview"><code>GET /rfas/&#123;rfaId&#125;/form-preview</code></Link></td></tr>
      <tr><td>Signature</td><td><Link href="/api-reference/rfa-provider-signature"><code>POST /rfas/providers/&#123;providerId&#125;/signature</code></Link></td></tr>
      <tr><td>Delivery</td><td><Link href="/api-reference/rfa-delivery-preview"><code>POST /rfas/&#123;rfaId&#125;/delivery-preview</code></Link>, <Link href="/api-reference/rfa-submit"><code>/submit</code></Link>, <Link href="/api-reference/rfa-forwards"><code>/forwards</code></Link>, <Link href="/api-reference/rfa-sent-outside"><code>/sent-outside</code></Link></td></tr>
      <tr><td>Decisions</td><td><Link href="/api-reference/rfa-response-reading"><code>POST /rfas/&#123;rfaId&#125;/response-reading</code></Link>, <code>/decisions</code></td></tr>
      <tr><td>Records and reporting</td><td><Link href="/api-reference/rfa-related"><code>GET /rfas/related</code></Link>, <Link href="/api-reference/rfa-export"><code>GET /rfas/export</code></Link></td></tr>
    </tbody></table>
    <p>The <Link href="/guides/rfas#routes">RFA guide&apos;s API map</Link> lists every RFA route.</p>
  </DocPage>;
}
