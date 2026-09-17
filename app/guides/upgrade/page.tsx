import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Partner upgrade guide" };

const brief = `Upgrade the existing MindBill integration; preserve host authentication and saved data.
1. Update @mindbill/react to 0.69.6 and any directly installed @mindbill/browser to 0.43.4.
   Update the lockfile and rebuild the app.
   Keep ConnectedBillLifecycle / ConnectedBillingWorkspace; remove any nonexistent styles.css import.
2. ConnectedBillingWorkspace and BillingDashboard include Settings by default in React 0.64.0.
   Set showSettings=false to hide it. Pass billingSettings for a dedicated administrator
   session, or reuse an authorized main session. The server still requires organization:manage.
   React 0.65.0 adds Billing profiles, Claims administrators, and Team sections.
   Team edits existing MindBill accounts only, with separately authorized team:manage
   backed by orgs:team:write. It does not invite users or change host-app roles.
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
   React 0.69.2 adds documented anesthesia medical-direction and monitored-care inputs.
   Derive treatmentBilling from authorized organization access. Use actual case records;
   keep anesthesia quantity at 1, forward feeContext, and retain server review outcomes.
   React 0.69.4 collects actual therapy service details for 97110. Preserve supplied
   therapyContext and hasFeeAgreement; incomplete facts must not generate an estimate.
   Include all same-day services. Additional therapy rows and unsupported facts remain review.
   React 0.69.6 adds technical MRI service facts to FeeScheduleCalculator; existing imaging sessions and interpretation location remain available.
   Include the full encounter; preserve explicit incomplete host context and server review outcomes.
5. Use the bill registry search for words across bill, patient, claim, administrator,
   status, procedure, and date fields. Search/Enter applies connected text/date filters;
   dateField=service|submitted and from/to are inclusive ISO dates.
   Patient, rendering-provider, and claims-administrator filters use canonical IDs.
   Workspace detail links select that entity and clear previous filters by default;
   optional host callbacks can replace this behavior.
   Report autofill is opt-in and requires operator-enabled organization access.
   Review extracted suggestions before applying; uploads do not attach or submit bills.
6. Verify sandbox scrolling, selecting historical bill details, one current status,
   saved-profile selection, authored notes, W-9 inclusion, and notification consent/unsubscribe. Do not send live bills.
No host database migration is required just to upgrade packages. Explain any optional
storage/auth changes before making them. Never put permanent API keys in the browser.`;

