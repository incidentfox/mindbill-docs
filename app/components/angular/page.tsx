import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular @mindbill/node`;

const session = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

app.post("/api/mindbill/session", requireUser, async (req, res) => {
  res.json(await mindbill.createBrowserSession({
    subject: req.user.id,
    permissions: billingPermissionsFor(req.user.role),
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

const angular = `import { Component, Input } from "@angular/core";
import { MindBillBillLifecycleComponent } from "@mindbill/angular";

@Component({
  selector: "app-case-billing",
  standalone: true,
  imports: [MindBillBillLifecycleComponent],
  template: \`
    <mindbill-bill-lifecycle
      [create]="toBillSnapshot(caseRecord)"
      sessionEndpoint="/api/mindbill/session"
      [appearance]="{ preset: 'clinical-blue' }"
      (billCreated)="rememberBillId($event.billId)"
      (submitted)="onSubmitted($event)"
      (billingError)="onBillingError($event)"
    />
  \`,
})
export class CaseBillingComponent {
  @Input({ required: true }) caseRecord!: CaseRecord;
}`;

const existing = `<mindbill-bill-lifecycle
  [billId]="storedBillId"
  sessionEndpoint="/api/mindbill/session"
  [refreshInterval]="30000"
/>`;

const store = `import { MindBillLifecycleStore } from "@mindbill/angular";

export class BillingToolbar {
  readonly billing = inject(MindBillLifecycleStore);

  async close() {
    await this.billing.closeBill({ reason: "Completed" });
  }
}`;

export default function AngularPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Angular"
      description="A native standalone component and injectable store for the complete bill lifecycle. No React and no iframe."
      toc={[
        { id: "setup", label: "Setup" },
        { id: "component", label: "Lifecycle component" },
        { id: "inputs", label: "Inputs and outputs" },
        { id: "store", label: "Lifecycle store" },
        { id: "utilities", label: "Utilities" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <h2 id="setup">Setup</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <p>Add one authenticated route that exchanges the current user for a short-lived, organization-scoped browser session.</p>
      <CodeBlock code={session} filename="server.ts" />

      <h2 id="component">Lifecycle component</h2>
      <p>Pass <code>create</code> for a new bill or <code>billId</code> for an existing bill.</p>
      <CodeBlock code={angular} filename="case-billing.component.ts" />
      <CodeBlock code={existing} language="html" filename="existing-bill.component.html" />
      <Callout title="Included">CMS-1500 review, payer matching, keyboard-first procedure rows, documents, delivery destinations, submission, status, EORs, payments, reviews, correction, and closure.</Callout>

      <h2 id="inputs">Inputs and outputs</h2>
      <div className="data-table component-api">
        <div className="table-head"><b>Name</b><b>Type</b><b>Purpose</b></div>
        <div><code>create</code><code>CreateBillRequest</code><span>Known values for a new private draft.</span></div>
        <div><code>billId</code><code>string</code><span>Open an existing bill.</span></div>
        <div><code>sessionEndpoint</code><code>string</code><span>Your authenticated session route.</span></div>
        <div><code>getSession</code><code>function</code><span>Optional custom session loader.</span></div>
        <div><code>apiBaseUrl</code><code>string</code><span>Override the MindBill API host.</span></div>
        <div><code>refreshInterval</code><code>number</code><span>Status refresh interval in milliseconds.</span></div>
        <div><code>appearance</code><code>MindBillAppearance</code><span>Preset and token overrides.</span></div>
        <div><code>billCreated</code><code>&#123; billId, data &#125;</code><span>Emitted after browser-side creation.</span></div>
        <div><code>submitted</code><code>BillLifecycleData</code><span>Emitted after submission.</span></div>
        <div><code>billingError</code><code>Error</code><span>Emitted for a request or rendering error.</span></div>
      </div>

      <h2 id="store">Lifecycle store</h2>
      <p><code>MindBillLifecycleStore</code> exposes the same state and actions for a custom Angular layout.</p>
      <CodeBlock code={store} filename="billing-toolbar.component.ts" />

      <h2 id="utilities">Utility</h2>
      <p><code>ensureTrailingProcedureLine</code> keeps one empty keyboard-ready row after populated service lines—the same behavior used by the component.</p>
    </DocPage>
  );
}
