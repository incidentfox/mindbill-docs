import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import {
  ConnectedStatusPlayground,
  HostedReviewPlayground,
  HostedTimelinePlayground,
  LifecyclePlayground,
  ReviewFormPlayground,
  StatusPlayground,
} from "@/components/playground";

export const metadata: Metadata = { title: "React components" };

const install = `npm install @mindbill/react @mindbill/node`;

const session = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

app.post("/api/mindbill/session", async (req, res) => {
  const user = await requireSignedInUser(req);

  res.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions: billingPermissionsFor(user.role),
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  }));
});`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";

export function CaseBilling({ caseRecord }: { caseRecord: CaseRecord }) {
  return (
    <ConnectedBillLifecycle
      create={toBillSnapshot(caseRecord)}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
      onBillCreated={(billId) => rememberBillId(billId)}
    />
  );
}`;

const customLifecycle = `import { useBillLifecycle } from "@mindbill/react";

function BillingToolbar({ billId }: { billId: string }) {
  const bill = useBillLifecycle({
    billId,
    sessionEndpoint: "/api/mindbill/session",
  });

  if (bill.isLoading) return <p>Loading…</p>;
  if (bill.error) return <button onClick={bill.refresh}>Try again</button>;

  return (
    <>
      <strong>{bill.data?.status.state}</strong>
      <button onClick={() => bill.closeBill({ reason: "Completed" })}>
        Close bill
      </button>
    </>
  );
}`;

const status = `import { ConnectedBillStatus } from "@mindbill/react";

<ConnectedBillStatus
  billId={billId}
  sessionEndpoint="/api/mindbill/session"
  refreshInterval={30_000}
/>`;

const controlledReview = `import { BillReviewForm } from "@mindbill/react";

<BillReviewForm
  data={review}
  onSave={(input) => api.save(input)}
  onSubmit={(input, delivery) => api.submit(input, delivery)}
  onGetDeliveryOptions={() => api.getDeliveryOptions()}
  onSearchClaimsAdministrators={(query) => api.searchPayers(query)}
  onAddAttachment={(file, type, description) =>
    api.addAttachment(file, type, description)
  }
  onRemoveAttachment={(documentId) => api.removeAttachment(documentId)}
/>`;

const presentational = `import { BillStatusSummary } from "@mindbill/react";

<BillStatusSummary
  status="processed"
  submittedAt="2026-08-12T17:00:00Z"
  agingDays={13}
  totalCharge={2015}
  totalPaid={0}
  balanceDue={2015}
  actions={[{ id: "eor", label: "View EOR", onClick: openEor }]}
/>`;

const clients = `import {
  buildBillReviewSaveInput,
  createBillLifecycleClient,
  createBillStatusClient,
} from "@mindbill/react";

const lifecycle = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const created = await lifecycle.createBill(snapshot);
await lifecycle.addAttachment(file, "proof_of_service");
await lifecycle.submitBill(
  buildBillReviewSaveInput(created.data),
  { route: "ebill" },
);

const status = await createBillStatusClient({
  billId: created.billId,
  sessionEndpoint: "/api/mindbill/session",
}).getStatus();`;

const hosted = `import { MindBillBillReview, MindBillBillTimeline } from "@mindbill/react";

<MindBillBillReview sessionToken={token} embedUrl={reviewUrl} />
<MindBillBillTimeline sessionToken={token} embedUrl={timelineUrl} />`;

