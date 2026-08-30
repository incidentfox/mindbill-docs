import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";
import { LifecyclePlayground, QuickstartPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/react @mindbill/node`;

const server = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

// Any server framework: POST /api/mindbill/session
export async function POST(request: Request) {
  const user = await requireSignedInUser(request);

  const permissions = user.role === "billing_admin"
    ? [
        "bills:create", "bills:read", "bills:edit", "bills:submit", "bills:act",
        "documents:read", "documents:write", "payers:read", "eors:read",
      ]
    : [
        "bills:create", "bills:read", "bills:edit",
        "documents:read", "documents:write", "payers:read",
      ];

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    permissions,
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  return Response.json(session);
}`;

const browser = `import { createBillLifecycleClient } from "@mindbill/browser";

const billing = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const { billId, data } = await billing.createBill(knownBillValues);`;

const callbacks = `<ConnectedBillLifecycle
  create={knownBillValues}
  sessionEndpoint="/api/mindbill/session"
  onBillCreated={(billId) => saveBillId(caseId, billId)}
  onBillIdChange={(billId, previousBillId) =>
    replaceBillId(caseId, previousBillId, billId)
  }
  onChanged={(bill) => {
    updateBillingSummary(bill.lifecycle); // immediate UI
    analytics.track("billing_changed", { state: bill.lifecycle.state });
  }}
/>`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Create, submit, and track a bill"
      description="Add one authorization route and one connected React component. Users review the bill, attach payer documents, submit through the available route, and handle every later response in the same surface."
      toc={[
        { id: "install", label: "Install" },
        { id: "authorize", label: "Authorize the browser" },
        { id: "render", label: "Render bill creation" },
        { id: "lifecycle", label: "Handle the lifecycle" },
        { id: "callbacks", label: "Handle callbacks" },
        { id: "sync", label: "Synchronize events" },
        { id: "api-only", label: "Without React" },
      ]}
      previous={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
      next={{ href: "/learn/routing", label: "Routing and EDI" }}
    >
      <Callout title="One user flow, one bill ID">The component creates a private bill record, uploads selected documents, opens the review form, and submits only when the user confirms a delivery route. Your product stores the returned <code>billId</code>; MindBill owns routing and the later lifecycle.</Callout>
      <Steps>
        <Step title="Install React and the server client">
          <span id="install" />
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Authorize the browser">
          <span id="authorize" />
          <p>Use any server framework. The API key fixes the organization, <code>subject</code> identifies your user, and <code>permissions</code> come from your own role-based access control.</p>
          <CodeBlock code={server} filename="server/mindbill-session.ts" />
          <Callout tone="warning" title="Do not put the API key in frontend code">Only the short-lived, exact-origin session reaches the browser. MindBill enforces both the organization boundary and the permissions on every request.</Callout>
        </Step>
        <Step title="Render bill creation and review">
          <span id="render" />
          <p>Pass every value your product already knows. They become the editable snapshot that prints on the <a href="https://www.nucc.org/images/stories/PDF/1500_claim_form_2012_02.pdf">CMS-1500</a> and travels in the <a href="https://www.cms.gov/files/document/mln006976-medicare-billing-cms-1500-837p.pdf">837P</a>.</p>
          <QuickstartPlayground />
          <p>The first tab is a safe, editable preview of the review form. The production tabs show the connected component, server route, and bill snapshot. Pass <code>billId</code> instead of <code>create</code> when reopening a bill.</p>
          <Callout title="No separate draft workflow is required">A private bill record exists so documents and edits have somewhere durable to live, but nothing reaches a payer until the user presses Submit bill. The connected component hides that orchestration.</Callout>
        </Step>
        <Step title="Keep the complete lifecycle in your product">
          <span id="lifecycle" />
          <p>After submission, the same component becomes the bill workspace. It shows progress, the frozen bill snapshot, payer contacts, EORs and original PDFs, payments, history, and only the actions valid for the current state.</p>
          <LifecyclePlayground />
          <p>Correction, resubmission, Second Bill Review, IBR or lien follow-up, payment posting, and closure open built-in dialogs. You can override callbacks and presentation, but you do not have to rebuild billing rules or modal flows.</p>
        </Step>
        <Step title="Use callbacks for the current screen">
          <span id="callbacks" />
          <p><code>onBillCreated</code> gives you the stable ID. <code>onBillIdChange</code> reports a replacement after correction. <code>onChanged</code> is useful for optimistic UI and browser analytics.</p>
          <CodeBlock code={callbacks} filename="CaseBilling.tsx" />
          <Callout tone="warning" title="Browser callbacks are not your ledger">They can be interrupted or forged. Use them to make the product feel immediate, then use signed webhooks or ordered events for durable server state.</Callout>
        </Step>
        <Step title="Synchronize payer activity">
          <span id="sync" />
          <p>Store each event ID before applying it, ignore duplicates, and process organization sequence order. Events report submission, acceptance, rejection, EOR, denial, payment, review, lien, and closure after the browser is gone.</p>
          <p><Link href="/api-reference/events">Read the event and webhook contract →</Link></p>
        </Step>
      </Steps>
      <h2 id="api-only">Use the same flow without React</h2>
      <p>The framework-neutral browser package uses the same session route. Angular ships a native lifecycle component. Your server may call the REST API directly when no user review is required.</p>
      <CodeBlock code={`npm install @mindbill/browser`} language="bash" filename="Terminal" />
      <CodeBlock code={browser} filename="billing.ts" />
    </DocPage>
  );
}
