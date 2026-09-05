import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Sandbox and live access" };

export default function SandboxPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Sandbox first, live when ready"
      description="Develop with synthetic data and the same API surface used in production. Live claims remain disabled until your organization completes security and billing setup."
      toc={[
        { id: "sandbox", label: "Create a sandbox key" },
        { id: "verify", label: "Test your integration" },
        { id: "account", label: "Account controls" },
        { id: "live", label: "Go live" },
      ]}
      previous={{ href: "/guides/authentication", label: "Authentication" }}
      next={{ href: "/components/react", label: "React components" }}
    >
      <h2 id="sandbox">Create a sandbox key</h2>
      <p>Open the <a href="https://platform.mindbill.org/onboarding">developer console</a>, create a sandbox organization, and copy the key when it is shown. Sandbox organizations accept synthetic data only and never route a claim to a payer.</p>
      <Callout tone="warning" title="Never send PHI to sandbox">Use invented patients, claims, documents, identifiers, and contact details.</Callout>

      <h2 id="verify">Test your integration</h2>
      <ol>
        <li>Create a synthetic bill with a final report, save its bill ID, and confirm it appears in All Bills.</li>
        <li>Use the <Link href="/api-reference/sandbox-simulate">sandbox simulation endpoint</Link> to exercise acceptance, rejection, and payer processing. Check status, EORs, attachments, and available actions.</li>
        <li>Test a corrected bill, second review, and payment posting through the <Link href="/guides/lifecycle">lifecycle workflow</Link>.</li>
        <li>Verify that unauthenticated users, users from another customer, and non-admin settings users are denied. Check session expiry and refresh.</li>
        <li>For components, test empty and error states, narrow screens, and scrolling inside your app. Bills waiting on payers must remain visible in All Bills.</li>
        <li>Verify <Link href="/api-reference/events">webhook signatures</Link>, duplicate events, and out-of-order delivery. Reconcile current bill state; browser callbacks alone are not a durable record.</li>
      </ol>
      <p>Add <Link href="/guides/notifications#widget">notification settings</Link> to your existing settings page with <code>NotificationSettings</code> and an authenticated host-server adapter, or use your own settings UI. Notifications are off by default. Once activated for your integration, MindBill can notify explicitly consenting users for assigned bills or an authorized whole practice, without console accounts. Signed webhooks support custom messages or delivery. Contact suggestions and rendering a component never enroll recipients automatically.</p>
      <h2 id="account">Account controls</h2>
      <div className="data-table networks">
        <div className="table-head"><b>Capability</b><b>Server permission</b></div>
        <div><span>Read account, keys, and usage</span><code>account:read</code></div>
        <div><span>Accept the BAA and update security settings</span><code>account:write</code></div>
        <div><span>Create and revoke API keys</span><code>keys:write</code></div>
        <div><span>Read organizations</span><code>orgs:read</code></div>
        <div><span>Create organizations and manage access</span><code>orgs:write</code></div>
        <div><span>Update reusable source profiles</span><code>settings:write</code></div>
      </div>
      <p>Browser access uses the separate <Link href="/guides/authentication#permissions">browser permission set</Link>, assigned from your application’s roles. A submitted bill has no edit permission because its snapshot and payer packet are immutable.</p>

      <h2 id="live">Go live</h2>
      <p>Live routing requires an approved organization, a current BAA, payment setup, and a verified webhook endpoint. The API and components do not change when live access is enabled; rotate to the live key and keep your origin and role policy unchanged.</p>
      <p><Link href="/api-reference/browser-sessions">Configure browser-session permissions →</Link></p>
    </DocPage>
  );
}
