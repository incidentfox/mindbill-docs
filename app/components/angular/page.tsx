import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular @mindbill/node`;

const submit = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

app.post("/api/mindbill/bills", requireUser, async (req, res) => {
  const idempotencyKey = req.get("Idempotency-Key");
  if (!idempotencyKey) {
    return res.status(400).json({ error: "Idempotency-Key is required" });
  }

  const bill = await mindbill.createAndSubmitBill({
    bill: req.body.bill,
    submission: { route: "ebill" },
    documents: req.body.documents,
  }, idempotencyKey);

  res.status(201).json({ id: bill.id, state: bill.state });
});`;

const session = `app.post("/api/mindbill/session", requireUser, async (req, res) => {
  res.json(await mindbill.createBrowserSession({
    subject: req.user.id,
    permissions: [
      "bills:read", "bills:act", "documents:read", "eors:read",
    ],
    resource: { billId: await billIdForSignedInCase(req) },
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
      [billId]="billId"
      sessionEndpoint="/api/mindbill/session"
      [appearance]="{ preset: 'clinical-blue' }"
      [refreshInterval]="30000"
      (billingError)="onBillingError($event)"
    />
  \`,
})
export class CaseBillingComponent {
  @Input({ required: true }) billId!: string;
}`;

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
      description="Render the complete post-submission bill lifecycle as a native standalone Angular component. No React and no iframe."
      toc={[
        { id: "setup", label: "Setup" },
        { id: "submit", label: "Submit atomically" },
        { id: "component", label: "Lifecycle component" },
        { id: "inputs", label: "Inputs and outputs" },
        { id: "store", label: "Lifecycle store" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <Callout title="Bills begin submitted">Do not use the legacy Angular <code>create</code> input for new integrations. Keep editable values in your application, submit one reviewed snapshot and payer packet atomically from your server, then render the returned <code>billId</code>.</Callout>

      <h2 id="setup">Setup</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />

      <h2 id="submit">Submit atomically</h2>
      <p>Post your Angular form value to your authenticated server. The server SDK validates, creates, attaches the payer packet, and submits in one idempotent operation. A failed operation creates no public bill.</p>
      <CodeBlock code={submit} filename="server.ts" />
      <p>The ready-made bill submission form, including its field schema, required-field asterisks, attachments, validation, and Submit button, is currently available in <Link href="/components/react"><code>@mindbill/react</code></Link>. Angular integrations use the same atomic server API for submission.</p>

      <h2 id="component">Lifecycle component</h2>
      <p>After submission succeeds, store the returned <code>billId</code> and pass it to the lifecycle component. Add one authenticated route that exchanges the current user for a short-lived, exact-origin browser session scoped to that bill.</p>
      <CodeBlock code={session} filename="server.ts" />
      <CodeBlock code={angular} filename="case-billing.component.ts" />
      <Callout title="Included after submission">Lifecycle progress, the immutable bill snapshot, payer contacts, original EOR PDFs, payment ledger, activity history, state-aware actions, and built-in dialogs for correction, review, payment, and closure.</Callout>

      <h2 id="inputs">Inputs and outputs</h2>
      <div className="data-table component-api">
        <div className="table-head"><b>Name</b><b>Type</b><b>Purpose</b></div>
        <div><code>billId</code><code>string</code><span>Open an atomically submitted bill.</span></div>
        <div><code>sessionEndpoint</code><code>string</code><span>Your authenticated, post-submission session route.</span></div>
        <div><code>getSession</code><code>function</code><span>Optional custom session loader.</span></div>
        <div><code>apiBaseUrl</code><code>string</code><span>Override the MindBill API host.</span></div>
        <div><code>refreshInterval</code><code>number</code><span>Status refresh interval in milliseconds.</span></div>
        <div><code>appearance</code><code>MindBillAppearance</code><span>Preset and token overrides.</span></div>
        <div><code>billingError</code><code>Error</code><span>Emitted for a request or rendering error.</span></div>
      </div>

      <h2 id="store">Lifecycle store</h2>
      <p><code>MindBillLifecycleStore</code> exposes the same post-submission state and actions for a custom Angular layout.</p>
      <CodeBlock code={store} filename="billing-toolbar.component.ts" />
    </DocPage>
  );
}
