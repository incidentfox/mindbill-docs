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
      [billId]="billId"
      sessionEndpoint="/api/mindbill/session"
      [appearance]="{ preset: 'clinical-blue' }"
      (billIdChange)="billId = $event"
    />
  \`,
})
export class CaseBillingComponent {
  billId = "bill_123";
}`;

const express = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env["MINDBILL_API_KEY"]!,
});

app.post("/api/mindbill/session", requireUser, async (req, res) => {
  await requireBillAccess(req.user, req.body.billId);

  res.json(await mindbill.createBrowserSession({
    component: "bill-review",
    billId: req.body.billId,
    allowedOrigin: \`\${req.protocol}://\${req.get("host")}\`,
    expiresIn: 900,
  }));
});`;

export default function AngularPage() {
  return (
    <DocPage eyebrow="Components" title="Angular" description="The standalone Angular component provides the same native billing workflow, API client, trailing procedure row, delivery dialog, and state-aware actions as React."
      toc={[{ id: "install", label: "Install" }, { id: "component", label: "Add the component" }, { id: "session", label: "Add one server route" }]}
      previous={{ href: "/components/react", label: "React components" }} next={{ href: "/api-reference", label: "REST API" }}>
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <h2 id="component">Add the standalone component</h2>
      <CodeBlock code={angular} filename="case-billing.component.ts" />
      <Callout title="One input">Your application keeps the <code>billId</code>. The component loads and mutates authoritative state directly with an origin-bound session.</Callout>
      <h2 id="session">Add one server route</h2>
      <p>This example uses Express, but the route is framework-neutral.</p>
      <CodeBlock code={express} filename="server.ts" />
    </DocPage>
  );
}

