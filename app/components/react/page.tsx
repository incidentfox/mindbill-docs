import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { StatusPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "React components" };

const install = `npm install @mindbill/react @mindbill/node`;

const create = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
  organizationId: process.env.MINDBILL_ORG_ID!,
});

// Run this in your server when the user starts billing a case.
const bill = await mindbill.createBill(
  toBillSnapshot(caseRecord),
  \`create-bill-\${caseRecord.id}\`,
);

await saveMindBillId(caseRecord.id, bill.id);`;

const session = `app.post("/api/mindbill/session", async (req, res) => {
  const user = await requireSignedInUser(req);
  const { billId } = req.body;

  await assertUserCanAccessBill(user, billId);

  const session = await mindbill.createBrowserSession({
    component: "bill-review",
    billId,
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  res.json(session);
});`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";
import "@mindbill/react/styles.css";

export function CaseBilling({ billId }: { billId: string }) {
  return (
    <ConnectedBillLifecycle
      billId={billId}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
      onChanged={(bill) => console.log(bill.status)}
    />
  );
}`;

const hook = `import { useBillLifecycle } from "@mindbill/react";

function BillingActions({ billId }: { billId: string }) {
  const billing = useBillLifecycle({
    billId,
    sessionEndpoint: "/api/mindbill/session",
  });

  if (billing.isLoading) return <p>Loading…</p>;
  if (billing.error) return <button onClick={billing.refresh}>Try again</button>;

  const eor = billing.data?.eors[0];

  return (
    <button disabled={!eor} onClick={() => eor && billing.openEor(eor)}>
      View EOR
    </button>
  );
}`;

export default function ReactPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="React"
      description="Render bill review, submission, status, EORs, payments, reviews, corrections, and closure as native React UI inside your product."
      toc={[
        { id: "install", label: "Install" },
        { id: "create", label: "Create a bill" },
        { id: "session", label: "Mint a session" },
        { id: "render", label: "Render the lifecycle" },
        { id: "playground", label: "Live playground" },
        { id: "hooks", label: "Hooks" },
        { id: "appearance", label: "Appearance" },
      ]}
      previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
      next={{ href: "/components/angular", label: "Angular components" }}
    >
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />

      <h2 id="create">1. Create the bill on your server</h2>
      <p>Create a private draft from your existing case data and keep the returned <code>bill.id</code>. That stable ID connects your case to every acknowledgement, EOR, payment, denial, and review that follows.</p>
      <CodeBlock code={create} filename="server/create-bill.ts" />

      <h2 id="session">2. Mint a short-lived browser session</h2>
      <p>Authenticate the user and verify they can access the bill before minting a session. The session is restricted to that bill, component, and browser origin; your API key never reaches the browser.</p>
      <CodeBlock code={session} filename="server/session.ts" />

      <h2 id="render">3. Render the complete lifecycle</h2>
      <p>Pass the bill ID to the connected component. It fetches authoritative data, renews its session, saves edits, uploads documents, submits the bill, and exposes the correct actions for the current status.</p>
      <CodeBlock code={lifecycle} filename="CaseBilling.tsx" />
      <Callout title="Included behavior">Payer search uses name and claim-number signals. Procedure entry keeps one keyboard-ready empty row after completed rows. Submission shows the resolved e-bill, fax, mail, and email destinations before anything is sent.</Callout>

      <h2 id="playground">Try a component</h2>
      <p>Edit the code and interact with the rendered result. This is the published component, not a screenshot.</p>
      <StatusPlayground />

      <h2 id="hooks">Build a custom layout with hooks</h2>
      <p><code>useBillLifecycle</code> provides the same session-aware status, payer search, save, submit, document, EOR, payment, review, correction, and close methods without prescribing a layout.</p>
      <CodeBlock code={hook} filename="BillingActions.tsx" />

      <h2 id="appearance">Match your product</h2>
      <p>Start with <code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, or <code>clinical-blue</code>, then override accent, text, surface, border, radius, shadow, font, and spacing tokens.</p>
    </DocPage>
  );
}