export default function UpgradePage() {
  return <DocPage eyebrow="Start here" title="Upgrade an existing integration" description="A short checklist for existing MindBill integrations."
    toc={[{ id: "packages", label: "Update packages" }, { id: "optional", label: "Optional settings" }, { id: "agent", label: "Copy for your agent" }]}>
    <h2 id="packages">Update packages, keep your integration</h2>
    <p>Update <code>@mindbill/react</code> to <code>0.69.6</code> and any directly installed <code>@mindbill/browser</code> to <code>0.43.4</code>, update your lockfile, and rebuild your app. Existing <code>ConnectedBillLifecycle</code> and <code>ConnectedBillingWorkspace</code> imports stay the same.</p>
    <p>Connected submission forms now load saved billing providers, rendering providers, and service locations automatically when profileOptions is omitted. Existing case values remain unchanged until the user selects a profile. Explicit profileOptions, including an empty object, override the automatic lookup.</p>
    <h2 id="optional">Configure the built-in Settings tab</h2>
    <p>React 0.64.0 adds Settings to <code>ConnectedBillingWorkspace</code> and <code>BillingDashboard</code> by default. Set <code>{"showSettings={false}"}</code> to hide the tab. Use <code>billingSettings</code> for a separate administrator-authorized session, or reuse the workspace session when it already has <code>organization:manage</code>. Without an override, <code>BillingDashboard</code> uses <code>/api/mindbill/session</code>. No permissions are added automatically. The workspace accepts <code>initialView=&quot;settings&quot;</code>; both dashboards support <code>onSettingsSaved(profile)</code> for refreshing host state.</p>
    <p>React 0.65.0 adds Billing profiles, Claims administrators, and Team inside settings. Team edits existing MindBill login accounts and needs explicitly delegated <code>team:manage</code>, backed by <code>orgs:team:write</code>; it does not provision host users. Bill search now matches every word across identifiers, people, administrators, statuses, procedure codes, and dates. Service-date and submission-date ranges are inclusive. See <Link href="/guides/practice-settings#team">settings access</Link> and <Link href="/components/react#operations">search behavior</Link>.</p>
    <p>React 0.66.0 adds native RFA draft editing, receipt and information-request recording, item decisions, and existing follow-up task updates. Grant <code>act</code> only to authorized dashboard roles; it is separate from fax <code>send</code>. It also exports shared bill-detail layout and validation sections. See the <Link href="/guides/rfas">RFA guide</Link> and <Link href="/components/react#lifecycle">bill-detail components</Link>.</p>
    <p>React 0.67.0 adds canonical patient, rendering-provider, and claims-administrator filters and default related-bill navigation in the connected workspace. Editable current incomplete, draft, and rejected bills show field-validation sections automatically; explicit <code>validationIssues</code> remain an override. Optional <Link href="/guides/report-autofill">report autofill</Link> extracts suggestions for human review. It requires operator-enabled organization access and a separately authorized session; upgrading the package does not enable it.</p>
    <p>If your app needs a separate settings page, mount <Link href="/components/react#saved-profiles"><code>BillingSettings</code></Link> for saved billing profiles, and pass a separate administrator-authorized <code>billingSettings</code> configuration to submission forms for the Add/edit flow. For email invitations, add <Link href="/guides/notifications"><code>NotificationRecipientsSettings</code> and its trusted server adapter</Link>. Existing notification adapters must forward <code>reportDigest</code> and return it in snapshots to support daily/weekly digests. Notification settings and submission-form Add/edit controls remain optional additions; the dashboard Settings tab appears automatically.</p>
    <p>Email stays off until the recipient confirms. Assigned-bill recipients also need server-managed bill assignments; entering an email address alone does not grant access. For enabled treatment organizations, use the <Link href="/learn/treatment-quickstart">treatment quickstart</Link> and <Link href="/guides/rfas">RfaDashboard guide</Link>. The dashboard includes signing, packet review, and explicit fax sending. Configure permissions and a stable human signer identity from host authorization; sandbox disables delivery.</p>
    <p>Server-side validation, routing, and available backend data can improve without a host package change. New React controls require a package update and host rebuild. Keep the integration on the canonical API and refresh authoritative server state instead of hardcoding statuses, fees, or payer destinations.</p>
    <p>For California treatment estimates, mount <Link href="/guides/fee-schedules"><code>FeeScheduleCalculator</code></Link> with an authenticated reference client. Read review outcomes before using amounts; package upgrades do not enable treatment access or guarantee coverage for every service date.</p>
    <p>React 0.69.2 adds structured physician medical-direction and monitored anesthesia care fields to <code>BillSubmissionForm</code>, with server-returned calculation details. Forward the documented anesthesia context unchanged for quotes and submission. See <Link href="/guides/fee-schedules#anesthesia">anesthesia inputs and review limits</Link>. These controls use the existing treatment capability.</p>
    <p>React 0.69.4 collects actual therapy service details for 97110 and preserves supplied context. Incomplete details prevent an estimate; clearing them removes the prior estimate. Review the <Link href="/guides/fee-schedules#therapy">therapy inputs and supported calculation limits</Link> before integrating.</p>
    <p>React 0.69.6 adds documented furnishing, hospital status, supervision, and session fields for technical MRI services in <code>FeeScheduleCalculator</code>. Existing professional-component session and interpretation fields remain available. Include all relevant imaging in the encounter, preserve explicit incomplete host context, and use the server&apos;s claim-level result after same-session reductions. See <Link href="/guides/fee-schedules#imaging">imaging fields and supported calculation limits</Link>.</p>
    <h2 id="agent">Copy for your coding agent</h2>
    <CodeBlock code={brief} language="text" filename="Existing integration upgrade brief" />
    <p>Starting from scratch? <Link href="/learn/quickstart">Choose your stack and open the full quickstart in your editor →</Link></p>
  </DocPage>;
}
