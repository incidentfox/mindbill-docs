import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { notificationRecipe } from "@/lib/integration-recipes";
import { notificationSettingsReact, notificationSettingsServer } from "@/lib/notification-settings-recipes";
import { notificationInvitationHttp, notificationRecipientsReact } from "@/lib/notification-recipient-recipes";

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
    toc={[{ id: "ownership", label: "Choose ownership" }, { id: "recipients", label: "Invite any email address" }, { id: "invitation-api", label: "Invitation server adapter" }, { id: "widget", label: "Personal preferences" }, { id: "host", label: "Personal server adapter" }, { id: "enroll", label: "Verified-user API" }, { id: "revoke", label: "Consent and unsubscribe" }, { id: "verify", label: "Verify safely" }]}>
    <Callout title="Activation required">The external-recipient API requires a separately enabled MindBill feature. Check availability with GET before offering enrollment. An installed component, successful build, or contact suggestion does not mean automatic email delivery is active.</Callout>
    <p>These settings are available to every partner, not just Docura. Notifications are <strong>off by default</strong>; loading a widget or saving a billing profile never opts someone in. Angular and API-only integrations can use the same server contract with their own settings UI.</p>
    <h2 id="ownership">Choose who routes the alerts</h2>
    <p><strong>Doctor-specific alerts:</strong> MindBill can send notifications without a console account or a partner-built webhook notification service. Choose <code>{'audience: "assigned_bills"'}</code> and use your trusted server to associate each recipient with the bills they can access. Never infer access from a provider NPI or accept an unchecked browser-supplied association.</p>
    <p><strong>Practice-wide alerts:</strong> choose <code>{'audience: "practice"'}</code> only for users authorized to receive updates about every bill in the managed practice. Always choose the audience explicitly when enrolling a restricted doctor.</p>
    <p><strong>Custom content or delivery:</strong> you can still consume <Link href="/api-reference/events">signed webhooks</Link> and route notifications yourself. Verify raw-body signatures, deduplicate event IDs, tolerate retries and out-of-order delivery, and reconcile current bill state before notifying.</p>
    <p><strong>Courtesy copies:</strong> passing recipient options only supplies suggestions for a user-initiated bill email. It neither selects recipients automatically nor subscribes anyone to future notifications.</p>
    <h2 id="recipients">Invite any email address</h2>
    <p>From <code>@mindbill/react@0.51.0</code>, add <code>NotificationRecipientsSettings</code> (alias <code>ConnectedNotificationRecipientsSettings</code>) to your administrator&apos;s billing settings. Enter any authorized email address, choose practice-wide or assigned-bill alerts, and send an invitation. The recipient needs no MindBill console account or account in your app.</p>
    <Callout title="An invitation is not consent">Notifications remain off until the email owner follows the 48-hour invitation link, reviews the destination, practice scope, categories and quiet hours, and explicitly confirms. Opening the link alone does not enable delivery. An administrator cannot opt someone else in.</Callout>
    <p>This covers bill-status and payment alerts, plus 30/60/90-day aging reminders. It does <strong>not</strong> schedule financial report digests or send patient reports or attachments. Each alert includes an unsubscribe link.</p>
    <CodeBlock code={notificationRecipientsReact} filename="components/BillingRecipients.tsx" />
    <p>The widget starts with assigned bills, no categories selected, and quiet hours from 7 pm to 7 am Pacific. It shows pending invitations as off, lists existing recipient states, and supports disabling a subscription. Pass <code>appearance</code>, <code>className</code> and <code>style</code> to match your app. Keep the adapter memoized and change <code>identityKey</code> for a different administrator, practice or environment; this is a UI reset key, not authorization.</p>
    <h2 id="invitation-api">Connect your trusted invitation adapter</h2>
    <p>Authenticate the administrator, authorize the managed practice and each recipient operation, and enforce same-origin and CSRF checks. Resolve the organization, sandbox/live environment and permanent API key from trusted server state. Use <code>orgs:write</code> and <code>X-MindBill-Org-Id</code>; browser session tokens cannot call these routes. Return <code>Cache-Control: no-store</code> and sanitized errors, and never log email addresses or request/response bodies.</p>
    <div className="term-list compact">
      <div><b><code>load(offset)</code></b><p><code>GET /partner/v2/notifications/recipients?offset=0</code></p></div>
      <div><b><code>invite(input)</code></b><p><code>POST /partner/v2/notifications/recipients/&#123;externalUserId&#125;/invitations</code></p></div>
      <div><b><code>disable(externalUserId)</code></b><p><code>DELETE /partner/v2/notifications/recipients/&#123;externalUserId&#125;</code></p></div>
      <div><b>Synchronize trusted bill access</b><p><code>PUT / DELETE /partner/v2/notifications/recipients/&#123;externalUserId&#125;/bills/&#123;billId&#125;</code></p></div>
    </div>
    <p>Unwrap the API&apos;s <code>data</code> field in your host response. List data contains <code>available</code>, <code>environment</code>, <code>recipients</code> and <code>hasMore</code>, with 100 recipients per page. When unavailable, show that invitations cannot be sent; existing subscriptions can still be disabled. Reloading the list never sends email.</p>
    <CodeBlock code={notificationInvitationHttp} language="http" filename="Server invitation contract" />
    <p>Strictly allowlist the six invitation fields shown above, validate them, authorize the requested audience and forward them unchanged. Preserve the widget&apos;s UUID <code>requestId</code> on identical retries, including uncertain network failures. Your server resolves a stable opaque external recipient ID within the practice and environment; do not put the email in the URL. Reuse an existing private recipient directory or doctor ID. If none exists, a private keyed mapping of practice, environment and normalized email can avoid a new database migration; retain that mapping across key rotation and revoke the old recipient before changing its address.</p>
    <p><code>practice</code> covers current and future bills in the authorized practice. <code>assigned_bills</code> requires explicit server-owned bill associations and sends nothing when the assignment list is empty. Synchronize those associations from host access rules during setup, bill creation and access changes; never accept unchecked browser bill IDs or infer permission from an NPI. Assigning a bill grants neither consent nor access to your application.</p>
    <Callout title="Report invitation delivery accurately">POST returns <code>deliveryStatus</code>: <code>sent</code>, <code>sending</code>, <code>unknown</code>, <code>suppressed</code> or <code>sandbox_preview</code>. Even <code>sent</code> means only transport acknowledgment, not reading or consent. Do not automatically resend an unknown outcome or retry a rate limit in a loop. Reusing a request ID with different input returns 409; require a deliberate new request instead.</Callout>
    <p>A new invitation disables an existing subscription until reconfirmed. Changing email or audience clears prior bill assignments: explicitly resynchronize authorized assignments. Unsubscribe and administrator disable revoke old invitation links, including already-consumed ones. Expired invitations require a deliberate new invitation with a new UUID; do not renew consent in a background job.</p>
    <p>Sandbox sends neither invitation nor alert email. A sandbox response may contain a capability-bearing <code>previewUrl</code>; strip it from ordinary host responses unless you implement a purpose-built, private preview. Never log or publish it. Live responses do not return a confirmation URL. The developer console uses its own owner/admin session routes; partner apps should use the server-key routes above.</p>
    <h2 id="widget">Configure a signed-in person&apos;s own preferences</h2>
    <p>Place <code>NotificationSettings</code> (also exported as <code>ConnectedNotificationSettings</code>) on your existing settings page. Its adapter calls your authenticated host server, never the administrative Partner API directly. The component handles loading, save errors, default-off preferences, fresh consent, and unsubscribe. Requires <code>@mindbill/react</code> 0.49.0 or later; upgrade older installations first.</p>
    <CodeBlock code={notificationSettingsReact} filename="components/BillingNotificationSettings.tsx" />
    <p>Keep the adapter stable with <code>useMemo</code>. Change <code>identityKey</code> when the host user, practice, or environment changes so stale requests cannot replace the next account&apos;s settings. This key is only a UI reset key, not authorization. Pass <code>appearance</code>, <code>className</code>, and <code>style</code> to match your product. <code>onSaved(snapshot)</code> can refresh your own settings summary.</p>
    <p>The adapter returns <code>NotificationSettingsSnapshot</code>: <code>preferences</code> (null or enabled/statusUpdates/agingDays/quietHours), a display-only <code>email</code>, server-authorized <code>audience</code>, <code>environment</code>, and <code>canEnable</code>. The widget sends only those preference fields plus a <code>consent</code> boolean. It never supplies identity, verification proof, an audience grant, or bill assignments. All changed enabled settings, including quiet hours, require fresh explicit consent.</p>
    <Callout title="Read after every write">Use GET → PUT or DELETE → GET. Administrative PUT/DELETE responses are acknowledgments, not snapshots; reload and project the GET response before reporting success. If that reload fails, show an unconfirmed change and let the user reload. GET availability is not proof that an assigned recipient currently has eligible bills.</Callout>
    <h2 id="host">Connect your existing authenticated server</h2>
    <p>This Next.js route is a copyable adapter template. Implement the four application-owned helpers below using your current authentication, permissions, CSRF, and audit facilities; they are <strong>not MindBill exports</strong>. Until these checks exist, fail closed. Express, FastAPI, and other servers should implement the same contract; do not create a new user database just for this widget.</p>
    <CodeBlock code={notificationSettingsServer} filename="app/api/mindbill/notification-settings/route.ts" />
    <ul>
      <li><code>requireNotificationAccess(request)</code> must authenticate the host session and resolve a stable opaque externalUserId, active managed orgId, authorized audience, current email, actual emailVerifiedAt, environment, canEnable, and that environment&apos;s serverApiKey. Practice-wide access requires permission to every bill. Never derive these from unchecked JSON, URL parameters, or a caller-selected organization header. Fail unauthorized requests with a safe 401/403 response.</li>
      <li><code>assertHostCsrf(request, access)</code> must validate your session-bound CSRF token for PUT/DELETE, in addition to matching the configured exact <code>APP_ORIGIN</code>. Do not treat the example header name alone as protection.</li>
      <li><code>recordExplicitNotificationConsent(access, update, requestId)</code> must persist the actual confirmation and consent wording/version, bound to this authenticated user, practice, environment, verified address, authorized audience, and exact preferences. Return its server-recorded grantedAt/version. Atomically reuse the receipt for an identical request ID; reject reuse with different identity or preferences. The request ID deduplicates retries, but is not proof of identity or consent. Do not mint fresh consent while retrying a job. After a 409, request a new user confirmation. Verification must precede consent; changed addresses need fresh verification. Existing audit storage is fine.</li>
      <li><code>syncAuthorizedBillAssignments(access)</code> must reconcile the GET response&apos;s assignedBillIds against your trusted host bill-access records: DELETE removed assignments first, then PUT authorized missing assignments. Never take that list from this widget. Preserve unchanged assignments and their original start times. Retry failed sync durably and do not claim an empty or partially synced audience is fully configured.</li>
    </ul>
    <p>Keep assignments synchronized when case permissions change and after creating a new authorized bill, not only when saving preferences. Revoke with DELETE when membership ends or the verified email or authorized audience changes; then obtain the appropriate new verification/consent before re-enrollment. A GET settings read must not grant access or silently renew consent. Also revoke stale deliveries when host access changes—the upstream service cannot discover those changes for you.</p>
    <p>The server key needs <code>orgs:write</code> and stays in your secret store. Do not use a browser submission session here. Return only the UI projection, not administrative assignment IDs, consent records, or credentials. Use no-store responses and sanitized errors; do not log email addresses or request/response bodies.</p>
    <h2 id="enroll">Enroll from your trusted server</h2>
    <p>Use <code>GET</code>, <code>PUT</code>, and <code>DELETE /partner/v2/notifications/recipients/&#123;externalUserId&#125;</code> with a server API key granting <code>orgs:write</code> and <code>X-MindBill-Org-Id</code> selecting a partner-managed organization. Browser sessions are not accepted. IDs and preferences are scoped by partner, organization, and sandbox/live environment.</p>
    <p>The external user ID must be stable and opaque: 1–128 letters, digits, underscores or hyphens. Do not use an email address, patient name, or other sensitive identifier. GET returns feature availability and preferences/eligibility; absent preferences are null.</p>
    <p>Before PUT, your server must authenticate the user, resolve their authorized audience, verify ownership of their email address, and record explicit consent for billing alerts. Do not trust a request-body email, organization, or verification timestamp. New consent must be within 24 hours, not in the future, and after verification.</p>
    <CodeBlock code={enrollment} language="http" filename="Server contract — replace placeholders with verified records" />
    <p>For <code>assigned_bills</code>, call <code>PUT /partner/v2/notifications/recipients/&#123;externalUserId&#125;/bills/&#123;billId&#125;</code> from the same trusted server to associate a bill. Call DELETE on that association when access ends. The bill must belong to the selected partner, organization, and environment. Recipient GET includes assigned bill IDs so you can reconcile host permissions. Adding an association does not enroll a recipient or bypass verified consent.</p>
    <h2 id="revoke">Preserve consent and make stopping easy</h2>
    <p>Identical retries preserve the original consent boundary, including after 24 hours. Any changed enabled PUT—including email, audience, categories, or quiet hours—needs fresh explicit consent; changing email also needs fresh verification. Invalid updates leave the previous preference unchanged.</p>
    <p>DELETE revokes the subscription and cancels pending delivery. A consent tombstone prevents old PUT retries from silently re-enrolling someone. Call DELETE when the user loses access or leaves your app: MindBill cannot independently observe partner-only account deactivation.</p>
    <p>Bill-specific access is checked when work is queued and again before delivery. Removing an association suppresses pending notifications for that bill. Your server must keep these assignments current when case access changes; billing components do not grant email access.</p>
    <p>An empty assignment list sends nothing. Associate existing authorized bills after opt-in and new bills as part of your trusted creation workflow. Repeating an association PUT preserves its start time. Status events and aging milestones before assignment are not replayed; reassigning a bill does not backfill the removed-access period. Changing audience clears prior bill assignments and pending mail.</p>
    <p>Every external notification includes an account-free unsubscribe link. Opening the link is read-only; the recipient confirms with a button, so email scanners do not unsubscribe users. Delivery already in flight may still arrive.</p>
    <h2 id="verify">Verify without sending real customer mail</h2>
    <p>Sandbox creates preview ledger entries and never sends email. Test explicit opt-in, duplicate requests, email changes, revocation, stale retries, cross-tenant denial, and unavailable-feature handling before enabling live delivery. MindBill does not backfill consent or automatically enroll your users.</p>
    <CodeBlock code={notificationRecipe} language="text" filename="Notification implementation brief" />
    <p><Link href="/learn/quickstart">Back to the quickstart →</Link></p>
  </DocPage>;
}
