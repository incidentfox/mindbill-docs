import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";

export const metadata: Metadata = { title: "Quickstart" };

const install = `pnpm add @mindbill/react`;

const environment = `MINDBILL_API_KEY=mb_live_...
APP_ORIGIN=https://your-product.example`;

const pythonSessionRoute = `import os
import requests
from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()

@app.post("/api/mindbill/session")
def create_mindbill_session(user = Depends(require_signed_in_user)):
    upstream = requests.post(
        "https://app.mindbill.org/partner/v2/browser-sessions",
        headers={
            "Authorization": f"Bearer {os.environ['MINDBILL_API_KEY']}",
            "Content-Type": "application/json",
        },
        json={
            "subject": str(user.id),
            "allowedOrigin": os.environ["APP_ORIGIN"],
            "permissions": [
                "bills:create", "bills:read", "bills:act",
                "documents:read", "payers:read", "eors:read",
            ],
            "expiresIn": 900,
        },
        timeout=10,
    )
    if not upstream.ok:
        raise HTTPException(status_code=502, detail="Unable to start billing session")
    return upstream.json()`;

const workspace = `import { ConnectedBillingWorkspace } from "@mindbill/react";

export function Billing() {
  return (
    <ConnectedBillingWorkspace
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "calm-clinical" }}
      onCreateBill={() => navigate("/billing/new")}
      onSelectBill={(bill) => navigate(\`/billing/\${bill.id}\`)}
    />
  );
}`;

const submission = `import { BillSubmissionForm } from "@mindbill/react";

<BillSubmissionForm
  initialBill={{ ...caseRecord.billing, externalId: caseRecord.id }}
  attachments={caseRecord.documents}
  sessionEndpoint="/api/mindbill/session"
  appearance={{ preset: "calm-clinical" }}
  onSubmitted={({ billId }) => navigate(\`/billing/\${billId}\`)}
/>`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";

<ConnectedBillLifecycle
  billId={billId}
  sessionEndpoint="/api/mindbill/session"
  appearance={{ preset: "calm-clinical" }}
/>`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Add complete billing in under 10 minutes"
      description="Install one React package, add one authenticated Python endpoint, and render the connected billing workspace. MindBill owns the bill directory, lifecycle, actions, payer routes, and reports."
      toc={[
        { id: "key", label: "Create an API key" },
        { id: "install", label: "Install" },
        { id: "session", label: "Add the Python endpoint" },
        { id: "render", label: "Render billing" },
        { id: "create", label: "Create a bill" },
        { id: "lifecycle", label: "Embed one bill" },
      ]}
      previous={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
      next={{ href: "/components/react", label: "React components" }}
    >
      <Callout title="The whole integration boundary">Your backend mints a short-lived browser token. Your React app passes only the session endpoint; the connected components call MindBill directly. The permanent key never reaches the browser.</Callout>
      <Steps>
        <Step title="Create a sandbox API key">
          <span id="key" />
          <p>In the <a href="https://platform.mindbill.org" target="_blank" rel="noreferrer">developer console</a>, create a sandbox key. Put it in your server environment with your exact browser origin.</p>
          <CodeBlock code={environment} language="bash" filename=".env" />
        </Step>
        <Step title="Install the React package">
          <span id="install" />
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Add one authenticated Python endpoint">
          <span id="session" />
          <p>Authenticate the caller with your existing application session, then exchange the server-only API key for a 15-minute, origin-bound browser session.</p>
          <CodeBlock code={pythonSessionRoute} language="python" filename="billing_session.py" />
          <Callout tone="warning" title="Never return the API key">Only return MindBill&apos;s short-lived session response. Keep <code>MINDBILL_API_KEY</code> in the Python process environment or your secret manager.</Callout>
        </Step>
        <Step title="Render the billing workspace">
          <span id="render" />
          <p>This one component includes Bill Tasks, true All Bills search by patient, bill, or claim, status and A/R filters, drill-down queues, procedure reporting, productivity reporting, and the complete per-bill lifecycle.</p>
          <CodeBlock code={workspace} filename="Billing.tsx" />
        </Step>
      </Steps>

      <h2 id="create">Create and submit a bill</h2>
      <p>Route your workspace&apos;s <code>onCreateBill</code> callback to a page containing <code>BillSubmissionForm</code>. It owns billing fields, validation, payer lookup, attachments, and the atomic submission. Your app supplies the case data it already knows and stores the returned bill ID.</p>
      <CodeBlock code={submission} filename="NewBill.tsx" />

      <h2 id="lifecycle">Embed only one bill when you need it</h2>
      <p>If billing lives inside a case page, render the lifecycle directly. Duplicate, correction, rejection resubmission, Second Review, payments, EORs, payer contacts, and routing confirmation remain component-owned.</p>
      <CodeBlock code={lifecycle} filename="CaseBilling.tsx" />
      <Callout title="Optional least privilege">For a case-only screen, your Python endpoint may add <code>{`"resource": { "billId": bill_id }`}</code> and omit <code>bills:create</code>. Use the organization-scoped session above for the full workspace.</Callout>

      <p><Link href="/components/react">See every connected and composable React export →</Link></p>
      <p><Link href="/api-reference/browser-sessions">See the browser-session API contract →</Link></p>
      <p><Link href="/api-reference/events">Add signed webhooks when you need lifecycle changes in your own database →</Link></p>
    </DocPage>
  );
}
