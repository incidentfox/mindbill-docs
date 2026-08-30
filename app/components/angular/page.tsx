import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular @mindbill/node`;

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
      (billCreated)="rememberForCurrentView($event)"
      (billIdChange)="billId = $event"
      (submitted)="onSubmitted($event)"
      (billingError)="onBillingError($event)"
    />
  \`,
})
export class CaseBillingComponent {
  @Input({ required: true }) caseRecord!: CaseRecord;
  billId?: string;

  toBillSnapshot(record: CaseRecord) { return toBillSnapshot(record); }
  rememberForCurrentView(billId: string) { console.log(billId); }
  onSubmitted(event: unknown) { console.log(event); }
  onBillingError(error: unknown) { console.error(error); }
}`;

const existing = `<mindbill-bill-lifecycle
  [billId]="storedBillId"
  sessionEndpoint="/api/mindbill/session"
  [appearance]="{ preset: 'clinical-blue' }"
/>`;

const express = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

app.post("/api/mindbill/session", requireUser, async (req, res) => {
  const session = await mindbill.createBrowserSession({
    subject: req.user.id,
    permissions: billingPermissionsFor(req.user.role),
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });
  res.json(session);
});`;

export default function AngularPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Angular"
      description="Create and manage the same connected bill lifecycle as a native standalone Angular component—without React or an iframe."
      toc={[
        { id: "install", label: "Install" },
        { id: "session", label: "Authorize" },
        { id: "component", label: "Create and render" },
        { id: "existing", label: "Open an existing bill" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />

      <h2 id="session">1. Add one authenticated server route</h2>
      <p>The route maps the current user&apos;s role to billing permissions and returns a short-lived session bound to your organization and browser origin. No bill needs to exist first.</p>
      <CodeBlock code={express} filename="server.ts" />

      <h2 id="component">2. Pass known values and render</h2>
      <p>Pass <code>create</code> to create a private draft directly from Angular. The component handles documents, payer matching, routing, submission, status, EORs, payments, denials, reviews, corrections, and closure.</p>
      <CodeBlock code={angular} filename="case-billing.component.ts" />
      <Callout title="Native Angular">This is a standalone Angular component with ordinary inputs and outputs. It does not wrap React or render an iframe. Procedure entry always keeps one empty row ready for keyboard entry.</Callout>

      <h2 id="existing">Open an existing bill</h2>
      <p>Pass <code>billId</code> instead of <code>create</code> when reopening a bill created earlier.</p>
      <CodeBlock code={existing} language="html" filename="case-billing.component.html" />
    </DocPage>
  );
}
