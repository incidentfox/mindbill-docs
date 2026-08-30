import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/node @mindbill/react`;

const server = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

// Use any server framework. Keep this ID in your database.
const bill = await mindbill.createBill(
  {
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
  },
  "create-report-9f7a",
);

await saveMindBillId("report_9f7a", bill.id);`;

const session = `// POST /api/mindbill/session
app.post("/api/mindbill/session", requireUser, async (req, res) => {
  const { billId } = req.body;
  await requireBillAccess(req.user, billId);

  const session = await mindbill.createBrowserSession({
    component: "bill-review",
    billId,
    allowedOrigin: "https://your-app.example",
    expiresIn: 900,
  });

  res.json(session);
});`;

const component = `import { ConnectedBillLifecycle } from "@mindbill/react";

export function Billing({ billId }: { billId: string }) {
  return (
    <ConnectedBillLifecycle
      billId={billId}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "mindbill" }}
    />
  );
}`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Add billing to your product"
      description="Create one bill on your server, mint one short-lived browser session, and render the complete billing lifecycle in your app. No provider or location synchronization is required."
      toc={[
        { id: "install", label: "Install the SDKs" },
        { id: "create", label: "Create a bill" },
        { id: "session", label: "Mint a browser session" },
        { id: "render", label: "Render billing" },
      ]}
      next={{ href: "/guides/authentication", label: "Authentication" }}
    >
      <Callout title="What you store">Your application only needs the stable MindBill <code>billId</code>. MindBill owns submission, status, EORs, payments, denials, reviews, and resubmissions.</Callout>
      <Steps>
        <Step title="Install the SDKs">
          <span id="install" />
          <p>The Node package is server-only. The React package contains native UI and its own lifecycle client.</p>
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Create a bill">
          <span id="create" />
          <p>Send the values that should print on this bill. Reusable provider and location records are optional; every bill freezes its own snapshot.</p>
          <CodeBlock code={server} filename="server/create-bill.ts" />
        </Step>
        <Step title="Mint a browser session">
          <span id="session" />
          <p>Add one authenticated route in any server framework. Authorize the signed-in user, then mint a token bound to the bill and exact browser origin.</p>
          <CodeBlock code={session} filename="server/bill-session.ts" />
          <Callout tone="warning" title="Never expose the API key">The component calls MindBill directly with this short-lived session. Your permanent key stays on the server.</Callout>
        </Step>
        <Step title="Render the lifecycle">
          <span id="render" />
          <p>The component loads the bill, searches the payer directory, edits and submits the payer packet, reads status and EORs, and displays only the actions valid for the current state.</p>
          <CodeBlock code={component} filename="Billing.tsx" />
        </Step>
      </Steps>
      <h2 id="test">Test without sending a live bill</h2>
      <p>Use a development API key and synthetic data. Sandbox submissions return accepted 999 and 277CA acknowledgments without sending to a payer.</p>
    </DocPage>
  );
}
