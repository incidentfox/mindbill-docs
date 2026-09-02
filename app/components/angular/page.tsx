import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import {
  DashboardAngularPlayground,
  ManagementButtonAngularPlayground,
  MatrixAngularPlayground,
  SubmissionAngularPlayground,
} from "@/components/angular-playgrounds";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular@0.9.0 @mindbill/node@0.13.0`;

const sessionRoute = `// app/api/mindbill/session/route.ts (Next.js)
import { MindBillClient } from "@mindbill/node";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

export async function POST(request: Request) {
  const user = await requireUser(request);
  const origin = new URL(request.url).origin;

  return NextResponse.json(await mindbill.createBrowserSession({
    subject: user.id,
    allowedOrigin: origin,
    permissions: [
      "bills:create", "bills:read", "bills:act",
      "documents:read", "payers:read", "eors:read",
    ],
    expiresIn: 900,
  }));
}`;

const submission = `import { Component, Input } from "@angular/core";
import {
  MindBillBillLifecycleComponent,
  MindBillBillSubmissionComponent,
  type MindBillSubmissionAttachment,
  type BrowserBillSubmissionInput,
} from "@mindbill/angular";

@Component({
  selector: "app-case-billing",
  standalone: true,
  imports: [
    MindBillBillSubmissionComponent,
    MindBillBillLifecycleComponent,
  ],
  template: \`
    @if (!billId) {
      <mindbill-bill-submission
        [initialBill]="initialBill"
        [attachments]="attachments"
        sessionEndpoint="/api/mindbill/session"
        [appearance]="{ preset: 'clinical-blue' }"
        (submitted)="billId = $event.bill.id"
      />
    } @else {
      <mindbill-bill-lifecycle
        [billId]="billId"
        sessionEndpoint="/api/mindbill/session"
        [appearance]="{ preset: 'clinical-blue' }"
        [refreshInterval]="30000"
      />
    }
  \`,
})
export class CaseBillingComponent {
  billId = "";
  @Input({ required: true }) initialBill!: BrowserBillSubmissionInput;
  @Input({ required: true }) attachments!: MindBillSubmissionAttachment[];
}`;

const operations = `import {
  MindBillBillingDashboardComponent,
  MindBillBillingReportComponent,
  MindBillBillingManagementButtonComponent,
} from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [
    MindBillBillingDashboardComponent,
    MindBillBillingReportComponent,
    MindBillBillingManagementButtonComponent,
  ],
  template: \`
    <mindbill-billing-dashboard
      [bills]="bills"
      [appearance]="appearance"
      (billSelected)="openBill($event)"
    />

    <mindbill-billing-report [bills]="bills" [appearance]="appearance" />

    <mindbill-billing-management-button
      sessionEndpoint="/api/mindbill/management-session"
      [appearance]="appearance"
      label="View details in MindBill"
    />
  \`,
})
export class BillingOperationsComponent { /* app-specific data loading */ }`;

const matrix = `import {
  MindBillBillListComponent,
  MindBillStatusAgingMatrixComponent,
  type MindBillStatusAgingCell,
} from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [MindBillStatusAgingMatrixComponent, MindBillBillListComponent],
  template: \`
    <mindbill-status-aging-matrix
      [bills]="bills"
      [appearance]="appearance"
      (cellSelected)="cell = $event"
    />

    @if (cell) {
      <mindbill-bill-list
        [bills]="cell.bills"
        [appearance]="appearance"
        (billSelected)="openBill($event)"
      />
    }
  \`,
})
export class BillingMatrixComponent {
  cell: MindBillStatusAgingCell | null = null;
  /* app-specific data loading */
}`;

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
      description="Add bill submission, lifecycle management, the status-by-aging management view, aging, bill lists, reporting, and hosted MindBill access with native standalone Angular components. No React and no iframe."
      toc={[
        { id: "setup", label: "Setup" },
        { id: "security", label: "Session endpoint" },
        { id: "workflow", label: "Complete case workflow" },
        { id: "submission", label: "Submission behavior" },
        { id: "lifecycle", label: "Lifecycle component" },
        { id: "operations", label: "Operations components" },
        { id: "matrix", label: "Status × aging matrix" },
        { id: "management", label: "Management button" },
        { id: "onboarding", label: "Organization onboarding" },
        { id: "exports", label: "Choose an export" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <Callout title="The component owns the billing workflow">Your application supplies initial case data, attachments, and one authenticated session endpoint. The Angular library owns field requirements, directory search, validation, submission, status, EORs, payments, and bill actions.</Callout>

      <h2 id="setup">Setup</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <p>All Angular exports are standalone components. Import only the surfaces your product needs. The previews on this page are the real Angular components, rendered live from the published bundle. Every component and utility below has the same behavior as its React counterpart, so mixed-framework teams share one mental model.</p>

      <h2 id="security">Session endpoint</h2>
      <p>Keep the permanent API key on your server. This is the only MindBill-specific server route required by the embedded components: authenticate the current user and mint a short-lived, exact-origin browser token.</p>
      <CodeBlock code={sessionRoute} filename="app/api/mindbill/session/route.ts" />
      <Callout tone="warning" title="Never expose the API key">The browser receives only a short-lived token scoped to your organization, user, origin, and permissions. It never sees your permanent MindBill credential or clearinghouse routing IDs.</Callout>

      <h2 id="workflow">Complete case workflow</h2>
      <p>Prefill the review form from your case, attach the finalized report and W-9, and switch to the connected lifecycle component after submission. The browser submits directly to MindBill; your server does not proxy or transform the bill payload.</p>
      <CodeBlock code={submission} filename="case-billing.component.ts" />
      <p>Use a stable <code>externalId</code> from your case or report. Persist the returned <code>billId</code> for fast lookup, or reconcile it later through the external ID and signed events.</p>

      <h2 id="submission">Submission behavior</h2>
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
        ["(billingError)", "unknown", "Surface session or submission failures to your product chrome."],
      ]} />
      <SubmissionAngularPlayground />
      <p>Field requirements and payer mappings come from MindBill, not host-app validation. See <Link href="/guides/bills">The bill resource</Link> for the complete required/optional contract and <Link href="/api-reference/create-bill">Create and submit a bill</Link> for cURL and response examples.</p>

      <h2 id="lifecycle">Lifecycle component</h2>
      <p><code>MindBillBillLifecycleComponent</code> owns everything after submission: the immutable snapshot, progress rail, remittance and EOR reconciliation, payer contacts, documents, payments, activity history, and the state-appropriate actions (post payment, second review, close, reopen). <code>MindBillLifecycleStore</code> exposes the same connected state as an injectable service for fully custom layouts.</p>
      <h3><code>mindbill-bill-lifecycle</code> inputs and outputs</h3>
      <ApiTable rows={[
        ["billId", "string", "The submitted bill to track. Required."],
        ["sessionEndpoint", "string", "Your authenticated session route. Default /api/mindbill/session."],
        ["getSession", "() => Promise<BillLifecycleSession>", "Programmatic alternative to sessionEndpoint."],
        ["apiBaseUrl", "string", "Override the MindBill API origin."],
        ["refreshInterval", "number", "Milliseconds between automatic refreshes. Default 60000."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["(billingError)", "unknown", "Session or fetch failures, after the built-in retry surface."],
      ]} />

      <h2 id="operations">Operations components</h2>
      <p>Organization-level surfaces can be embedded together or independently. The dashboard includes monthly submitted and closed totals, outstanding balance, aging buckets, search, status filters, and bill drill-down. The report component exports the normalized bill list, and the management button opens a short-lived SSO session in MindBill.</p>
      <CodeBlock code={operations} filename="billing-operations.component.ts" />
      <DashboardAngularPlayground />
      <p>All operations components consume the same normalized <code>MindBillDashboardBill</code> summaries — id, patient, claim, payer, state, submittedAt or agingDays, and the three money fields — so one server load feeds every surface. <code>summarizeMindBillDashboard</code>, <code>buildMindBillReportRows</code>, and <code>buildMindBillReportCsv</code> are exported for custom layouts and server-side reporting.</p>

      <h2 id="matrix">Status × aging matrix</h2>
      <p><code>MindBillStatusAgingMatrixComponent</code> is the management view billing teams expect from legacy tools: one row per lifecycle status, one column per 0–30 / 31–60 / 61–90 / 91+ aging bucket, clickable counts with outstanding balances, and row, column, and grand totals. Every emitted cell carries the exact bills behind its count, so a drill-down never needs a second query.</p>
      <CodeBlock code={matrix} filename="billing-matrix.component.ts" />
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

      <h2 id="onboarding">Organization onboarding</h2>
      <p><code>MindBillOrganizationOnboardingComponent</code> captures the practice identity, pay-to billing provider, locations, and W-9 once — saved straight to your MindBill organization through a browser session minted with the optional <code>organization:manage</code> permission. Your users never visit the MindBill dashboard. Set <code>variant=&quot;settings&quot;</code> for the compact edit-after-setup layout; the review step renders MindBill&apos;s real onboarding checklist and <code>(completed)</code> fires when billing setup is done.</p>
      <ApiTable rows={[
        ["sessionEndpoint", "string", "Your authenticated session route. The session needs the organization:manage permission."],
        ["variant", '"onboarding" | "settings"', "Stepper for first-run setup, stacked sections for editing. Default onboarding."],
        ["appearance", "MindBillAngularAppearance", "Preset plus per-token overrides."],
        ["(saved$)", "OrganizationProfileData", "Fires after each section saves."],
        ["(completed)", "OrganizationProfileData", "Fires once when the onboarding checklist is complete."],
        ["(organizationError)", "Error", "Load or save failures."],
      ]} />

      <h2 id="exports">Choose an export</h2>
      <div className="data-table component-api">
        <div className="table-head"><b>Export</b><b>Selector</b><b>Purpose</b></div>
        <div><code>MindBillBillSubmissionComponent</code><code>mindbill-bill-submission</code><span>Review, validate, attach documents, and submit a bill.</span></div>
        <div><code>MindBillBillLifecycleComponent</code><code>mindbill-bill-lifecycle</code><span>Read-only bill detail, status, EOR, payments, history, and actions.</span></div>
        <div><code>MindBillBillingDashboardComponent</code><code>mindbill-billing-dashboard</code><span>Monthly metrics, aging, bill search, and drill-down.</span></div>
        <div><code>MindBillStatusAgingMatrixComponent</code><code>mindbill-status-aging-matrix</code><span>Status × aging management grid with drill-down cells and totals.</span></div>
        <div><code>MindBillBillAgingSummaryComponent</code><code>mindbill-bill-aging-summary</code><span>Clickable outstanding-balance aging buckets.</span></div>
        <div><code>MindBillBillListComponent</code><code>mindbill-bill-list</code><span>Searchable, filterable list of bills.</span></div>
        <div><code>MindBillBillingReportComponent</code><code>mindbill-billing-report</code><span>Operational reporting and CSV export.</span></div>
        <div><code>MindBillBillingManagementButtonComponent</code><code>mindbill-billing-management-button</code><span>Prebuilt SSO launcher for the hosted MindBill workspace.</span></div>
        <div><code>MindBillOrganizationOnboardingComponent</code><code>mindbill-organization-onboarding</code><span>Practice identity, locations, and W-9 setup saved straight to MindBill.</span></div>
        <div><code>MindBillLifecycleStore</code><span>injectable</span><span>Connected lifecycle state, actions, and downloads for custom layouts.</span></div>
      </div>
      <p>Presentation-free utilities: <code>summarizeMindBillDashboard</code>, <code>buildMindBillReportRows</code>, <code>buildMindBillReportCsv</code>, <code>buildMindBillStatusAgingMatrix</code>, <code>buildMindBillStatusAgingCsv</code>, <code>mindBillAgingDays</code>, <code>mindBillAgingBucket</code>, and <code>ensureTrailingProcedureLine</code>.</p>
      <p>Available appearance presets are <code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, and <code>clinical-blue</code>. Every visual token can also be overridden.</p>
    </DocPage>
  );
}
