import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Partner integration" };

const provision = `curl https://app.mindbill.org/partner/v2/organizations \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_ACCOUNT_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: tenant-42" \\
  --data '{"externalId":"tenant_42","name":"Example Practice"}'`;

const usage = `curl https://app.mindbill.org/partner/v2/developer/account/usage \\
  --header "Authorization: Bearer $MINDBILL_ACCOUNT_KEY"`;

const scopedWebhook = `curl https://app.mindbill.org/partner/v2/developer/account/webhook-endpoints \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_ACCOUNT_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: tenant-42-webhook" \\
  --data '{"url":"https://example.com/mindbill/webhooks","eventTypes":["bill.submitted","eor.received","payment.posted"],"organizationId":"org_example"}'`;

export default function PartnerIntegrationPage() {
  return <DocPage
    eyebrow="Build"
    title="Integrate one customer at a time"
    description="A short implementation path for partners with one MindBill organization per customer."
    toc={[
      { id: "organizations", label: "Provision and isolate customers" },
      { id: "bills", label: "Submit bills across states" },
      { id: "remittance", label: "Read EORs and payments" },
      { id: "events", label: "Synchronize status" },
      { id: "commercial", label: "Go live and reconcile usage" },
    ]}
  >
    <h2 id="organizations">Provision and isolate customers</h2>
    <p>Keep an account-scoped API key on your server. Create one MindBill organization for each customer with a stable, opaque <code>externalId</code> from your tenant database. Provisioning is automatic and returns an organization immediately; its initial <code>configuring</code> status is separate from readiness to submit live claims. Store the returned <code>organizationId</code> with the tenant.</p>
    <CodeBlock code={provision} language="bash" filename="Provision a customer" />
    <p>For each server request, authenticate your user, resolve the tenant from server-owned membership data, then send its saved ID in <code>X-MindBill-Org-Id</code>. An account key cannot use an organization outside its account. Use an organization-scoped key if a dedicated service should be confined to one customer. For React components, your server mints a short-lived browser session for that organization and the user&apos;s allowed actions; the browser token stays bound to that organization. See the <Link href="/guides/organizations">customer organization guide</Link> for a complete session route.</p>
    <Callout tone="warning" title="Never let the browser select a tenant">Do not accept an unchecked organization ID or role from a browser request. The organization header selects a customer for an authorized account key; it does not replace your own user-to-tenant authorization.</Callout>

    <h2 id="bills">Submit bills across states</h2>
    <p>The same <Link href="/api-reference/create-bill">bill creation API</Link> accepts workers&apos; compensation medical-legal and professional treatment bills on CMS-1500 for claims in all 50 states. Set <code>claim.injuryState</code> to the claim&apos;s actual two-letter state, and use <code>billingMode</code> for the bill type. UB-04, ADA, and NCPDP formats are currently limited to California. California OMFS fee calculation applies only when its jurisdiction and service context match; a different injury state does not invoke California-specific fee rules.</p>
    <p><Link href="/api-reference/claims-administrators">Search the claims-administrator directory</Link> and select an available payer and delivery route before submission. An accepted state code alone does not establish that every payer and delivery method is available. Check the returned payer choices for the actual claim and contact MindBill if the needed route is missing.</p>
    <p>To submit CMS-1500 professional treatment bills with your own pricing, set <code>bill.billingMode</code> to <code>professional</code> and <code>bill.pricingMode</code> to <code>manual</code> in the atomic create-and-submit request. Supply an explicit <code>serviceLines[].charge</code> on every line and omit <code>feeContext</code>. The charge is the extended billed amount, not the payer&apos;s allowed amount. Manual mode skips the ordinary fee quote; specialized anesthesia and pharmacy lines still require the supported calculation workflow and can be rejected. The default <code>automatic</code> mode runs applicable schedule checks. Keep your own allowance estimate in your system; the bill API&apos;s <code>pricing.expectedAmount</code> is MindBill&apos;s separate estimate when available.</p>
    <p>An organization-wide integration may reference that organization&apos;s saved billing provider with <code>billingProvider.savedProviderId</code> instead of resending its full profile. Customer-scoped and bill-scoped credentials cannot use shared saved providers, and IDs cannot cross organization boundaries. See the <Link href="/guides/bills#pricing">pricing fields</Link>, <Link href="/guides/practice-settings">provider settings</Link>, and <Link href="/api-reference/create-bill">full request schema</Link>.</p>

    <h2 id="remittance">Read EORs and payments</h2>
    <p>Use <code>GET /partner/v2/bills/&#123;billId&#125;/eor</code> after the payer issues an Explanation of Review (EOR). It returns available line-level billed, allowed, and payment-advice amounts; CARC adjustments and RARC remark codes; the payer claim-control number; and an authorized source EOR document when retained. The payer&apos;s <code>reportedPaid</code> advice is separate from <code>paid</code> amounts confirmed in the bill&apos;s payment ledger. Read bill status, <code>totalPaid</code>, and <code>balanceDue</code> for posted cash and balance. Raw X12 835 download is unavailable because a source transmission may contain claims from multiple organizations. Some payer fields or source documents can be absent. See the <Link href="/api-reference/bill-eor">EOR response</Link> and <Link href="/guides/lifecycle">lifecycle guide</Link>.</p>
    <p>MindBill records the payer&apos;s remittance and payment information for tracking. The payer pays the provider; MindBill does not receive or disburse the claim payment.</p>

    <h2 id="events">Synchronize status and payments</h2>
    <p>Consume <Link href="/api-reference/events">signed webhooks</Link> for changes, verify each signature over the raw request body, and deduplicate by event ID. A webhook tells you to reconcile the current bill or EOR state. Delivery is at least once and can arrive out of order, so do not derive balances solely from callback order. MindBill retries failed deliveries up to ten attempts with increasing delays from 30 seconds to one hour. The organization&apos;s <code>GET /partner/v2/events</code> cursor stream lets you catch up after a receiver outage.</p>
    <p>Create an account-wide webhook endpoint to receive all organizations through one receiver, or set <code>organizationId</code> on an endpoint to deliver only that customer&apos;s events. The signed event envelope carries <code>organizationId</code> so a shared receiver can route to its tenant. Keep endpoint secrets server-side, return a success response only after durable receipt, and use <Link href="/api-reference/webhook-deliveries">webhook delivery history</Link> to investigate failures.</p>
    <CodeBlock code={scopedWebhook} language="bash" filename="Create an organization webhook endpoint" />
    <p>This endpoint requires an account-scoped key with <code>account:write</code>. Use your actual organization ID and public HTTPS receiver; omit <code>organizationId</code> to receive account-wide events.</p>

    <h2 id="commercial">Go live and reconcile usage</h2>
    <p>Accept the Business Associate Agreement (BAA) and configure billing once for the partner account. Your customer organizations do not each sign a separate MindBill BAA. Live access also depends on the account&apos;s approval and each selected organization&apos;s operational readiness. Check its returned status and required billing/provider settings before live submission. See the <Link href="/guides/sandbox#live">live access checklist</Link>.</p>
    <p>The partner account has one Stripe customer and subscription for live usage across its organizations. Use an account-scoped key with <code>account:read</code> to retrieve the current UTC month&apos;s organization breakdown:</p>
    <CodeBlock code={usage} language="bash" filename="Read account and organization usage" />
    <p><code>organizationBreakdown[]</code> contains <code>organizationId</code>, <code>organizationName</code>, <code>submittedBills</code>, and <code>usageAmountCents</code>. It counts live <code>bill_submitted</code> usage and shows gross usage before credits and invoice taxes. Keep this as an operational breakdown, not a substitute for the final Stripe invoice. Organization-fixed keys cannot read account-wide usage.</p>
  </DocPage>;
}
