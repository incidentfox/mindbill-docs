import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Partner upgrade guide" };

const brief = `Upgrade the existing MindBill integration; preserve host authentication and saved data.
1. Update @mindbill/react to 0.52.0 and any directly installed @mindbill/browser to 0.30.0.
   Update the lockfile and rebuild the app.
   Keep the existing CSS import and ConnectedBillLifecycle / ConnectedBillingWorkspace.
2. Optional settings: mount BillingSettings for saved providers, locations and W-9s.
   Mount NotificationRecipientsSettings for administrator-managed email invitations;
   use NotificationSettings for a signed-in person's own preferences.
3. Wire notification widgets to authenticated, CSRF-protected host-server adapters:
   https://docs.mindbill.org/guides/notifications
   Forward reportDigest (off | daily | weekly) and return it in preference snapshots.
   Keep all mail off until the recipient explicitly confirms. Synchronize assigned-bill
   access on your server; use practice-wide scope only for authorized recipients.
4. Verify sandbox scrolling, selecting historical bill details, one current status,
   saved-profile prefill and notification consent/unsubscribe. Do not send live bills.
No host database migration is required just to upgrade packages. Explain any optional
storage/auth changes before making them. Never put permanent API keys in the browser.`;

export default function UpgradePage() {
  return <DocPage eyebrow="Start here" title="Upgrade an existing integration" description="A short checklist for existing MindBill integrations."
    toc={[{ id: "packages", label: "Update packages" }, { id: "optional", label: "Optional settings" }, { id: "agent", label: "Copy for your agent" }]}>
    <h2 id="packages">Update packages, keep your integration</h2>
    <p>Update <code>@mindbill/react</code> to <code>0.52.0</code> and any directly installed <code>@mindbill/browser</code> to <code>0.30.0</code>, update your lockfile, and rebuild your app. Existing <code>ConnectedBillLifecycle</code> and <code>ConnectedBillingWorkspace</code> imports stay the same.</p>
    <p>The existing components pick up scrolling and theme fixes, a consistent current status, historical submission details, corrected units/modifiers, and shared bill interactions. You do not need to rebuild those screens.</p>
    <h2 id="optional">New settings need a place in your app</h2>
    <p>If not already mounted, add <Link href="/components/react#saved-profiles"><code>BillingSettings</code></Link> for saved billing profiles. For email invitations, add <Link href="/guides/notifications"><code>NotificationRecipientsSettings</code> and its trusted server adapter</Link>. Existing notification adapters must forward <code>reportDigest</code> and return it in snapshots to support daily/weekly digests. These are optional additions, not automatic effects of a package bump.</p>
    <p>Email stays off until the recipient confirms. Assigned-bill recipients also need server-managed bill assignments; entering an email address alone does not grant access. This upgrade covers med-legal billing; treatment/RFA work is separate.</p>
    <h2 id="agent">Copy for your coding agent</h2>
    <CodeBlock code={brief} language="text" filename="Existing integration upgrade brief" />
    <p>Starting from scratch? <Link href="/learn/quickstart">Choose your stack and open the full quickstart in your editor →</Link></p>
  </DocPage>;
}
