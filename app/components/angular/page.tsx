import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular @mindbill/node`;

const create = `const bill = await mindbill.createBill(
  toBillSnapshot(caseRecord),
  \`create-bill-\${caseRecord.id}\`,
);

await saveMindBillId(caseRecord.id, bill.id);`;

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
      (billIdChange)="billId = $event"
      (submitted)="onSubmitted($event)"
      (billingError)="onBillingError($event)"
    />
  \`,
})
export class CaseBillingComponent {
  @Input({ required: true }) billId!: string;

  onSubmitted(event: unknown) { console.log(event); }
  onBillingError(error: unknown) { console.error(error); }
}`;

const express = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
  organizationId: process.env.MINDBILL_ORG_ID!,
});

app.post("/api/mindbill/session", async (req, res) => {
  const user = await requireSignedInUser(req);
  const { billId } = req.body;

  await assertUserCanAccessBill(user, billId);

  res.json(await mindbill.createBrowserSession({
    component: "bill-review",
    billId,
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

export default function AngularPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Angular"
      description="Use the same connected bill lifecycle as a native standalone Angular component—without React or an iframe."
      toc={[
        { id: "install", label: "Install" },
        { id: "create", label: "Create a bill" },
        { id: "component", label: "Render the lifecycle" },
        { id: "session", label: "Mint a session" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />

      <h2 id="create">1. Create the bill on your server</h2>
      <p>Map your case to a bill snapshot once, create the private draft, and save the returned bill ID with your own record.</p>
      <CodeBlock code={create} filename="server/create-bill.ts" />

      <h2 id="component">2. Render the lifecycle</h2>
      <p>The component loads and edits the existing bill, handles documents and routing, and changes its actions as acknowledgements, EORs, payments, denials, and reviews arrive.</p>
      <CodeBlock code={angular} filename="case-billing.component.ts" />
      <Callout title="Native Angular">This is a standalone Angular component with ordinary inputs and outputs. It does not wrap React or render an iframe.</Callout>

      <h2 id="session">3. Add one server route</h2>
      <p>The route authenticates your user, checks access to the requested bill, and returns a short-lived session scoped to that bill and browser origin. The same pattern works with Express, Nest, .NET, Java, Rails, Django, Go, or any other backend.</p>
      <CodeBlock code={express} filename="server.ts" />
    </DocPage>
  );
}
