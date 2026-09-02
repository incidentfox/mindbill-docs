import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import {
  ActivityTimelinePlayground,
  BillingDashboardPlayground,
  BillingReportPlayground,
  ConnectedStatusPlayground,
  ExplanationOfReviewPlayground,
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
  SubmissionSectionsPlayground,
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
  appearance={{ preset: "orange-bright" }}
  submitLabel="Submit bill"
  onSubmitted={({ billId }) => rememberBillId(billId)}
/>`;

const submissionSections = `import {
  BillSubmissionActions,
  BillSubmissionAttachmentsSection,
  BillSubmissionClaimSection,
  BillSubmissionForm,
  BillSubmissionHeader,
  BillSubmissionPatientSection,
  BillSubmissionProvidersSection,
  BillSubmissionServiceLinesSection,
} from "@mindbill/react";

<BillSubmissionForm
  initialBill={bill}
  attachments={documents}
  sessionEndpoint="/api/mindbill/submission-session"
  onSubmitted={({ billId }) => rememberBillId(billId)}
>
  <BillSubmissionHeader />
  <BillSubmissionPatientSection />
  <BillSubmissionClaimSection />
  <BillSubmissionProvidersSection />
  <BillSubmissionServiceLinesSection />
  <BillSubmissionAttachmentsSection />
  <BillSubmissionActions />
</BillSubmissionForm>`;

const dashboard = `import { BillingDashboard } from "@mindbill/react";

<BillingDashboard
  bills={bills}
  heading="Billing operations"
  description="Search every bill and act on aging balances."
  onSelectBill={(bill) => navigate(\`/billing/\${bill.id}\`)}
  appearance={{ preset: "orange-bright" }}
/>`;

const reporting = `import {
  BillingReport,
  buildBillingReportCsv,
} from "@mindbill/react";

<BillingReport bills={bills} groupBy="payer" />;

const csv = buildBillingReportCsv(bills, "payer");`;

const statusAgingMatrix = `import { BillStatusAgingMatrix } from "@mindbill/react";

<BillStatusAgingMatrix
  bills={bills}
  appearance={{ preset: "clinical-blue" }}
  onSelectCell={(cell) => setDrillDown(cell)}
/>

{drillDown ? <BillList bills={drillDown.bills} onSelectBill={openBill} /> : null}`;

const submissionSession = `app.post("/api/mindbill/submission-session", async (req, res) => {
  const user = await requireSignedInUser(req);

  res.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions: ["bills:create", "payers:read"],
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

const session = `app.post("/api/mindbill/bills/:billId/session", async (req, res) => {
  const user = await requireSignedInUser(req);
  const { billId } = req.params;
  await requireBillAccess(user, billId);

  res.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions: ["bills:read", "bills:act", "documents:read", "eors:read"],
    resource: { billId },
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";

export function SubmittedBill({ billId }: { billId: string }) {
  return (
    <ConnectedBillLifecycle
      billId={billId}
      sessionEndpoint={\`/api/mindbill/bills/\${billId}/session\`}
      appearance={{ preset: "orange-bright" }}
    />
  );
}`;

const customLifecycle = `import { useBillLifecycle } from "@mindbill/react";

function BillingToolbar({ billId }: { billId: string }) {
  const bill = useBillLifecycle({
    billId,
    sessionEndpoint: \`/api/mindbill/bills/\${billId}/session\`,
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
  sessionEndpoint={\`/api/mindbill/bills/\${billId}/session\`}
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
  BillExplanationOfReview,
  BillRemittanceCard,
  BillPayerContactCard,
  BillPaymentLedger,
} from "@mindbill/react";

<BillExplanationOfReview
  remittance={bill.remittance}
  eors={bill.eors}
  payments={bill.payments}
  submittedAt={bill.lifecycle.submittedAt}
  onOpenEor={previewEor}
/>

// Lower-level legacy surfaces remain available for custom layouts.
<BillRemittanceCard remittance={bill.remittance} />
<BillPayerContactCard delivery={bill.delivery} />
<BillPaymentLedger payments={bill.payments} />`;

const clients = `import {
  createBillLifecycleClient,
  createBillStatusClient,
} from "@mindbill/react";

const lifecycle = createBillLifecycleClient({
  billId,
  sessionEndpoint: \`/api/mindbill/bills/\${billId}/session\`,
});
const bill = await lifecycle.getLifecycle();

const status = await createBillStatusClient({
  billId,
  sessionEndpoint: \`/api/mindbill/bills/\${billId}/session\`,
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
        { id: "sections", label: "Individual form sections" },
        { id: "operations", label: "Dashboard and reporting" },
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
        <div><code>BillSubmissionForm</code><span>You want the complete form, reference data, validation, attachments, and atomic Submit action.</span><span>Yes</span></div>
        <div><code>BillSubmission*Section</code><span>You want the same component-owned form state with individually composable sections.</span><span>Yes, through the parent</span></div>
        <div><code>BillingDashboard</code><span>You need receivables KPIs, aging buckets, search, filters, and a responsive bill list.</span><span>No</span></div>
        <div><code>BillList</code><span>You need only the searchable and filterable bill directory.</span><span>No</span></div>
        <div><code>BillAgingSummary</code><span>You need only receivables and aging KPIs.</span><span>No</span></div>
        <div><code>BillingReport</code><span>You need grouped status, payer, or aging reporting.</span><span>No</span></div>
        <div><code>BillStatusAgingMatrix</code><span>You need the status × aging management grid with drill-down cells and totals.</span><span>No</span></div>
        <div><code>BillReadOnlyForm</code><span>You want the same bill layout after submission without editing.</span><span>No</span></div>
        <div><code>ConnectedBillLifecycle</code><span>You want the complete post-submission workflow.</span><span>Yes</span></div>
        <div><code>useBillLifecycle</code><span>You want custom post-submission lifecycle UI.</span><span>Yes</span></div>
        <div><code>ConnectedBillStatus</code><span>You need compact status and valid next actions.</span><span>Yes</span></div>
        <div><code>useBillStatus</code><span>You want custom status UI.</span><span>Yes</span></div>
        <div><code>BillStatusSummary</code><span>You need a presentational status card.</span><span>No</span></div>
        <div><code>BillLifecycleActions</code><span>You need state-aware actions in your own layout.</span><span>No</span></div>
        <div><code>BillLifecycleProgress</code><span>You need the horizontal bill lifecycle.</span><span>No</span></div>
        <div><code>BillSnapshotSummary</code><span>You need a compact submitted CMS-1500 snapshot.</span><span>No</span></div>
        <div><code>BillExplanationOfReview</code><span>You need the consolidated EOR, denial, remittance, and payment reconciliation surface.</span><span>No</span></div>
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
      <Callout title="API keys stay server-side">Your server only mints a short-lived, exact-origin session. The component uses it for reference data, validation, PDF encoding, wire serialization, and the atomic Partner API submission. Your permanent API key and clearinghouse routing identifiers never reach the browser.</Callout>
      <Callout title="One component, one atomic submission">Omit the custom <code>onSubmit</code> escape hatch for the connected default. A successful <code>onSubmitted</code> callback returns the immutable MindBill bill ID; a failed request creates no public bill.</Callout>
      <Callout title="Keep your integration thin">Do not duplicate required fields, payer or ICD directories, ZIP lookup, fee behavior, attachment rules, or mobile layout in your application. Those stay versioned inside <code>@mindbill/react</code>. Optional catalog and lookup props support licensed or organization-specific extensions.</Callout>

      <h2 id="sections">Individual form sections</h2>
      <p>Use the named section exports when your product needs to place form sections in its own page shell. <code>BillSubmissionForm</code> remains the single state, validation, lookup, upload, and submission engine; its children only control composition and order.</p>
      <CodeBlock code={submissionSections} filename="CustomBillSubmission.tsx" />
      <SubmissionSectionsPlayground />
      <Callout title="Do not wire fields individually">The section components deliberately share the parent form context. Partners can compose the experience without rebuilding field rules, state synchronization, or API calls.</Callout>

      <h2 id="operations">Dashboard, aging, bill list, and reporting</h2>
      <p>The operations exports accept the same normalized bill summaries. They calculate receivables and aging in the browser, render responsive tables or mobile cards, and keep navigation under your application&apos;s control.</p>
      <CodeBlock code={dashboard} filename="BillingDashboard.tsx" />
      <BillingDashboardPlayground />
      <p><code>BillingReport</code> groups the same data by payer, lifecycle status, or aging bucket. <code>buildBillingReportCsv</code> returns a ready-to-download or copyable CSV without requiring a second reporting schema.</p>
      <CodeBlock code={reporting} filename="BillingReport.tsx" />
      <BillingReportPlayground />
      <p><code>BillStatusAgingMatrix</code> renders the management view billing teams expect from legacy tools: one row per lifecycle status, one column per 0–30 / 31–60 / 61–90 / 91+ aging bucket, clickable counts with outstanding balances, and row, column, and grand totals. Every <code>onSelectCell</code> payload carries <code>{`{ state, bucket, count, balance, bills }`}</code> — the exact bills behind the count — so a drill-down never needs a second query. Pin your lifecycle ordering with <code>stateOrder</code>; <code>buildBillStatusAgingMatrix</code> and <code>buildBillStatusAgingCsv</code> expose the same aggregation presentation-free.</p>
      <CodeBlock code={statusAgingMatrix} filename="BillStatusAgingMatrix.tsx" />
      <Callout title="Use connected data in production">The demos use synthetic rows. In your product, load bill summaries with the Partner API or your webhook-backed store and pass them directly to these presentational components.</Callout>

      <h2 id="setup">Post-submission setup</h2>
      <p>Once a bill exists, add one authenticated server route that exchanges your signed-in user for a short-lived, organization-scoped browser session restricted to that submitted bill.</p>
      <CodeBlock code={session} filename="server/bill-session.ts" />
      <Callout title="Your API key stays server-side">The session fixes the organization, user, bill, origin, expiry, and post-submission permissions.</Callout>

      <h2 id="lifecycle">Complete post-submission lifecycle</h2>
      <p>Pass the returned <code>billId</code>. <code>ConnectedBillLifecycle</code> never creates or edits a pre-submission draft.</p>
      <CodeBlock code={lifecycle} filename="SubmittedBill.tsx" />
      <p>The component includes lifecycle progress, the frozen bill snapshot, a consolidated EOR and payment reconciliation surface, rich claims-administrator directory details, history, packet preview, and a sticky state-aware action bar for Second Review, correction, IBR, lien, payment, or closure when eligible.</p>
      <Callout title="Only bill ID and session">The connected lifecycle accepts no initial bill data. Pass the submitted <code>billId</code> and a short-lived browser session; MindBill remains authoritative for the snapshot, payer directory, EORs, payments, history, and actions.</Callout>
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
      <ExplanationOfReviewPlayground />
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
        <div><b><code>summarizeBillingDashboard</code></b><p>Calculate outstanding balance, paid totals, status counts, and aging buckets.</p></div>
        <div><b><code>buildBillingReportRows</code></b><p>Group normalized bill summaries by payer, lifecycle status, or aging bucket.</p></div>
        <div><b><code>buildBillingReportCsv</code></b><p>Export the grouped report as CSV.</p></div>
        <div><b><code>buildBillStatusAgingMatrix</code></b><p>Aggregate bills into the status × aging grid with per-cell bills and totals.</p></div>
        <div><b><code>buildBillStatusAgingCsv</code></b><p>Export the status × aging grid as CSV.</p></div>
      </div>
    </DocPage>
  );
}
