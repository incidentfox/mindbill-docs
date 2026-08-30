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
        { id: "account", label: "Account controls" },
        { id: "live", label: "Go live" },
      ]}
      previous={{ href: "/guides/authentication", label: "Authentication" }}
      next={{ href: "/components/react", label: "React components" }}
    >
      <h2 id="sandbox">Create a sandbox key</h2>
      <p>Open the developer console, create a sandbox organization, and copy the key when it is shown. Sandbox organizations accept synthetic data only and never route a claim to a payer.</p>
      <Callout tone="warning" title="Never send PHI to sandbox">Use invented patients, claims, documents, identifiers, and contact details.</Callout>

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
      <p>Browser permissions are narrower and role-derived: <code>bills:create</code>, <code>bills:read</code>, <code>bills:edit</code>, <code>bills:submit</code>, <code>bills:act</code>, <code>documents:read</code>, <code>documents:write</code>, <code>payers:read</code>, and <code>eors:read</code>.</p>

      <h2 id="live">Go live</h2>
      <p>Live routing requires an approved organization, a current BAA, payment setup, and a verified webhook endpoint. The API and components do not change when live access is enabled; rotate to the live key and keep your origin and role policy unchanged.</p>
      <p><Link href="/api-reference/browser-sessions">Configure browser-session permissions →</Link></p>
    </DocPage>
  );
}
