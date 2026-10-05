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
  "status": "active",
  "accessMode": "managed",
  "created": true
}`;

const listOrganizations = `curl https://app.mindbill.org/partner/v2/organizations \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"`;

const selectOrganization = `curl https://app.mindbill.org/partner/v2/bills \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "X-MindBill-Org-Id: org_01example"`;

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
      <p>A repeated request for the same customer can return <code>200</code> with <code>created: false</code>. Keep the returned <code>organizationId</code>; use your own <code>externalId</code> only to reconcile the mapping.</p>
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

      <h2 id="fixed">Restrict a key to one organization</h2>
      <p>Create an organization-scoped key when a service should access only one customer. That key cannot switch to another organization, even if a different <code>X-MindBill-Org-Id</code> header is sent. Browser sessions are also fixed to the organization chosen by your server when the session is issued.</p>
      <Callout title="Recommended boundary">Use one account-scoped key in a trusted central service when it must manage several customers. Use an organization-scoped key for a dedicated customer service or a narrower operational boundary.</Callout>
      <p>Continue with <Link href="/guides/authentication">authentication and browser-session access</Link>, or verify the complete flow in the <Link href="/guides/sandbox">sandbox checklist</Link>.</p>
    </DocPage>
  );
}
