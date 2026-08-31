import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import {
  ActivityTimelinePlayground,
  ConnectedStatusPlayground,
  HostedReviewPlayground,
  HostedTimelinePlayground,
  LifecyclePlayground,
  LifecycleActionsPlayground,
  LifecycleProgressPlayground,
  SnapshotPlayground,
  RemittancePlayground,
  PayerContactPlayground,
  PaymentLedgerPlayground,
  StatusPlayground,
  SubmissionFormPlayground,
} from "@/components/playground";

export const metadata: Metadata = { title: "React components" };

const install = `npm install @mindbill/react @mindbill/node`;

const submissionForm = `import { BillSubmissionForm } from "@mindbill/react";

<BillSubmissionForm
  initialBill={toBillSnapshot(caseRecord)}
  attachments={caseDocuments}
  getSession={() =>
    fetch("/api/mindbill/submission-session", { method: "POST" }).then((response) =>
      response.json()
    )
  }
  submitLabel="Submit bill"
  onSubmit={async (value) => {
    const submitted = await submitBill(value);
    rememberBillId(submitted.id);
  }}
/>`;

const submissionSession = `app.post("/api/mindbill/submission-session", async (req, res) => {
  const user = await requireSignedInUser(req);

  res.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions: ["payers:read"],
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

const session = `app.post("/api/mindbill/session", async (req, res) => {
  const user = await requireSignedInUser(req);

  res.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions: ["bills:read", "bills:act", "documents:read", "eors:read"],
    resource: { billId: await authorizedBillId(req) },
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";

export function SubmittedBill({ billId }: { billId: string }) {
  return (
    <ConnectedBillLifecycle
      billId={billId}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
    />
  );
}`;

const customLifecycle = `import { useBillLifecycle } from "@mindbill/react";

function BillingToolbar({ billId }: { billId: string }) {
  const bill = useBillLifecycle({
    billId,
    sessionEndpoint: "/api/mindbill/session",
  });

  if (bill.isLoading) return <p>Loading…</p>;
  if (bill.error) return <button onClick={bill.refresh}>Try again</button>;

  return (
    <>
      <strong>{bill.data?.lifecycle.state}</strong>
      <button onClick={() => bill.closeBill({ reason: "Completed" })}>
        Close bill
      </button>
    </>
  );
}`;

const status = `import { ConnectedBillStatus } from "@mindbill/react";

<ConnectedBillStatus
  billId={billId}
  sessionEndpoint="/api/mindbill/session"
  refreshInterval={30_000}
/>`;

const presentational = `import { BillStatusSummary } from "@mindbill/react";

<BillStatusSummary
  status="processed"
  submittedAt="2026-08-12T17:00:00Z"
  agingDays={13}
  totalCharge={2015}
  totalPaid={0}
  balanceDue={2015}
  actions={[{ id: "eor", label: "View EOR", onClick: openEor }]}
/>`;

const actionBar = `import { BillLifecycleActions } from "@mindbill/react";

<BillLifecycleActions
  actions={bill.lifecycle.actions}
  onAction={(action) => openAction(action.id)}
  showUnavailable
/>`;

const timeline = `import { BillActivityTimeline } from "@mindbill/react";

<BillActivityTimeline
  events={bill.activity}
  appearance={{ preset: "orange-bright" }}
/>`;

const progress = `import { BillLifecycleProgress } from "@mindbill/react";

<BillLifecycleProgress
  state={bill.lifecycle.state}
  nativeStatus={bill.lifecycle.nativeStatus}
  submittedAt={bill.lifecycle.submittedAt}
  agingDays={bill.lifecycle.agingDays}
/>`;

const snapshot = `import { BillSnapshotSummary } from "@mindbill/react";

<BillSnapshotSummary
  bill={bill.bill}
  patient={bill.patient}
  injury={bill.injury}
  delivery={bill.delivery}
/>`;

const remittance = `import {
  BillRemittanceCard,
  BillPayerContactCard,
  BillPaymentLedger,
} from "@mindbill/react";

<BillRemittanceCard remittance={bill.remittance} />
<BillPayerContactCard delivery={bill.delivery} />
<BillPaymentLedger payments={bill.payments} />`;

const clients = `import {
  createBillLifecycleClient,
  createBillStatusClient,
} from "@mindbill/react";

const lifecycle = createBillLifecycleClient({
  billId,
  sessionEndpoint: "/api/mindbill/session",
});
const bill = await lifecycle.getLifecycle();

const status = await createBillStatusClient({
  billId,
  sessionEndpoint: "/api/mindbill/session",
}).getStatus();`;

const hosted = `import { MindBillBillReview, MindBillBillTimeline } from "@mindbill/react";

<MindBillBillReview sessionToken={token} embedUrl={reviewUrl} />
<MindBillBillTimeline sessionToken={token} embedUrl={timelineUrl} />`;

export default function ReactPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="React"
      description="Use MindBill's complete pre-submission form, then render the connected lifecycle for the immutable submitted bill."
      toc={[
        { id: "choose", label: "Choose an export" },
        { id: "form", label: "Submission form" },
        { id: "setup", label: "Post-submit setup" },
        { id: "lifecycle", label: "Complete lifecycle" },
        { id: "custom", label: "Custom lifecycle UI" },
        { id: "status", label: "Status surfaces" },
        { id: "surfaces", label: "Lifecycle surfaces" },
        { id: "actions", label: "Actions and history" },
        { id: "clients", label: "Browser clients" },
        { id: "hosted", label: "Hosted wrappers" },
        { id: "utilities", label: "Utilities" },
      ]}
      previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
      next={{ href: "/components/angular", label: "Angular components" }}
    >
      <h2 id="choose">Choose an export</h2>
      <div className="data-table component-catalog">
        <div className="table-head"><b>Export</b><b>Use it when</b><b>Owns API calls</b></div>
        <div><code>BillSubmissionForm</code><span>You want the complete form, reference data, validation, attachments, and Submit action.</span><span>Reference data only</span></div>
        <div><code>BillReadOnlyForm</code><span>You want the same bill layout after submission without editing.</span><span>No</span></div>
        <div><code>ConnectedBillLifecycle</code><span>You want the complete post-submission workflow.</span><span>Yes</span></div>
        <div><code>useBillLifecycle</code><span>You want custom post-submission lifecycle UI.</span><span>Yes</span></div>
        <div><code>ConnectedBillStatus</code><span>You need compact status and valid next actions.</span><span>Yes</span></div>
        <div><code>useBillStatus</code><span>You want custom status UI.</span><span>Yes</span></div>
        <div><code>BillStatusSummary</code><span>You need a presentational status card.</span><span>No</span></div>
        <div><code>BillLifecycleActions</code><span>You need state-aware actions in your own layout.</span><span>No</span></div>
        <div><code>BillLifecycleProgress</code><span>You need the horizontal bill lifecycle.</span><span>No</span></div>
        <div><code>BillSnapshotSummary</code><span>You need a compact submitted CMS-1500 snapshot.</span><span>No</span></div>
        <div><code>BillRemittanceCard</code><span>You need payer-reported, posted, and balance amounts.</span><span>No</span></div>
        <div><code>BillPayerContactCard</code><span>You need payer and adjuster follow-up contacts.</span><span>No</span></div>
        <div><code>BillPaymentLedger</code><span>You need posted payment history.</span><span>No</span></div>
        <div><code>BillActivityTimeline</code><span>You want to render the bill&apos;s complete history.</span><span>No</span></div>
        <div><code>MindBillBillReview</code><span>You prefer the hosted post-submission review surface.</span><span>Hosted</span></div>
        <div><code>MindBillBillTimeline</code><span>You prefer the hosted timeline surface.</span><span>Hosted</span></div>
      </div>

      <h2 id="form">Complete submission form</h2>
      <p><code>BillSubmissionForm</code> owns which fields exist and which are required. It renders red asterisks, validates the values, resolves billing reference data through a short-lived browser session, lets users review prefilled documents and add uploads, and renders the Submit button. It never creates a MindBill draft.</p>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <CodeBlock code={submissionSession} filename="server/submission-session.ts" />
      <CodeBlock code={submissionForm} filename="CaseBilling.tsx" />
      <SubmissionFormPlayground />
      <div className="term-list compact">
        <div><b>Patient and injury</b><p>Responsive two-column fields, paste-friendly <code>MM/DD/YYYY</code> dates, required asterisks, and authenticated ZIP-to-city/state completion.</p></div>
        <div><b>Diagnosis and routing</b><p>Complete server-backed ICD-10 search with common-injury quick picks and removable chips, plus canonical claims-administrator search backed by MindBill payer routing IDs.</p></div>
        <div><b>Service lines</b><p>Searchable workers&apos;-comp procedure and modifier controls, evaluation-mode modifier defaults, medical-legal fee-schedule amounts, totals, valid manual CPT/HCPCS entry, and one automatically maintained empty line.</p></div>
        <div><b>Attachments</b><p>Removable source documents, a locked auto-attached practice W-9, and click, panel-drop, or whole-page PDF upload.</p></div>
      </div>
      <Callout title="API keys stay server-side">The form uses the short-lived, exact-origin session only for payer, ICD-10, and postal reference data. Your permanent Partner API key never reaches the browser.</Callout>
      <Callout title="One callback, one atomic submission">Your <code>onSubmit</code> handler sends the form value to your server. The server calls <code>createAndSubmitBill</code>; only a successful request returns a bill ID.</Callout>
      <Callout title="Keep your integration thin">Do not duplicate required fields, payer or ICD directories, ZIP lookup, fee behavior, attachment rules, or mobile layout in your application. Those stay versioned inside <code>@mindbill/react</code>. Optional catalog and lookup props support licensed or organization-specific extensions.</Callout>

      <h2 id="setup">Post-submission setup</h2>
      <p>Once a bill exists, add one authenticated server route that exchanges your signed-in user for a short-lived, organization-scoped browser session restricted to that submitted bill.</p>
      <CodeBlock code={session} filename="server/session.ts" />
      <Callout title="Your API key stays server-side">The session fixes the organization, user, bill, origin, expiry, and post-submission permissions.</Callout>

      <h2 id="lifecycle">Complete post-submission lifecycle</h2>
      <p>Pass the returned <code>billId</code>. <code>ConnectedBillLifecycle</code> never creates or edits a pre-submission draft.</p>
      <CodeBlock code={lifecycle} filename="SubmittedBill.tsx" />
      <p>The component includes lifecycle progress, the frozen bill snapshot, EOR details and original PDFs, payer contacts, payments, history, Second Review, correction, IBR or lien actions when eligible, and closure.</p>
      <LifecyclePlayground />

      <h2 id="custom">Custom lifecycle UI</h2>
      <p><code>useBillLifecycle</code> exposes the same authoritative submitted state and post-submission actions.</p>
      <CodeBlock code={customLifecycle} filename="BillingToolbar.tsx" />

      <h2 id="status">Status surfaces</h2>
      <p><Link href="/components/react/lifecycle-demo">Open the full lifecycle demo</Link> to inspect every state or walk one synthetic bill from Sent through payment and closure.</p>
      <p><code>ConnectedBillStatus</code> loads and refreshes authoritative status. <code>useBillStatus</code> exposes the same client state for a custom layout.</p>
      <CodeBlock code={status} filename="BillStatus.tsx" />
      <ConnectedStatusPlayground />
      <p><code>BillStatusSummary</code> is the data-only version when your app already has the status.</p>
      <CodeBlock code={presentational} filename="StatusCard.tsx" />
      <StatusPlayground />

      <h2 id="surfaces">Lifecycle surfaces</h2>
      <p>These presentational exports use fields already returned by the lifecycle endpoint. Compose them only when the complete connected workspace is more UI than you need.</p>
      <CodeBlock code={progress} filename="BillProgress.tsx" />
      <LifecycleProgressPlayground />
      <CodeBlock code={snapshot} filename="BillSnapshot.tsx" />
      <SnapshotPlayground />
      <CodeBlock code={remittance} filename="BillFollowUp.tsx" />
      <RemittancePlayground />
      <PayerContactPlayground />
      <PaymentLedgerPlayground />

      <h2 id="actions">Actions and history</h2>
      <p><code>BillLifecycleActions</code> renders the action list returned with lifecycle data. Keep the server response authoritative.</p>
      <CodeBlock code={actionBar} filename="BillActions.tsx" />
      <LifecycleActionsPlayground />
      <p><code>BillActivityTimeline</code> renders <code>bill.activity</code>. Webhooks remain the durable server-side signal for your own database and analytics.</p>
      <CodeBlock code={timeline} filename="BillHistory.tsx" />
      <ActivityTimelinePlayground />

      <h2 id="clients">Browser clients</h2>
      <p>Use the framework-neutral clients for submitted bill reads and lifecycle actions outside React rendering or inside your own state layer.</p>
      <CodeBlock code={clients} filename="billing-client.ts" />

      <h2 id="hosted">Hosted wrappers</h2>
      <p><code>MindBillBillReview</code> and <code>MindBillBillTimeline</code> wrap hosted post-submission surfaces when native composition is not practical.</p>
      <CodeBlock code={hosted} filename="HostedBilling.tsx" />
      <HostedReviewPlayground />
      <HostedTimelinePlayground />

      <h2 id="utilities">Appearance and utilities</h2>
      <div className="term-list compact">
        <div><b><code>BILL_SUBMISSION_REQUIRED_FIELDS</code></b><p>The canonical required fields used by <code>BillSubmissionForm</code>.</p></div>
        <div><b><code>validateBillSubmission</code></b><p>Run the same submission validation outside the rendered form.</p></div>
        <div><b><code>mindBillThemePresets</code></b><p><code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, and <code>clinical-blue</code>.</p></div>
        <div><b><code>resolveMindBillAppearance</code></b><p>Resolve a preset plus token overrides.</p></div>
        <div><b><code>mindBillAppearanceStyle</code></b><p>Convert appearance tokens to CSS custom properties.</p></div>
        <div><b><code>ensureTrailingProcedureLine</code></b><p>Keep exactly one empty procedure row after populated rows.</p></div>
      </div>
    </DocPage>
  );
}
