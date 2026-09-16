import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { profileRecipe } from "@/lib/integration-recipes";

export const metadata: Metadata = { title: "Practice settings and saved profiles" };

const workspace = `"use client";
import { ConnectedBillingWorkspace } from "@mindbill/react";

export function BillingPage({ canManageBilling }: { canManageBilling: boolean }) {
  return <ConnectedBillingWorkspace
    sessionEndpoint="/api/mindbill/session"
    showSettings={canManageBilling}
    billingSettings={{ sessionEndpoint: "/api/mindbill/settings-session" }}
  />;
}
// showSettings defaults to true. Set false to hide the tab.
// Optionally set initialView="settings" to open the workspace there.`;

const settings = `"use client";
import { BillingSettings, OrganizationOnboarding } from "@mindbill/react";

// Mount inside your existing administrator-only practice settings page.
export function PracticeSettings() {
  return <BillingSettings sessionEndpoint="/api/mindbill/settings-session" />;
}

// Optional first-run wizard: practice, rendering providers, locations, W-9, review.
export function FirstTimeSetup() {
  return <OrganizationOnboarding
    sessionEndpoint="/api/mindbill/settings-session"
    onCompleted={() => { window.location.href = "/billing"; }} />;
}`;

export default function PracticeSettingsPage() {
  return <DocPage eyebrow="Build" title="Practice settings and saved profiles" description="Set up billing providers, rendering providers, service locations, and a W-9 once, then reuse them when creating bills."
    toc={[{ id: "settings", label: "Dashboard Settings tab" }, { id: "choices", label: "Saved choices" }, { id: "w9", label: "W-9 ownership" }, { id: "permissions", label: "Permissions and scope" }, { id: "verify", label: "Verify the integration" }]}
    previous={{ href: "/learn/quickstart", label: "Quickstart" }} next={{ href: "/guides/bills", label: "Create and submit bills" }}>
    <h2 id="settings">Use the built-in Settings tab</h2>
    <p>React 0.64.0 includes a <strong>Settings</strong> tab by default in <code>ConnectedBillingWorkspace</code> and <code>BillingDashboard</code>. It uses <code>BillingSettings</code> for practice information, billing and rendering providers, service locations, and W-9 upload. You do not need a separate settings page.</p>
    <CodeBlock code={workspace} filename="BillingPage.tsx" language="tsx" />
    <p><code>showSettings</code> defaults to <code>true</code>; set it to <code>false</code> to hide the tab, or match it to the user&apos;s role as above. Pass <code>billingSettings</code> for a dedicated administrator session. When omitted, the workspace reuses its main connection; <code>BillingDashboard</code> uses the default <code>/api/mindbill/session</code> endpoint. The server still requires <code>organization:manage</code>: showing a tab never grants permissions or changes the scopes minted by your host.</p>
    <p>Use <code>initialView=&quot;settings&quot;</code> on <code>ConnectedBillingWorkspace</code> to open settings first. Both dashboards accept <code>onSettingsSaved(profile)</code>, where <code>profile</code> is the saved <code>OrganizationProfileData</code>, so your host can refresh any profile-derived state it owns. Keep sensitive profile values out of logs.</p>
    <h3>Standalone settings and first-run setup</h3>
    <p><code>BillingSettings</code> is the compact settings editor. <code>OrganizationOnboarding</code> provides the guided first-run version. Both save to the authenticated MindBill organization and include practice information, billing and rendering providers, service locations, and W-9 upload. Keep your existing app navigation and authentication.</p>
    <CodeBlock code={settings} filename="PracticeSettings.tsx" language="tsx" />
    <p>Your <code>/api/mindbill/settings-session</code> route is a host endpoint you implement. Authenticate the current user, verify their practice administrator role, resolve the organization credential on your server, and mint a short-lived browser session granting <code>organization:manage</code>. Apply the <Link href="/guides/authentication#session">same origin, tenant, and session protections</Link> as your billing endpoint.</p>
    <h2 id="choices">Use saved choices in the submission form</h2>
    <p>From React 0.62.0, the connected submission form automatically loads saved billing providers, rendering providers, and service locations when you omit <code>profileOptions</code>. Pass <code>billingSettings</code> with a separate administrator session to offer the prebuilt Add/edit settings flow. Ordinary bill creators need an organization-wide <code>bills:create</code> session to read these choices; they do not need settings write permission. Keep known case values in <code>initialBill</code> and let the user review their selection before submitting.</p>
    <CodeBlock code={profileRecipe} filename="PracticeBill.tsx" language="tsx" />
    <p>Choosing a profile fills the bill snapshot. Editing a bill does not silently update the saved practice profile. Corrections create a reviewed replacement submission; confirm providers, location, dates, diagnoses, charges, and attachments again.</p>
    <h2 id="w9">Choose one owner for the W-9</h2>
    <p>When MindBill owns the practice settings, upload the W-9 through the settings component. The server uses the saved organization W-9 for eligible organization-wide submissions. When your host owns the document, supply the reviewed PDF as a <code>w9</code> attachment through <code>BillSubmissionForm</code> or the atomic bill API. Do not upload a second copy just to render a settings screen.</p>
    <Callout title="Customer-scoped submissions">A customer-scoped submission must include its own billing provider&apos;s W-9. It cannot inherit the shared organization&apos;s W-9 or billing profiles. A missing W-9 returns <code>customer_w9_required</code>. Keep each customer&apos;s provider snapshot and document under your existing authorization checks.</Callout>
    <p>For host-owned uploads, <code>W9Upload</code> can show upload, extraction, retry, and review states using your callbacks. See <Link href="/guides/documents#w9-settings">W-9 storage and attachment examples</Link>.</p>
    <h2 id="permissions">Keep administrative and billing permissions separate</h2>
    <ul>
      <li><strong>Settings administrators:</strong> an authorized <code>organization:manage</code> session can change shared practice settings. A dedicated settings endpoint keeps this permission separate from ordinary billing sessions.</li>
      <li><strong>Bill creators:</strong> an organization-wide <code>bills:create</code> session can read masked billing choices and submit bills.</li>
      <li><strong>Case-only users:</strong> a bill-scoped session cannot list shared practice profiles. Pass explicitly authorized host choices when appropriate; never widen the session to make a dropdown work.</li>
    </ul>
    <p>Saved SSNs are masked. Preserve <code>savedProviderId</code> references rather than copying the last four digits into a tax ID field. In custom settings writes, omit <code>taxId</code> to preserve it and send an empty string only to explicitly clear it. Keep tax identifiers out of logs and browser storage.</p>
    <h2 id="verify">Verify before the first live bill</h2>
    <p>In sandbox, save a synthetic provider and location, create a bill using those choices, reopen the form, and verify a correction retains the expected snapshot. Confirm a non-administrator cannot change settings. Test the empty profile state, a failed profile request, and your W-9 ownership path. Use the <Link href="/guides/sandbox">sandbox workflow</Link> to inspect the resulting documents without contacting a payer.</p>
  </DocPage>;
}
