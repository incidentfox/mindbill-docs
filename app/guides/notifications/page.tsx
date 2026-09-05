import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { notificationRecipe } from "@/lib/integration-recipes";

export const metadata: Metadata = { title: "Notification emails" };

const enrollment = `# Your authenticated SERVER calls this, never the browser.
PUT https://app.mindbill.org/partner/v2/notifications/recipients/doctor_42
Authorization: Bearer <server-only-partner-key-with-orgs:write>
X-MindBill-Org-Id: <server-resolved-managed-organization>
Content-Type: application/json

{
  "enabled": true,
  "email": "doctor@example.test",
  "audience": "assigned_bills",
  "statusUpdates": true,
  "agingDays": [30, 60, 90],
  "quietHours": true,
  "consent": {
    "grantedAt": "<actual-server-recorded-ISO-consent-time>",
    "emailVerifiedAt": "<actual-server-recorded-ISO-verification-time>",
    "version": "billing-alerts-v1"
  }
}`;

export default function NotificationsPage() {
  return <DocPage eyebrow="Build" title="Send useful billing notifications" description="Support users who never sign into the MindBill console, without turning a contact list into an email subscription."
    toc={[{ id: "ownership", label: "Choose ownership" }, { id: "enroll", label: "Enroll from your server" }, { id: "revoke", label: "Consent and unsubscribe" }, { id: "verify", label: "Verify safely" }]}>
    <Callout title="Activation required">The external-recipient API requires a separately enabled MindBill feature. Check availability with GET before offering enrollment. An installed component, successful build, or contact suggestion does not mean automatic email delivery is active.</Callout>
    <h2 id="ownership">Choose who routes the alerts</h2>
    <p><strong>Doctor-specific alerts:</strong> MindBill can send notifications without a console account or a partner-built webhook notification service. Choose <code>{'audience: "assigned_bills"'}</code> and use your trusted server to associate each recipient with the bills they can access. Never infer access from a provider NPI or accept an unchecked browser-supplied association.</p>
    <p><strong>Practice-wide alerts:</strong> choose <code>{'audience: "practice"'}</code> only for users authorized to receive updates about every bill in the managed practice. Always choose the audience explicitly when enrolling a restricted doctor.</p>
    <p><strong>Custom content or delivery:</strong> you can still consume <Link href="/api-reference/events">signed webhooks</Link> and route notifications yourself. Verify raw-body signatures, deduplicate event IDs, tolerate retries and out-of-order delivery, and reconcile current bill state before notifying.</p>
    <p><strong>Courtesy copies:</strong> passing recipient options only supplies suggestions for a user-initiated bill email. It neither selects recipients automatically nor subscribes anyone to future notifications.</p>
    <h2 id="enroll">Enroll from your trusted server</h2>
    <p>Use <code>GET</code>, <code>PUT</code>, and <code>DELETE /partner/v2/notifications/recipients/&#123;externalUserId&#125;</code> with a server API key granting <code>orgs:write</code> and <code>X-MindBill-Org-Id</code> selecting a partner-managed organization. Browser sessions are not accepted. IDs and preferences are scoped by partner, organization, and sandbox/live environment.</p>
    <p>The external user ID must be stable and opaque: 1–128 letters, digits, underscores or hyphens. Do not use an email address, patient name, or other sensitive identifier. GET returns feature availability and preferences/eligibility; absent preferences are null.</p>
    <p>Before PUT, your server must authenticate the user, resolve their authorized audience, verify ownership of their email address, and record explicit consent for billing alerts. Do not trust a request-body email, organization, or verification timestamp. New consent must be within 24 hours, not in the future, and after verification.</p>
    <CodeBlock code={enrollment} language="http" filename="Server contract — replace placeholders with verified records" />
    <p>For <code>assigned_bills</code>, call <code>PUT /partner/v2/notifications/recipients/&#123;externalUserId&#125;/bills/&#123;billId&#125;</code> from the same trusted server to associate a bill. Call DELETE on that association when access ends. The bill must belong to the selected partner, organization, and environment. Recipient GET includes assigned bill IDs so you can reconcile host permissions. Adding an association does not enroll a recipient or bypass verified consent.</p>
    <h2 id="revoke">Preserve consent and make stopping easy</h2>
    <p>Identical retries preserve the original consent boundary, including after 24 hours. Changing email, audience, or notification categories needs fresh explicit consent; changing email also needs fresh verification. Invalid updates leave the previous preference unchanged.</p>
    <p>DELETE revokes the subscription and cancels pending delivery. A consent tombstone prevents old PUT retries from silently re-enrolling someone. Call DELETE when the user loses access or leaves your app: MindBill cannot independently observe partner-only account deactivation.</p>
    <p>Bill-specific access is checked when work is queued and again before delivery. Removing an association suppresses pending notifications for that bill. Your server must keep these assignments current when case access changes; billing components do not grant email access.</p>
    <p>An empty assignment list sends nothing. Associate existing authorized bills after opt-in and new bills as part of your trusted creation workflow. Repeating an association PUT preserves its start time. Status events and aging milestones before assignment are not replayed; reassigning a bill does not backfill the removed-access period. Changing audience clears prior bill assignments and pending mail.</p>
    <p>Every external notification includes an account-free unsubscribe link. Opening the link is read-only; the recipient confirms with a button, so email scanners do not unsubscribe users. Delivery already in flight may still arrive.</p>
    <h2 id="verify">Verify without sending real customer mail</h2>
    <p>Sandbox creates preview ledger entries and never sends email. Test explicit opt-in, duplicate requests, email changes, revocation, stale retries, cross-tenant denial, and unavailable-feature handling before enabling live delivery. MindBill does not backfill consent or automatically enroll your users.</p>
    <CodeBlock code={notificationRecipe} language="text" filename="Notification implementation brief" />
    <p><Link href="/learn/quickstart">Back to the full integration quickstart →</Link></p>
  </DocPage>;
}
