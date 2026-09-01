import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";
import { LifecyclePlayground, QuickstartPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/react @mindbill/node`;

const component = `import { BillSubmissionForm, ConnectedBillLifecycle } from "@mindbill/react";

export function CaseBilling({ workItemId, initialBill, caseDocuments, billId, onSubmitted }) {
  if (billId) {
    return (
      <ConnectedBillLifecycle
        billId={billId}
        sessionEndpoint={\`/api/mindbill/bills/\${billId}/session\`}
      />
    );
  }

  return (
    <BillSubmissionForm
      initialBill={{ ...initialBill, externalId: workItemId }}
      attachments={caseDocuments}
      sessionEndpoint="/api/mindbill/submission-session"
      submitLabel="Submit bill"
      onSubmitted={({ billId }) => onSubmitted(billId)}
    />
  );
}`;

const submitRoute = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

export async function POST(request: Request) {
  const user = await requireSignedInUser(request);
  return Response.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions: ["bills:create", "payers:read"],
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
}`;

const sessionRoute = `export async function POST(
  request: Request,
  { params }: { params: Promise<{ billId: string }> },
) {
  const user = await requireSignedInUser(request);
  const { billId } = await params;
  await requireBillAccess(user, billId);

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    permissions: [
      "bills:read", "bills:act", "documents:read", "eors:read",
    ],
    resource: { billId },
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  return Response.json(session);
}`;

const callbacks = `<ConnectedBillLifecycle
  billId={billId}
  sessionEndpoint={\`/api/mindbill/bills/\${billId}/session\`}
  onBillIdChange={(replacementId, previousId) =>
    replaceBillId(caseId, previousId, replacementId)
  }
  onChanged={(bill) => {
    updateBillingSummary(bill.lifecycle);
    analytics.track("billing_changed", { state: bill.lifecycle.state });
  }}
/>`;

const apiOnly = `const bill = await mindbill.createAndSubmitBill({
  bill: billingSnapshot,
  submission: { route: "ebill" },
  documents: payerPacket,
}, "submit-report-9f7a");

await saveBillId(bill.id);`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Submit and track a bill"
      description="Add one native submission form and a session-only backend. MindBill owns the billing fields, validation, attachments, atomic Submit action, and every post-submission state."
      toc={[
        { id: "install", label: "Install" },
        { id: "render", label: "Render the form" },
        { id: "submit", label: "Submit atomically" },
        { id: "lifecycle", label: "Track the lifecycle" },
        { id: "authorize", label: "Authorize post-submit UI" },
        { id: "callbacks", label: "Handle callbacks" },
        { id: "sync", label: "Synchronize events" },
        { id: "api-only", label: "Without React" },
      ]}
      previous={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
      next={{ href: "/learn/routing", label: "Routing and EDI" }}
    >
      <Callout title="No draft bill">Your app holds editable values locally. When the user presses Submit, one atomic request creates an immutable MindBill bill whose first status is <code>submitted</code>. A failed request creates no public bill.</Callout>
      <Steps>
        <Step title="Install React and the server client">
          <span id="install" />
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Render the complete submission form">
          <span id="render" />
          <p><code>BillSubmissionForm</code> owns the bill table, required-field asterisks and validation, attachment selection and uploads, and Submit button. Pass the case values and documents your product already knows.</p>
          <QuickstartPlayground />
          <CodeBlock code={component} filename="CaseBilling.tsx" />
          <Callout title="Keep pre-submission state in your product">Editable values remain local until Submit. The short-lived session lets the component resolve directories and submit directly; there is no create, edit, save-draft, or separate submit operation in the public bill API.</Callout>
        </Step>
        <Step title="Create and submit one immutable snapshot">
          <span id="submit" />
          <p>Your only MindBill server responsibility is minting short-lived browser sessions. The component validates the complete snapshot, encodes selected PDFs, serializes the Partner API request, and submits it directly with a stable idempotency key.</p>
          <CodeBlock code={submitRoute} filename="server/mindbill-submission-session.ts" />
        </Step>
        <Step title="Render the post-submission lifecycle">
          <span id="lifecycle" />
          <p>After the atomic request succeeds, store the returned <code>billId</code> and render <code>ConnectedBillLifecycle</code>. It shows progress, the frozen snapshot, payer contacts, EORs and original PDFs, payments, history, and only the actions valid for the current state.</p>
          <LifecyclePlayground />
        </Step>
        <Step title="Authorize only the post-submission UI">
          <span id="authorize" />
          <p>Mint a short-lived, exact-origin browser session for the submitted bill. The permanent API key remains server-side.</p>
          <CodeBlock code={sessionRoute} filename="app/api/mindbill/bills/[billId]/session/route.ts" />
        </Step>
        <Step title="Use callbacks for the current screen">
          <span id="callbacks" />
          <p>The submission response gives you the stable ID. Afterward, <code>onBillIdChange</code> reports a replacement bill after correction and <code>onChanged</code> keeps the current screen responsive.</p>
          <CodeBlock code={callbacks} filename="CaseBilling.tsx" />
          <Callout tone="warning" title="Browser callbacks are not your ledger">They can be interrupted or forged. Use them for immediate UI, then use signed webhooks or ordered events for durable server state.</Callout>
        </Step>
        <Step title="Synchronize payer activity">
          <span id="sync" />
          <p>Store each event ID before applying it, ignore duplicates, and process organization sequence order. Events report acceptance, rejection, EOR, denial, payment, review, lien, and closure after the browser is gone.</p>
          <p><Link href="/api-reference/events">Read the event and webhook contract →</Link></p>
        </Step>
      </Steps>
      <h2 id="api-only">Use the same atomic flow without React</h2>
      <p>Your server can submit the same snapshot and payer packet directly with the Node SDK or REST API.</p>
      <CodeBlock code={apiOnly} filename="server/submit-bill.ts" />
    </DocPage>
  );
}
