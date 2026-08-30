import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/node @mindbill/react`;

const session = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

// Use any server framework. This is the only required server route.
app.post("/api/mindbill/session", async (request, response) => {
  const user = await requireSignedInUser(request);
  const permissions = billingPermissionsFor(user.role);

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    allowedOrigin: "https://your-app.example",
    permissions,
    expiresIn: 900,
  });

  response.json(session);
});`;

const component = `import { ConnectedBillLifecycle } from "@mindbill/react";

const bill = {
  externalId: "report_9f7a",
  billingMode: "med_legal",
  patient: {
    externalId: "patient_42",
    firstName: "Alex",
    lastName: "Morgan",
    dateOfBirth: "1984-05-17",
    address: {
      line1: "100 Main St",
      city: "Fresno",
      state: "CA",
      postalCode: "93721",
    },
  },
  claim: {
    externalId: "claim_17",
    claimNumber: "WC-44871",
    employer: "Example Foods",
    dateOfInjury: "2026-02-14",
  },
  service: { date: "2026-08-26" },
  serviceLines: [
    { code: "ML201", modifiers: ["95"], units: 1 },
  ],
} as const;

export function Billing() {
  return (
    <ConnectedBillLifecycle
      create={bill}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
      onBillCreated={(billId) => linkBillToCase(billId)}
    />
  );
}`;

const webhook = `// Signed webhook payload
{
  "id": "evt_0189",
  "type": "bill.submitted",
  "billId": "bill_123",
  "occurredAt": "2026-08-30T17:42:18Z",
  "data": { "state": "submitted" }
}`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Add billing to your product"
      description="Mint one short-lived browser session and render the complete billing lifecycle. The component creates the bill directly; your API key never reaches the browser."
      toc={[
        { id: "install", label: "Install the SDKs" },
        { id: "session", label: "Mint a browser session" },
        { id: "render", label: "Render billing" },
        { id: "sync", label: "Keep your app in sync" },
      ]}
      next={{ href: "/guides/authentication", label: "Authentication" }}
    >
      <Callout title="The integration in one sentence">Your server authorizes a user and mints a short-lived session; the native component creates, edits, submits, and tracks the bill directly.</Callout>
      <Steps>
        <Step title="Install the SDKs">
          <span id="install" />
          <p>The Node package mints browser sessions. The React package contains native UI, session renewal, and the complete billing client.</p>
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Add one session route">
          <span id="session" />
          <p>Authenticate the user with your existing login, map their role to billing permissions, and mint a token for your exact browser origin. The API key identifies the organization automatically.</p>
          <CodeBlock code={session} filename="server/mindbill-session.ts" />
          <Callout tone="warning" title="Never expose the API key">Only the short-lived session reaches the browser. Keep <code>MINDBILL_API_KEY</code> in your server environment.</Callout>
        </Step>
        <Step title="Render billing">
          <span id="render" />
          <p>Pass the values you already know. The component creates the private draft, lets the user review every field and attachment, resolves delivery routes, submits the bill, and renders the valid next actions.</p>
          <CodeBlock code={component} filename="Billing.tsx" />
          <Callout title="What you store">Keep the stable <code>billId</code> if you want a direct link from your case or report. No provider, location, or payer database synchronization is required.</Callout>
        </Step>
        <Step title="Keep your app in sync">
          <span id="sync" />
          <p><code>onBillCreated</code> is useful for immediate UI updates. Signed webhooks are the durable source for submission, payment, denial, review, resubmission, and closure changes.</p>
          <CodeBlock code={webhook} language="json" filename="bill.submitted" />
        </Step>
      </Steps>
      <h2 id="test">Test without sending a live bill</h2>
      <p>Use a development API key and synthetic data. Sandbox submissions return synthetic acknowledgments without sending anything to a payer.</p>
    </DocPage>
  );
}