export default function ReactPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="React"
      description="Use the complete connected workflow or compose the same API client, hooks, forms, and status surfaces into your own UI."
      toc={[
        { id: "choose", label: "Choose an export" },
        { id: "setup", label: "Setup" },
        { id: "lifecycle", label: "Complete lifecycle" },
        { id: "custom", label: "Custom lifecycle UI" },
        { id: "status", label: "Status surfaces" },
        { id: "forms", label: "Controlled forms" },
        { id: "clients", label: "Browser clients" },
        { id: "hosted", label: "Hosted wrappers" },
        { id: "utilities", label: "Utilities" },
      ]}
      previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
      next={{ href: "/components/angular", label: "Angular components" }}
    >
      <h2 id="choose">Choose an export</h2>
      <div className="data-table component-catalog">
        <div className="table-head"><b>Export</b><b>Use it when</b><b>Owns API calls</b></div>
        <div><code>ConnectedBillLifecycle</code><span>You want the full create-to-close workflow.</span><span>Yes</span></div>
        <div><code>useBillLifecycle</code><span>You want custom lifecycle UI.</span><span>Yes</span></div>
        <div><code>ConnectedBillStatus</code><span>You need compact status and valid next actions.</span><span>Yes</span></div>
        <div><code>useBillStatus</code><span>You want custom status UI.</span><span>Yes</span></div>
        <div><code>BillReviewForm</code><span>You own data loading but want MindBill&apos;s review form.</span><span>No</span></div>
        <div><code>BillStatusSummary</code><span>You need a presentational status card.</span><span>No</span></div>
        <div><code>MindBillBillReview</code><span>You prefer the hosted review surface.</span><span>Hosted</span></div>
        <div><code>MindBillBillTimeline</code><span>You prefer the hosted timeline surface.</span><span>Hosted</span></div>
      </div>

      <h2 id="setup">Setup</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <p>Install the package, then add one authenticated server route that exchanges your signed-in user for a short-lived, organization-scoped browser session. Components ship their own styles.</p>
      <CodeBlock code={session} filename="server/session.ts" />
      <Callout title="Your API key stays server-side">The session fixes the organization, user, origin, expiry, and role permissions. It may create a bill; it does not need to be scoped to an existing bill.</Callout>

      <h2 id="lifecycle">Complete lifecycle</h2>
      <p>Pass a bill snapshot for a new bill or <code>billId</code> for an existing one.</p>
      <CodeBlock code={lifecycle} filename="CaseBilling.tsx" />
      <p>The component includes payer matching, editable CMS-1500 data, documents, delivery destinations, submission, status, EORs, payments, reviews, correction, and closure. Procedure rows always leave one empty keyboard-ready row.</p>
      <LifecyclePlayground />

      <h2 id="custom">Custom lifecycle UI</h2>
      <p><code>useBillLifecycle</code> exposes the same connected state and mutations: create, refresh, payer search, delivery options, save, submit, attachments, EOR, payment, review, correction, and close.</p>
      <CodeBlock code={customLifecycle} filename="BillingToolbar.tsx" />

      <h2 id="status">Status surfaces</h2>
      <p><code>ConnectedBillStatus</code> loads and refreshes authoritative status. <code>useBillStatus</code> exposes the same client state for a custom layout.</p>
      <CodeBlock code={status} filename="BillStatus.tsx" />
      <ConnectedStatusPlayground />
      <p><code>BillStatusSummary</code> is the data-only version when your app already has the status.</p>
      <CodeBlock code={presentational} filename="StatusCard.tsx" />
      <StatusPlayground />

      <h2 id="forms">Controlled review form</h2>
      <p><code>BillReviewForm</code> renders the native review, payer search, attachments, delivery dialog, and submission UI while your callbacks supply data.</p>
      <CodeBlock code={controlledReview} filename="ReviewForm.tsx" />
      <ReviewFormPlayground />

      <h2 id="clients">Browser clients</h2>
      <p>Use the framework-neutral clients outside React rendering or inside your own state layer.</p>
      <CodeBlock code={clients} filename="billing-client.ts" />

      <h2 id="hosted">Hosted wrappers</h2>
      <p><code>MindBillBillReview</code> and <code>MindBillBillTimeline</code> wrap the hosted review and timeline when native composition is not practical. Their editors below run the real wrapper; replace the sample token and URL with a short-lived session to load private billing data.</p>
      <CodeBlock code={hosted} filename="HostedBilling.tsx" />
      <HostedReviewPlayground />
      <HostedTimelinePlayground />

      <h2 id="utilities">Appearance and utilities</h2>
      <div className="term-list compact">
        <div><b><code>mindBillThemePresets</code></b><p><code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, and <code>clinical-blue</code>.</p></div>
        <div><b><code>resolveMindBillAppearance</code></b><p>Resolve a preset plus token overrides.</p></div>
        <div><b><code>mindBillAppearanceStyle</code></b><p>Convert appearance tokens to CSS custom properties.</p></div>
        <div><b><code>ensureTrailingProcedureLine</code></b><p>Keep exactly one empty procedure row after populated rows.</p></div>
        <div><b><code>buildBillReviewSaveInput</code></b><p>Convert controlled review state to the save payload.</p></div>
      </div>
    </DocPage>
  );
}
