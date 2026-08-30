import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { StatusPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "React components" };

const install = `npm install @mindbill/react @mindbill/node`;

const session = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

app.post("/api/mindbill/session", async (req, res) => {
  const user = await requireSignedInUser(req);

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    permissions: billingPermissionsFor(user.role),
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  res.json(session);
});`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";
import "@mindbill/react/styles.css";

export function CaseBilling({ caseRecord }: { caseRecord: CaseRecord }) {
  return (
    <ConnectedBillLifecycle
      create={toBillSnapshot(caseRecord)}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
      onBillCreated={(billId) => rememberForCurrentView(billId)}
      onBillIdChange={(billId) => console.log("Active bill", billId)}
    />
  );
}`;

const existing = `<ConnectedBillLifecycle
  billId={storedBillId}
  sessionEndpoint="/api/mindbill/session"
  appearance={{ preset: "orange-bright" }}
/>`;

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
      description="Create and manage the complete bill lifecycle as native React UI. The component owns its browser API calls; your server only mints short-lived sessions."
      toc={[
        { id: "install", label: "Install" },
        { id: "session", label: "Authorize" },
        { id: "create", label: "Create and render" },
        { id: "existing", label: "Open an existing bill" },
        { id: "playground", label: "Live playground" },
        { id: "hooks", label: "Hooks" },
        { id: "appearance", label: "Appearance" },
      ]}
      previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
      next={{ href: "/components/angular", label: "Angular components" }}
    >
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />

      <h2 id="session">1. Add one authenticated server route</h2>
      <p>Map your signed-in user&apos;s role to billing permissions and mint an organization-scoped, exact-origin session. No bill needs to exist yet.</p>
      <CodeBlock code={session} filename="server/session.ts" />

      <h2 id="create">2. Pass known values and render</h2>
      <p>Use <code>create</code> for a new bill. The component creates the private draft directly, then handles payer matching, edits, documents, delivery choices, submission, status, EORs, payments, reviews, corrections, and closure.</p>
      <CodeBlock code={lifecycle} filename="CaseBilling.tsx" />
      <Callout title="Included behavior">Payer search uses name and claim-number evidence. Procedure entry always keeps one keyboard-ready empty row after entered rows. Submission shows the actual e-bill, fax, mail, and email destinations before sending.</Callout>
      <Callout title="Persisting the association"><code>onBillCreated</code> gives immediate UI feedback. Use the stable <code>externalId</code>, ordered events, or signed webhooks for durable server synchronization.</Callout>

      <h2 id="existing">Open an existing bill</h2>
      <p>After creation, pass the stable bill ID to reopen the same lifecycle. The component refreshes authoritative state and exposes only actions valid for the current status.</p>
      <CodeBlock code={existing} filename="ExistingBill.tsx" />

      <h2 id="playground">Try a component</h2>
      <p>Edit the code and interact with the rendered result. This is the published component, not a screenshot.</p>
      <StatusPlayground />

      <h2 id="hooks">Build a custom layout with hooks</h2>
      <p><code>useBillLifecycle</code> provides the same session-aware methods without prescribing a layout.</p>
      <CodeBlock code={hook} filename="BillingActions.tsx" />

      <h2 id="appearance">Match your product</h2>
      <p>Start with <code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, or <code>clinical-blue</code>, then override accent, text, surface, border, radius, shadow, font, and spacing tokens.</p>
    </DocPage>
  );
}
