import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { IntegrationBuilder } from "@/components/integration-builder";
import { hostContract } from "@/lib/integration-recipes";

export const metadata: Metadata = { title: "Authentication" };

const roles = `const permissionsByRole = {
  billing_admin: [
    "bills:create", "bills:read", "bills:act",
    "documents:read", "payers:read", "eors:read",
  ],
  biller: [
    "bills:create", "bills:read",
    "documents:read", "payers:read", "eors:read",
  ],
  viewer: ["bills:read", "documents:read", "eors:read"],
} as const;`;

export default function AuthenticationPage() {
  return <DocPage eyebrow="Build" title="Authentication"
    description="Call the same API with a server key or a short-lived browser session. Your application controls which customers and users can access billing."
    toc={[{ id: "shared", label: "One API, two credentials" }, { id: "boundaries", label: "Organizations and users" }, { id: "permissions", label: "Browser permissions" }, { id: "session", label: "Server route recipes" }, { id: "resource", label: "Restrict access to a bill" }]}
    previous={{ href: "/learn/quickstart", label: "Quickstart" }} next={{ href: "/guides/sandbox", label: "Sandbox checks" }}>
    <h2 id="shared">One API, two credentials</h2>
    <div className="term-list compact">
      <div><b>Server API key</b><p>Send <code>Authorization: Bearer &lt;api-key&gt;</code> from a trusted backend. Keep the key in your server secret store.</p></div>
      <div><b>Browser session</b><p>Your backend exchanges its key for a short-lived token. Components send that token and the browser’s exact authorized <code>Origin</code>.</p></div>
    </div>
    <p>Both use the same <code>/partner/v2</code> business URLs, payloads, and responses. Each <Link href="/api-reference">endpoint reference</Link> lists its server scopes and browser permissions. Existing <code>/partner/v2/browser</code> business URLs remain aliases; use the canonical URLs for new integrations.</p>
    <Callout title="Some operations require a server key">Organization creation, session issuance, ordered events, and webhook-delivery administration are server-only operations. The browser SDK accepts session credentials only.</Callout>
    <h2 id="boundaries">Choose the organization and user on your server</h2>
    <p>Authenticate the user, check their billing role, and select the customer’s MindBill credential from server-owned membership data. Never accept a credential, organization, subject, or permission list from the request body.</p>
    <Callout tone="warning" title="Subject is an audit identity, not tenant isolation">An organization-wide session can access that organization’s bills according to its permissions. <code>subject</code> records who acted; it does not filter records by user. Multi-customer apps need a server-owned customer-to-credential mapping.</Callout>
    <p>Organization-scoped keys and browser sessions are fixed to one organization. An account-scoped partner key can use <code>{"/organizations/{id}"}</code> for linked organizations it may manage. For normal business routes, account-scoped keys select a linked organization with <code>X-MindBill-Org-Id</code>; missing selection returns <code>400 org_required</code>. Singular <code>/organization</code> routes use that selected organization. Fixed organization keys and browser sessions cannot switch organizations.</p>
    <p>Configure <code>APP_ORIGIN</code> as the frontend’s exact origin: scheme, host, and port, with no path or trailing slash. Live sessions require HTTPS; sandbox also accepts loopback HTTP. For separate frontend and backend hosts, apply explicit allowed-origin CORS and your existing CSRF protections, then use a component <code>getSession</code> callback with your authenticated fetch.</p>
    <h2 id="permissions">Assign browser permissions from your roles</h2>
    <p>Grant only the operations the signed-in user needs. Saved settings require a separate admin-authorized <code>organization:manage</code> session; ordinary bill creators can read masked profile choices with <code>bills:create</code>.</p>
      <div className="data-table networks">
        <div className="table-head"><b>Permission</b><b>Allows</b></div>
        <div><code>bills:create</code><span>Atomically create and submit an immutable bill snapshot.</span></div>
        <div><code>bills:read</code><span>Read bill review data, status, balances, and available actions.</span></div>
        <div><code>bills:act</code><span>Post payment, close, correct, or start payer-review actions allowed by the bill state.</span></div>
        <div><code>documents:read</code><span>List and open payer-packet documents.</span></div>
        <div><code>payers:read</code><span>Search claims administrators, diagnosis and postal codes, and preview delivery routes.</span></div>
        <div><code>organization:manage</code><span>Read and update organization settings, providers, locations, and W-9. Requires an organization-wide session.</span></div>
        <div><code>eors:read</code><span>Read normalized EOR data and original payer documents when available.</span></div>
      </div>

    <details><summary>Example role mapping</summary><CodeBlock code={roles} filename="server/billing-permissions.ts" /><p>This mapping does not grant settings access. Add <code>organization:manage</code> only after checking the user’s practice-administration role.</p></details>
    <h2 id="session">Add a server route for your stack</h2>
    <p>Choose your stack below. Each browser-session recipe intentionally refuses to mint a token until you implement the host authorization adapter. It must authenticate the user, enforce your feature flag and role, and return the correct customer credential.</p>
    <details><summary>Required host authorization adapter</summary><CodeBlock code={hostContract} language="text" filename="Your application’s authorization contract" /></details>
    <IntegrationBuilder />
    <p>Return session responses with <code>Cache-Control: no-store</code>. Map authentication failures to <code>401</code> or <code>403</code>; return a generic error for upstream failures. Never expose keys or upstream error bodies.</p>
    <h2 id="resource">Restrict a session to one bill</h2>
    <p>For a case billing tab, authorize access to the host case and resolve its saved MindBill bill ID on the server. Set <code>{"resource: { billId }"}</code> and omit <code>bills:create</code>. Use an organization-wide session for the full workspace or saved-profile lookup.</p>
    <p>See the <Link href="/api-reference/browser-sessions">browser-session reference</Link> for token fields, expiration, and resource rules. For API-only integrations, use the server key directly; no session route is needed.</p>
  </DocPage>;
}
