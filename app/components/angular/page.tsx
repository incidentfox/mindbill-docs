import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Angular components" };

const install = `npm install @mindbill/angular @mindbill/node`;

const angular = `import { Component } from "@angular/core";
import { MindBillBillLifecycleComponent } from "@mindbill/angular";

@Component({
  selector: "app-case-billing",
  standalone: true,
  imports: [MindBillBillLifecycleComponent],
  template: \`
    <mindbill-bill-lifecycle
      [create]="bill"
      sessionEndpoint="/api/mindbill/session"
      [appearance]="{ preset: 'clinical-blue' }"
      (billCreated)="linkBill($event.billId)"
    />
  \`,
})
export class CaseBillingComponent {
  bill = this.caseService.toBillingSnapshot();

  linkBill(billId: string) {
    this.caseService.linkBill(billId);
  }
}`;

const existing = `<mindbill-bill-lifecycle
  [billId]="billId"
  sessionEndpoint="/api/mindbill/session"
  [appearance]="{ preset: 'clinical-blue' }"
/>
`;

const express = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env["MINDBILL_API_KEY"]!,
});

app.post("/api/mindbill/session", async (req, res) => {
  const user = await requireSignedInUser(req);

  res.json(await mindbill.createBrowserSession({
    subject: user.id,
    allowedOrigin: process.env["APP_ORIGIN"]!,
    permissions: billingPermissionsFor(user.role),
    expiresIn: 900,
  }));
});`;

export default function AngularPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Angular"
      description="The standalone Angular component provides the same native bill creation, API client, trailing procedure row, delivery dialog, and state-aware actions as React."
      toc={[
        { id: "install", label: "Install" },
        { id: "component", label: "Create and render" },
        { id: "existing", label: "Open an existing bill" },
        { id: "session", label: "Add one server route" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/api-reference", label: "REST API" }}
    >
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <h2 id="component">Create and render the lifecycle</h2>
      <p>Pass your existing case values through <code>create</code>. The component creates the private draft directly and emits the stable bill ID for your application to link.</p>
      <CodeBlock code={angular} filename="case-billing.component.ts" />
      <Callout title="Native Angular">This is a standalone Angular component with ordinary inputs and outputs. It does not wrap React or render an iframe.</Callout>
      <h2 id="existing">Open an existing bill</h2>
      <CodeBlock code={existing} language="html" filename="case-billing.component.html" />
      <h2 id="session">Add one server route</h2>
      <p>The same organization-and-user session model works with Express, Nest, .NET, Java, Rails, Django, Go, or any other backend.</p>
      <CodeBlock code={express} filename="server.ts" />
    </DocPage>
  );
}
