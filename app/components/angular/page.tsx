import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { angularAttachments, angularCustomLifecycle, angularOperations, angularMatrix } from "@/lib/angular-component-recipes";
import { singleBillAngular, settingsAngular } from "@/lib/quickstart-recipes";
import {
  DashboardAngularPlayground,
  ManagementButtonAngularPlayground,
  MatrixAngularPlayground,
  SubmissionAngularPlayground,
} from "@/components/angular-playgrounds";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular@0.19.0`;

const submission = singleBillAngular;

function ApiTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="data-table component-api">
      <div className="table-head"><b>Name</b><b>Type</b><b>Description</b></div>
      {rows.map(([name, type, description]) => (
        <div key={name}><code>{name}</code><code>{type}</code><span>{description}</span></div>
      ))}
    </div>
  );
}

export default function AngularPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Angular"
      description="Add bill submission and lifecycle management, then compose dashboards, reporting, and practice settings with standalone Angular components."
      toc={[
        { id: "start", label: "Get started" },
        { id: "choose", label: "Component catalog" },
        { id: "setup", label: "Install" },
        { id: "security", label: "Session endpoint" },
        { id: "workflow", label: "Complete case workflow" },
        { id: "submission", label: "Submission behavior" },
        { id: "lifecycle", label: "Lifecycle component" },
        { id: "operations", label: "Operations components" },
        { id: "matrix", label: "Status × aging matrix" },
        { id: "management", label: "Management button" },
        { id: "onboarding", label: "Saved practice settings" },
        { id: "notifications", label: "Notification settings" },
        { id: "custom", label: "Custom lifecycle UI" },
        { id: "exports", label: "Choose an export" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <h2 id="start">Add billing to your application</h2>
      <p>Follow the <Link href="/learn/quickstart">components quickstart</Link> and select Angular for installation, a session endpoint, a create-bill page, routing, and a dashboard. The flow is the same as React: review and submit a bill, save its ID on your report, and reopen its lifecycle view.</p>
      <h2 id="choose">Component catalog</h2>
      <p>This reference targets <code>@mindbill/angular@0.19.0</code>. The server API and browser-session contract are shared with React; the available UI exports differ.</p>
      <ApiTable rows={[
        ["Submit a bill", "MindBillBillSubmissionComponent", "Angular equivalent of BillSubmissionForm; emits (submitted)."],
        ["Open a submitted bill", "MindBillBillLifecycleComponent", "Connected bill view; pass billId and sessionEndpoint."],
        ["Dashboard and reports", "MindBillBillingDashboardComponent", "Pass authorized bills and handle navigation. Angular does not export ConnectedBillingWorkspace."],
        ["Save practice settings", "MindBillOrganizationOnboardingComponent", "Use variant=\"settings\" for editing saved practice details."],
        ["Custom lifecycle UI", "MindBillLifecycleStore", "Signal-based state and actions for your Angular templates."],
        ["Email notification preferences", "Host UI + notification API", "The React notification-settings components have no Angular export in this release."],
      ]} />
      <p>Individual React form sections, connected search/productivity/payment-review surfaces, and courtesy-copy recipient controls are not interchangeable Angular imports. Use the supported components below or build an Angular view over the <Link href="/api-reference/browser-api">shared API</Link>.</p>

      <Callout title="The component owns the billing workflow">Your application supplies initial case data, attachments, and one authenticated session endpoint. The Angular library owns field requirements, directory search, validation, submission, status, EORs, payments, and bill actions.</Callout>

      <h2 id="setup">Setup</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <p>All Angular exports are standalone components. Import only the surfaces your product needs. The previews on this page are the real Angular components, rendered live from the published bundle. Angular 18–21 and RxJS 7.8 or 8 satisfy this release’s peer dependencies. The previews use a separately deployed Angular bundle; the copyable examples below target the published package.</p>

      <h2 id="security">Session endpoint</h2>
      <p>Keep the permanent API key on your server. This is the only MindBill-specific server route required by the embedded components: authenticate the current user and mint a short-lived, exact-origin browser token.</p>
      <p>Use the <Link href="/guides/authentication#session">server route recipe</Link> for your backend. It must authenticate the user, select their organization credential, and enforce permissions before minting a session. Configure <code>APP_ORIGIN</code> as the Angular app’s exact origin, not the API server’s URL.</p>
      <p>Set <code>MINDBILL_API_KEY</code> in the backend environment and restart that server after changing it. Do not put the key in Angular <code>environment.ts</code>, browser code, or a public environment variable. Use the <Link href="/learn/quickstart#auth">shared session troubleshooting steps</Link> if the route returns “Billing session unavailable.” For local development, proxy <code>/api</code> to your backend; the session’s allowed origin must still be the Angular app’s origin.</p>
      <Callout tone="warning" title="Never expose the API key">The browser receives only a short-lived token scoped to your organization, user, origin, and permissions. It never sees your permanent MindBill credential or clearinghouse routing IDs.</Callout>

      <h2 id="workflow">Complete case workflow</h2>
      <p>Start with editable fields, then prefill them from your report and supply the finalized PDFs. Switch to the connected lifecycle component after submission. The browser submits directly to MindBill; your server does not proxy or transform the bill payload.</p>
      <CodeBlock code={submission} filename="new-bill.component.ts" />
      <p>Use a stable <code>externalId</code> from your case or report. Persist the returned <code>billId</code> for fast lookup, or reconcile it later through the external ID and signed events.</p>

      <p>The <Link href="/learn/quickstart#persist-bill-id">persistence recipe</Link> saves the returned ID through your backend. If saving that link fails, the bill has already been submitted: recover it using <code>externalId</code> rather than submitting again. An external ID is a lookup key, not a uniqueness guarantee.</p>

      <h2 id="submission">Complete submission form</h2>
      <p><code>MindBillBillSubmissionComponent</code> includes the complete patient, injury, payer, provider, service-location, diagnosis, service-line, fee schedule, and attachment workflow. It marks required fields, scrolls to the first error, resolves ZIP codes, searches claims administrators and ICD-10 codes, validates routing selections, calculates totals, and submits one immutable bill snapshot.</p>
      <h3><code>mindbill-bill-submission</code> inputs and outputs</h3>
      <ApiTable rows={[
        ["initialBill", "BrowserBillCreateInput", "Prefilled patient, claim, provider, diagnosis, and service-line values from your case."],
        ["attachments", "MindBillSubmissionAttachment[]", "Documents supplied by your product. locked: true renders an auto-attached, non-removable row — use it for the finalized report and the practice W-9."],
        ["sessionEndpoint", "string", "Your authenticated route that returns { token }. Default /api/mindbill/session."],
        ["apiBaseUrl", "string", "Override the MindBill API origin (sandbox proxies, tests)."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["submitter", "(input) => Promise<BrowserBillSubmissionResult>", "Optional custom submit hook; omit to submit directly to MindBill."],
        ["(submitted)", "BrowserBillSubmissionResult", "Fires once with the immutable billId after atomic submission."],
        ["(submissionError)", "Error", "Session or submission failure; show feedback in your application."],
        ["(billChange)", "BrowserBillCreateInput", "Edited form snapshot; avoid logging or persisting sensitive form values."],
      ]} />
      <h3>Attach finalized documents</h3>
      <p>Provide PDF bytes using <code>contentBase64</code>, <code>contentUrl</code>, or <code>loadBlob</code>. A filename alone is not an attachment. Your document endpoint must enforce access to the report. Omit <code>attachments</code> to let users choose files in the form.</p>
      <CodeBlock code={angularAttachments} filename="billing-attachments.ts" />
      <SubmissionAngularPlayground />
      <p>Field requirements and payer mappings come from MindBill, not host-app validation. See <Link href="/guides/bills">The bill resource</Link> for the complete required/optional contract and <Link href="/api-reference/create-bill">Create and submit a bill</Link> for cURL and response examples.</p>

      <p>Load the saved bill ID with the case and persist <code>$event.bill.id</code> in your host application when submission succeeds. Local component state alone is lost on refresh. Pass only the finalized report and supporting PDFs the user has selected.</p>

      <h2 id="lifecycle">Lifecycle component</h2>
      <p><code>MindBillBillLifecycleComponent</code> loads the submitted snapshot, status, EORs, documents, payments, and history. Its action flows include corrections, second review, duplicate copies, payment posting, status reporting, and closure when eligible. <code>MindBillLifecycleStore</code> exposes the same connected state as an injectable service for fully custom layouts.</p>
      <p>It receives only a submitted <code>billId</code> and a session, not editable initial bill data. For access to one bill, use an authenticated route such as <code>/api/mindbill/bills/:billId/session</code> that checks the user’s bill access and mints <code>{`resource: { billId }`}</code> with the required read/action permissions. See the <Link href="/guides/authentication#session">session recipe</Link>.</p>
      <h3><code>mindbill-bill-lifecycle</code> inputs and outputs</h3>
      <ApiTable rows={[
        ["billId", "string", "The submitted bill to track. Required."],
        ["sessionEndpoint", "string", "Your authenticated session route. Default /api/mindbill/session."],
        ["getSession", "() => Promise<BillLifecycleSession>", "Programmatic alternative to sessionEndpoint."],
        ["apiBaseUrl", "string", "Override the MindBill API origin."],
        ["refreshInterval", "number", "Milliseconds between automatic refreshes. Default 60000."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["(billingError)", "Error", "Session or fetch failures, after the built-in retry surface."],
      ]} />

      <h2 id="operations">Operations components</h2>
      <p>Organization-level surfaces can be embedded together or independently. The dashboard includes monthly submitted and closed totals, outstanding balance, aging buckets, search, status filters, and bill drill-down. The report component exports the normalized bill list, and the management button opens a short-lived SSO session in MindBill.</p>
      <CodeBlock code={angularOperations} filename="billing-operations.component.ts" />
      <DashboardAngularPlayground />
      <p>For a working page that loads rows, handles errors, and opens bill details, copy the <Link href="/learn/quickstart#dashboard">Angular dashboard recipe</Link>. These components do not fetch the bills themselves. Totals cover the supplied rows only: load every relevant page for a complete summary, or build a paginated view using the API’s totals.</p>
      <p>All operations components consume the same normalized <code>MindBillDashboardBill</code> summaries — id, patient, claim, payer, state, submittedAt or agingDays, and the three money fields — so the same authorized data load can feed several surfaces. Bill-task dashboards use their own task response rather than this bill-summary array. <code>summarizeMindBillDashboard</code>, <code>buildMindBillReportRows</code>, and <code>buildMindBillReportCsv</code> are exported for custom layouts and reporting. For CSV, pass <code>{'buildMindBillReportRows(bills, "payer")'}</code> into <code>buildMindBillReportCsv</code>.</p>

      <h2 id="matrix">Status × aging matrix</h2>
      <p><code>MindBillStatusAgingMatrixComponent</code> is the management view billing teams expect from legacy tools: one row per lifecycle status, one column per 0–30 / 31–60 / 61–90 / 91+ aging bucket, clickable counts with outstanding balances, and row, column, and grand totals. Every emitted cell carries the exact bills behind its count, so a drill-down never needs a second query.</p>
      <CodeBlock code={angularMatrix} filename="billing-matrix.component.ts" />
      <MatrixAngularPlayground />
      <h3><code>mindbill-status-aging-matrix</code> inputs and outputs</h3>
      <ApiTable rows={[
        ["bills", "MindBillDashboardBill[]", "The same normalized summaries the dashboard consumes."],
        ["heading / description", "string", "Header copy above the grid."],
        ["stateOrder", "string[]", "Pin your lifecycle-first row order; unknown states append alphabetically."],
        ["showBalances", "boolean", "Show outstanding balance under each count. Default true."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["(cellSelected)", "MindBillStatusAgingCell", "{ state, bucket, count, balance, bills } for the clicked cell, including totals cells."],
      ]} />
      <p><code>buildMindBillStatusAgingMatrix</code> and <code>buildMindBillStatusAgingCsv</code> expose the same aggregation presentation-free for custom grids and exports.</p>

      <h2 id="management">Management button</h2>
      <p><code>MindBillBillingManagementButtonComponent</code> is the prebuilt hosted-SSO launcher. It opens a tab synchronously (so popup blockers cooperate), asks your server for a one-time URL, and navigates the tab when the URL arrives.</p>
      <h3><code>mindbill-billing-management-button</code> inputs and outputs</h3>
      <ApiTable rows={[
        ["sessionEndpoint", "string", "Your authenticated route that returns { url }. Default /api/mindbill/management-session."],
        ["sessionProvider", "() => Promise<{ url } | string>", "Programmatic alternative to sessionEndpoint."],
        ["label / loadingLabel", "string", "Button copy. Defaults: “Billing management” / “Opening billing…”."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["(opened)", "string", "The URL that was opened."],
        ["(failed)", "unknown", "Session minting or navigation failures."],
      ]} />
      <ManagementButtonAngularPlayground />
      <Callout title="Hosted management access">Authenticate <code>/api/mindbill/management-session</code>, call <Link href="/api-reference/management-sessions">Create a management session</Link> with your server API key, and return <code>{`{ url }`}</code>. Links are single-use and expire within minutes. Ask your MindBill integration contact to enable organization management SSO.</Callout>

      <h2 id="onboarding">Saved practice settings</h2>
      <CodeBlock code={settingsAngular} filename="billing-settings.component.ts" />
      <p>Create a separate administrator-authorized <code>/api/mindbill/settings-session</code> route with <code>organization:manage</code>. Keep ordinary bill creators on the billing session; do not grant settings permissions merely to submit a bill.</p>
      <p><code>MindBillOrganizationOnboardingComponent</code> captures the practice identity, pay-to billing provider, locations, and W-9 once — saved straight to your MindBill organization through a browser session minted with the optional <code>organization:manage</code> permission. Your users never visit the MindBill dashboard. Set <code>variant=&quot;settings&quot;</code> for the compact edit-after-setup layout; the review step renders MindBill&apos;s real onboarding checklist and <code>(completed)</code> fires when billing setup is done.</p>
      <p>From Angular 0.18.0, settings and bill submission support EIN/SSN selection and password-style SSN inputs. Blank saved SSN inputs preserve the identifier; use the clear button or enter a replacement to change it on save. To submit from a saved profile, pass <code>billingProvider: &#123; savedProviderId &#125;</code>; SSN corrections and duplicates preserve the original provider with <code>&#123; sourceBillId &#125;</code>. The form keeps either reference until the user explicitly chooses a different manual provider. Angular does not export React’s <code>organizationProfileOptions</code> or accept its <code>profileOptions</code> prop. Load authorized profile choices in your app and assign the chosen provider reference to <code>initialBill.billingProvider</code>. See the <Link href="/guides/bills">bill contract</Link>.</p>
      <ApiTable rows={[
        ["sessionEndpoint", "string", "Your authenticated session route. The session needs the organization:manage permission."],
        ["variant", '"onboarding" | "settings"', "Stepper for first-run setup, stacked sections for editing. Default onboarding."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["(saved$)", "OrganizationProfileData", "Fires after each section saves."],
        ["(completed)", "OrganizationProfileData", "Fires once when the onboarding checklist is complete."],
        ["(organizationError)", "Error", "Load or save failures."],
      ]} />

      <h2 id="notifications">Notification settings</h2>
      <p>Angular 0.19.0 has no <code>NotificationSettings</code> or <code>NotificationRecipientsSettings</code> component. Build an Angular preferences or recipient-list view against your authenticated host-server adapter using the same <Link href="/guides/notifications#host">notification API contract</Link>. Your server owns identity, verified email, practice and bill access, consent records, and the API key.</p>
      <p>Support <code>reportDigest</code> (off, daily, or weekly) alongside status alerts and aging reminders. An administrator’s invitation does not enroll a recipient: the email owner must review and confirm it. Personal preference changes need explicit consent; reload the authoritative preferences after saving. Sandbox sends no email.</p>

      <h2 id="custom">Custom lifecycle UI</h2>
      <p>Use <code>MindBillLifecycleStore</code> when you need your own Angular markup. Scope it to the bill component and disconnect on destruction or when switching bills. Unlike React, this release does not export individual status, progress, remittance, payment-ledger, action-bar, or timeline components.</p>
      <CodeBlock code={angularCustomLifecycle} filename="billing-status.component.ts" />
      <p>The store exposes <code>data()</code>, <code>loading()</code>, <code>error()</code>, and <code>mutating()</code>, plus operations such as <code>postPayment</code>, <code>resubmitBill</code>, <code>submitSecondReview</code>, and <code>closeBill</code>. Render eligible actions from the server’s lifecycle response. For client factories, import from <code>@mindbill/browser</code>; Angular re-exports the lifecycle client type, not every factory.</p>

      <h2 id="exports">Exports and utilities</h2>
      <div className="data-table component-api">
        <div className="table-head"><b>Export</b><b>Selector</b><b>Purpose</b></div>
        <div><code>MindBillBillSubmissionComponent</code><code>mindbill-bill-submission</code><span>Review, validate, attach documents, and submit a bill.</span></div>
        <div><code>MindBillBillLifecycleComponent</code><code>mindbill-bill-lifecycle</code><span>Bill detail, status, EOR, payments, history, and lifecycle actions.</span></div>
        <div><code>MindBillBillingDashboardComponent</code><code>mindbill-billing-dashboard</code><span>Monthly metrics, aging, bill search, and drill-down.</span></div>
        <div><code>MindBillStatusAgingMatrixComponent</code><code>mindbill-status-aging-matrix</code><span>Status × aging management grid with drill-down cells and totals.</span></div>
        <div><code>MindBillBillTasksDashboardComponent</code><code>mindbill-bill-tasks-dashboard</code><span>Task and aging counts from supplied task data; emits drill-down cells.</span></div>
        <div><code>MindBillBillRejectionNoticeComponent</code><code>mindbill-bill-rejection-notice</code><span>Rejection details from the supplied rejection object.</span></div>
        <div><code>MindBillBillAgingSummaryComponent</code><code>mindbill-bill-aging-summary</code><span>Clickable outstanding-balance aging buckets.</span></div>
        <div><code>MindBillBillListComponent</code><code>mindbill-bill-list</code><span>Searchable, filterable list of bills.</span></div>
        <div><code>MindBillBillingReportComponent</code><code>mindbill-billing-report</code><span>Operational reporting and CSV export.</span></div>
        <div><code>MindBillBillingManagementButtonComponent</code><code>mindbill-billing-management-button</code><span>Prebuilt SSO launcher for the hosted MindBill workspace.</span></div>
        <div><code>MindBillOrganizationOnboardingComponent</code><code>mindbill-organization-onboarding</code><span>Practice identity, locations, and W-9 setup saved straight to MindBill.</span></div>
        <div><code>MindBillLifecycleStore</code><span>injectable</span><span>Connected lifecycle state, actions, and downloads for custom layouts.</span></div>
      </div>
      <p>Presentation-free utilities: <code>summarizeMindBillDashboard</code>, <code>buildMindBillReportRows</code>, <code>buildMindBillReportCsv</code>, <code>buildMindBillStatusAgingMatrix</code>, <code>buildMindBillStatusAgingCsv</code>, <code>mindBillAgingDays</code>, <code>mindBillAgingBucket</code>, and <code>ensureTrailingProcedureLine</code>.</p>
      <p>Use <code>mindBillAngularAppearanceStyle</code> for your own themed markup. Appearance presets include <code>mindbill</code>, <code>orange-bright</code>, and <code>clinical-blue</code>. Every visual token can also be overridden.</p>
    </DocPage>
  );
}
