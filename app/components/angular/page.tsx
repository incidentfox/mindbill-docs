import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular@0.6.1 @mindbill/node@0.13.0`;

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

export default function AngularPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Angular"
      description="Add bill submission, lifecycle management, aging, bill lists, reporting, and hosted MindBill access with native standalone Angular components. No React and no iframe."
      toc={[
        { id: "setup", label: "Setup" },
        { id: "security", label: "Session endpoint" },
        { id: "workflow", label: "Complete case workflow" },
        { id: "submission", label: "Submission behavior" },
        { id: "operations", label: "Operations components" },
        { id: "exports", label: "Choose an export" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <Callout title="The component owns the billing workflow">Your application supplies initial case data, attachments, and one authenticated session endpoint. The Angular library owns field requirements, directory search, validation, submission, status, EORs, payments, and bill actions.</Callout>

      <h2 id="setup">Setup</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <p>All Angular exports are standalone components. Import only the surfaces your product needs.</p>

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
      <p>Field requirements and payer mappings come from MindBill, not host-app validation. See <Link href="/guides/bills">The bill resource</Link> for the complete required/optional contract and <Link href="/api-reference/create-bill">Create and submit a bill</Link> for cURL and response examples.</p>

      <h2 id="operations">Operations components</h2>
      <p>Organization-level surfaces can be embedded together or independently. The dashboard includes monthly submitted and closed totals, outstanding balance, aging buckets, search, status filters, and bill drill-down. The report component exports the normalized bill list, and the management button opens a short-lived SSO session in MindBill.</p>
      <CodeBlock code={operations} filename="billing-operations.component.ts" />
      <Callout title="Hosted management access">Authenticate <code>/api/mindbill/management-session</code> and return <code>{`{ url }`}</code>. The ready-made button opens the session in a new tab without exposing a reusable credential. Ask your MindBill integration contact to enable organization management SSO.</Callout>

      <h2 id="exports">Choose an export</h2>
      <div className="data-table component-api">
        <div className="table-head"><b>Export</b><b>Selector</b><b>Purpose</b></div>
        <div><code>MindBillBillSubmissionComponent</code><code>mindbill-bill-submission</code><span>Review, validate, attach documents, and submit a bill.</span></div>
        <div><code>MindBillBillLifecycleComponent</code><code>mindbill-bill-lifecycle</code><span>Read-only bill detail, status, EOR, payments, history, and actions.</span></div>
        <div><code>MindBillBillingDashboardComponent</code><code>mindbill-billing-dashboard</code><span>Monthly metrics, aging, bill search, and drill-down.</span></div>
        <div><code>MindBillBillAgingSummaryComponent</code><code>mindbill-bill-aging-summary</code><span>Clickable outstanding-balance aging buckets.</span></div>
        <div><code>MindBillBillListComponent</code><code>mindbill-bill-list</code><span>Searchable, filterable list of bills.</span></div>
        <div><code>MindBillBillingReportComponent</code><code>mindbill-billing-report</code><span>Operational reporting and CSV export.</span></div>
        <div><code>MindBillBillingManagementButtonComponent</code><code>mindbill-billing-management-button</code><span>Prebuilt SSO launcher for the hosted MindBill workspace.</span></div>
      </div>
      <p>Available appearance presets are <code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, and <code>clinical-blue</code>. Every visual token can also be overridden.</p>
    </DocPage>
  );
}
