import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Customer organizations" };

const createOrganization = `curl https://app.mindbill.org/partner/v2/organizations \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: customer-practice-42" \\
  --data '{
    "externalId": "practice_42",
    "name": "Example Medical Group"
  }'`;

const createResponse = `{
  "organizationId": "org_01example",
  "externalId": "practice_42",
  "name": "Example Medical Group",
  "status": "configuring",
  "accessMode": "managed",
  "created": true
}`;

const listOrganizations = `curl https://app.mindbill.org/partner/v2/organizations \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"`;

const selectOrganization = `curl https://app.mindbill.org/partner/v2/bills \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "X-MindBill-Org-Id: org_01example"`;

const mintBrowserSession = `// Your authenticated server route; never run this in the browser.
import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({ apiKey: process.env.MINDBILL_API_KEY! });

export async function POST(request: Request) {
  if (!process.env.APP_ORIGIN || request.headers.get("origin") !== process.env.APP_ORIGIN)
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  const user = await requireSignedInUser(request);
  const customer = await requireCustomerAccess(user); // Server-owned membership lookup.
  const organizationId = customer.mindbillOrganizationId; // Saved at provisioning.
  const permissions = permissionsForRole(user.role);

  const session = await mindbill.createBrowserSession({
    organizationId,
    subject: user.id,
    allowedOrigin: process.env.APP_ORIGIN!,
    permissions,
    expiresIn: 900,
  });
  return Response.json({ token: session.token, expiresAt: session.expiresAt },
    { headers: { "Cache-Control": "no-store" } });
}

// In React: <ConnectedBillingWorkspace sessionEndpoint="/api/mindbill/session" />`;

export default function OrganizationsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Scope access by customer organization"
      description="Give each customer a separate MindBill organization, then select the authorized organization for every server request."
      toc={[
        { id: "model", label: "Organization model" },
        { id: "create", label: "Create an organization" },
        { id: "list", label: "List organizations" },
        { id: "select", label: "Select the customer" },
        { id: "browser", label: "Mint a browser session" },
        { id: "fixed", label: "Restrict a key" },
      ]}
      previous={{ href: "/guides/authentication", label: "Authentication" }}
      next={{ href: "/guides/sandbox", label: "Sandbox checks" }}
    >
      <h2 id="model">Use one organization per customer</h2>
      <p>Create a MindBill organization for each customer that needs an isolated billing workspace. Save its <code>organizationId</code> with that customer in your backend. Organizations and their data stay within the sandbox or live environment where they were created.</p>
      <Callout tone="warning" title="Resolve the organization on your server">Authenticate the user and load the customer-to-organization mapping from server-owned data. Never accept an unchecked organization ID from the browser or let a user choose another customer&apos;s organization.</Callout>

      <h2 id="create">Create an organization</h2>
      <p>Use an account-scoped key with <code>orgs:write</code>. Send your stable, non-sensitive customer ID as <code>externalId</code>; the same value lets you safely retry provisioning and recover the existing organization.</p>
      <CodeBlock code={createOrganization} language="bash" filename="Create or find a customer organization" />
      <CodeBlock code={createResponse} language="json" filename="201 Created" />
      <p>Provisioning is automatic and returns the organization immediately with <code>status: &quot;configuring&quot;</code>. A repeated request for the same customer can return <code>200</code> with <code>created: false</code>. Keep the returned <code>organizationId</code>; use your own <code>externalId</code> only to reconcile the mapping. Check the organization&apos;s status and live readiness before sending live bills.</p>
      <p>See the <Link href="/api-reference/provision-organization">organization provisioning reference</Link> for optional practice settings and response fields.</p>

      <h2 id="list">List organizations available to the key</h2>
      <p>Use <code>GET /organizations</code> with <code>orgs:read</code> to reconcile the organizations linked to the current key in its current environment.</p>
      <CodeBlock code={listOrganizations} language="bash" filename="List customer organizations" />
      <p>The response contains <code>data[]</code> entries with <code>organizationId</code>, <code>externalId</code>, <code>name</code>, and <code>status</code>. An organization-scoped key sees only its fixed organization.</p>
      <p>See the <Link href="/api-reference/list-organizations">list organizations reference</Link>.</p>

      <h2 id="select">Select the authorized customer on each request</h2>
      <p>For an account-scoped key, send the saved MindBill organization ID in <code>X-MindBill-Org-Id</code> on bill, settings, notification, and other organization-specific requests.</p>
      <CodeBlock code={selectOrganization} language="bash" filename="Read bills for the authenticated customer" />
      <p>MindBill verifies that the organization is linked to the key. A header for an unlinked organization is rejected. Existing single-organization workspaces may retain a default; integrations with more than one possible organization must select the customer explicitly.</p>

      <h2 id="browser">Mint a browser session for that organization</h2>
      <p>For React components, authenticate the user on your server and resolve their customer&apos;s saved MindBill organization ID from your own membership data. Pass it to <code>createBrowserSession</code>. The Node SDK sends <code>X-MindBill-Org-Id</code> only when issuing this session. With plain HTTP, send the same header on <code>POST /partner/v2/browser-sessions</code>, outside the JSON body.</p>
      <CodeBlock code={mintBrowserSession} language="typescript" filename="app/api/mindbill/session/route.ts" />
      <p>The response&apos;s <code>organizationId</code> identifies the organization bound to the short-lived browser token. MindBill rejects a token used with a different organization header. The React component sends the token directly to MindBill; it does not choose an organization or receive the server API key. The host route must recheck customer membership and role each time it issues or refreshes a token. Permissions limit operations; an optional <code>resource</code> can narrow access to a customer or bill within the selected organization.</p>
      <Callout title="Choose the server key boundary">An account-scoped key can mint sessions for its linked organizations after your server selects one. A key fixed to one organization can mint only for that organization. If the SDK client has a fixed <code>organizationId</code>, a different per-session ID is rejected.</Callout>

      <h2 id="fixed">Restrict a key to one organization</h2>
      <p>Create an organization-scoped key when a service should access only one customer. That key cannot switch to another organization, even if a different <code>X-MindBill-Org-Id</code> header is sent. Browser sessions are also fixed to the organization chosen by your server when the session is issued.</p>
      <Callout title="Recommended boundary">Use one account-scoped key in a trusted central service when it must manage several customers. Use an organization-scoped key for a dedicated customer service or a narrower operational boundary.</Callout>
      <p>Continue with <Link href="/guides/authentication">authentication and browser-session access</Link>, or verify the complete flow in the <Link href="/guides/sandbox">sandbox checklist</Link>.</p>
      <p>For a customer-by-customer implementation brief, see the <Link href="/guides/partner-integration">partner integration guide</Link>.</p>
    </DocPage>
  );
}
