import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Payment review" };

const workspace = `import { ConnectedBillingWorkspace } from "@mindbill/react";
import "@mindbill/react/styles.css";

<ConnectedBillingWorkspace
  sessionEndpoint="/api/mindbill/session"
  initialView="payments"
  appearance={{ preset: "mindbill" }}
  style={{ height: "calc(100dvh - 96px)", minHeight: 0 }}
/>`;

const standalone = `import { ConnectedPaymentReview } from "@mindbill/react";

<ConnectedPaymentReview
  sessionEndpoint="/api/mindbill/session"
  initialQuery={{ pageSize: 50 }}
  onSelectBill={(billId) => openAuthorizedBill(billId)}
  // Optional: your existing authorized payment-posting flow.
  onPostPayment={() => openPaymentEntry()}
/>`;

export default function PaymentReviewPage() {
  return <DocPage eyebrow="Build" title="Review confirmed payments"
    description="Give billing teams a searchable cash ledger without maintaining a second payment database."
    toc={[{ id: "workspace", label: "Workspace or standalone" }, { id: "meaning", label: "What the totals mean" }, { id: "api", label: "API and access" }]}
    previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
    next={{ href: "/guides/documents#w9-settings", label: "Practice W-9 settings" }}>
    <h2 id="workspace">Use the shared payment-review page</h2>
    <p>React 0.50.0 adds <strong>Payment review</strong> to <code>ConnectedBillingWorkspace</code>. It includes received-date quick ranges, search, pagination, confirmed-cash totals, patient counts, and a current-page CSV export. Choose <code>initialView=&quot;payments&quot;</code> to open it first, or let users choose the tab.</p>
    <CodeBlock code={workspace} filename="Billing.tsx" />
    <p>The workspace opens a selected bill in place using its built-in navigation. Use the standalone component if your app owns bill navigation:</p>
    <CodeBlock code={standalone} filename="Accounting.tsx" />
    <p><code>openAuthorizedBill</code> and <code>openPaymentEntry</code> are host callbacks, not MindBill exports. The optional <code>onPostPayment</code> callback exposes your existing payment-entry flow; without it, no page-level post-payment button appears. The workspace also accepts this callback.</p>
    <h2 id="meaning">Confirmed cash, not an expected reimbursement</h2>
    <p>Each row is one confirmed payment-ledger entry, with the bill, patient, date of service, received and posted dates, method, source, check or trace number, and amount. A bill can have several payment rows. Pending EOR or 835 amounts are not confirmed cash, and historical legacy payment entries are excluded.</p>
    <p>Summary cards cover every matching entry, not just the current page. CSV export contains the visible page only. A unique-patient count is not a bill count. Use the bill lifecycle to review expected payments, explanations of review, adjustments, and remaining balances.</p>
    <Callout title="Not bank reconciliation">Payment review reflects confirmed payments recorded in MindBill. It does not connect to a bank or independently verify a deposit. Do not record expected payer amounts as received funds.</Callout>
    <h2 id="api">Reuse your existing organization-wide session</h2>
    <p><code>GET /partner/v2/reports/payments</code> requires <code>bills:read</code>. Browser callers need an organization-wide session; a single-bill session cannot enumerate practice payments. The credential fixes the organization, partner, and sandbox or live environment.</p>
    <p>Supported query parameters are <code>q</code>, <code>receivedFrom</code>, <code>receivedTo</code>, <code>renderingProviderId</code>, <code>page</code> (default 1), and <code>pageSize</code> (default 50, maximum 250). Date filters use <code>YYYY-MM-DD</code>. The SDK&apos;s <code>getPaymentReview</code> method on <code>createBillingOperationsClient</code> accepts the same filters.</p>
    <p>The response is <code>{`{ data: { items, total, page, pageSize, summary: { postedTotal, entryCount, uniquePatients } } }`}</code>. Invalid filters return a validation error rather than an unfiltered report. Report responses are private and not cached.</p>
    <Callout tone="warning" title="Read permission does not authorize a payment">The report only reads the ledger. Posting or editing payments still requires the separately authorized bill action. Do not grant broader permissions merely to render this page. Keep exported patient information out of logs, analytics, and coding-agent prompts.</Callout>
  </DocPage>;
}
