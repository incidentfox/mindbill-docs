import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Partner upgrade guide" };

const brief = `Upgrade the existing MindBill integration; preserve host authentication and saved data.
1. Update @mindbill/react to 0.62.0 and any directly installed @mindbill/browser to 0.38.0.
   Update the lockfile and rebuild the app.
   Keep ConnectedBillLifecycle / ConnectedBillingWorkspace; remove any nonexistent styles.css import.
2. ConnectedBillingWorkspace and BillingDashboard include Settings by default in React 0.64.0.
   Set showSettings=false to hide it. Pass billingSettings for a dedicated administrator
   session, or reuse an authorized main session. The server still requires organization:manage.
   Standalone BillingSettings remains available. Connected submission
   forms automatically read choices with organization-wide bills:create when
   profileOptions is omitted. Explicit profileOptions override/suppress that lookup.
   Pass billingSettings only for administrators to enable the prebuilt Add/edit flow.
   Mount NotificationRecipientsSettings for administrator-managed email invitations;
   use NotificationSettings for a signed-in person's own preferences.
3. Wire notification widgets to authenticated, CSRF-protected host-server adapters:
   https://docs.mindbill.org/guides/notifications
   Forward reportDigest (off | daily | weekly) and return it in preference snapshots.
   Keep all mail off until the recipient explicitly confirms. Synchronize assigned-bill
   access on your server; use practice-wide scope only for authorized recipients.
4. For enabled treatment organizations, use professional billingMode and review each
   line's diagnosisPointers and explicit total charge. Mount RfaDashboard with a separate
   RFA session endpoint, role-matched permissions, actorReference, and environment.
   Its native flow handles signing, packet review and explicit fax sending.
5. Verify sandbox scrolling, selecting historical bill details, one current status,
   saved-profile selection, authored notes, W-9 inclusion, and notification consent/unsubscribe. Do not send live bills.
No host database migration is required just to upgrade packages. Explain any optional
storage/auth changes before making them. Never put permanent API keys in the browser.`;

export default function UpgradePage() {
  return <DocPage eyebrow="Start here" title="Upgrade an existing integration" description="A short checklist for existing MindBill integrations."
    toc={[{ id: "packages", label: "Update packages" }, { id: "optional", label: "Optional settings" }, { id: "agent", label: "Copy for your agent" }]}>
    <h2 id="packages">Update packages, keep your integration</h2>
    <p>Update <code>@mindbill/react</code> to <code>0.62.0</code> and any directly installed <code>@mindbill/browser</code> to <code>0.38.0</code>, update your lockfile, and rebuild your app. Existing <code>ConnectedBillLifecycle</code> and <code>ConnectedBillingWorkspace</code> imports stay the same.</p>
    <p>Connected submission forms now load saved billing providers, rendering providers, and service locations automatically when profileOptions is omitted. Existing case values remain unchanged until the user selects a profile. Explicit profileOptions, including an empty object, override the automatic lookup.</p>
    <h2 id="optional">Configure the built-in Settings tab</h2>
    <p>React 0.64.0 adds Settings to <code>ConnectedBillingWorkspace</code> and <code>BillingDashboard</code> by default. Set <code>{"showSettings={false}"}</code> to hide the tab. Use <code>billingSettings</code> for a separate administrator-authorized session, or reuse the workspace session when it already has <code>organization:manage</code>. Without an override, <code>BillingDashboard</code> uses <code>/api/mindbill/session</code>. No permissions are added automatically. The workspace accepts <code>initialView=&quot;settings&quot;</code>; both dashboards support <code>onSettingsSaved(profile)</code> for refreshing host state.</p>
    <p>If your app needs a separate settings page, mount <Link href="/components/react#saved-profiles"><code>BillingSettings</code></Link> for saved billing profiles, and pass a separate administrator-authorized <code>billingSettings</code> configuration to submission forms for the Add/edit flow. For email invitations, add <Link href="/guides/notifications"><code>NotificationRecipientsSettings</code> and its trusted server adapter</Link>. Existing notification adapters must forward <code>reportDigest</code> and return it in snapshots to support daily/weekly digests. Notification settings and submission-form Add/edit controls remain optional additions; the dashboard Settings tab appears automatically.</p>
    <p>Email stays off until the recipient confirms. Assigned-bill recipients also need server-managed bill assignments; entering an email address alone does not grant access. For enabled treatment organizations, use the <Link href="/learn/treatment-quickstart">treatment quickstart</Link> and <Link href="/guides/rfas">RfaDashboard guide</Link>. The dashboard includes signing, packet review, and explicit fax sending. Configure permissions and a stable human signer identity from host authorization; sandbox disables delivery.</p>
    <p>Server-side validation, routing, and available backend data can improve without a host package change. New React controls require a package update and host rebuild. Keep the integration on the canonical API and refresh authoritative server state instead of hardcoding statuses, fees, or payer destinations.</p>
    <h2 id="agent">Copy for your coding agent</h2>
    <CodeBlock code={brief} language="text" filename="Existing integration upgrade brief" />
    <p>Starting from scratch? <Link href="/learn/quickstart">Choose your stack and open the full quickstart in your editor →</Link></p>
  </DocPage>;
}
