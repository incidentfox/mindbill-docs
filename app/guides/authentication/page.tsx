import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Authentication" };

const roleMap = `const billingPermissions = {
  viewer: ["bills:read", "documents:read", "eors:read"],
  biller: [
    "bills:create", "bills:read", "bills:edit", "bills:submit",
    "bills:act", "documents:read", "documents:write",
    "payers:read", "eors:read",
  ],
} as const;

function billingPermissionsFor(role: keyof typeof billingPermissions) {
  return [...billingPermissions[role]];
}`;

const frameworkNeutral = `// Express is shown, but this works with any server framework.
app.post("/api/mindbill/session", async (request, response) => {
  const user = await requireSignedInUser(request);
  const permissions = billingPermissionsFor(user.role);

  response.json(await mindbill.createBrowserSession({
    subject: user.id,
    allowedOrigin: process.env.APP_ORIGIN!,
    permissions,
    expiresIn: 900,
  }));
});`;

const restricted = `// Optional: restrict a session to one existing bill.
const session = await mindbill.createBrowserSession({
  subject: user.id,
  allowedOrigin: process.env.APP_ORIGIN!,
  permissions: ["bills:read", "documents:read", "eors:read"],
  resource: { billId },
  expiresIn: 900,
});`;

const direct = `curl https://app.mindbill.org/partner/v2/bills \
  --header "Authorization: Bearer $MINDBILL_API_KEY" \
  --header "Idempotency-Key: create-report-9f7a" \
  --header "Content-Type: application/json" \
  --data @bill.json`;

export default function AuthenticationPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Authentication"
      description="Your existing login and roles remain authoritative. MindBill enforces organization, user, permission, and browser-origin boundaries on every component request."
      toc={[
        { id: "model", label: "Security model" },
        { id: "permissions", label: "Map roles to permissions" },
        { id: "session", label: "Mint sessions" },
        { id: "restricted", label: "Optional bill restriction" },
        { id: "server", label: "Server API" },
      ]}
      previous={{ href: "/learn/quickstart", label: "Quickstart" }}
      next={{ href: "/guides/bills", label: "Create and edit bills" }}
    >
      <h2 id="model">Four independent security boundaries</h2>
      <ol>
        <li><strong>Organization:</strong> the server API key selects exactly one partner organization.</li>
        <li><strong>User:</strong> <code>subject</code> identifies the signed-in user for authorization and audit history.</li>
        <li><strong>Capability:</strong> <code>permissions</code> controls what that user can read or change.</li>
        <li><strong>Origin:</strong> <code>allowedOrigin</code> binds the token to one exact HTTPS browser origin.</li>
      </ol>
      <Callout title="Organization isolation is automatic">A session minted with one organization&apos;s API key cannot read or mutate another organization&apos;s bills, even if a foreign bill ID is supplied.</Callout>
      <h2 id="permissions">Map your roles to permissions</h2>
      <p>Keep roles in your application. Translate them to the smallest set of billing permissions when you mint the session.</p>
      <CodeBlock code={roleMap} filename="billing-permissions.ts" />
      <h2 id="session">Mint a short-lived session</h2>
      <p>The component posts an empty body to this route and renews the session before expiry. Your server only authenticates, authorizes, and mints—it does not proxy billing calls.</p>
      <CodeBlock code={frameworkNeutral} filename="server/session.ts" />
      <h2 id="restricted">Restrict a one-off view to one bill</h2>
      <p>Organization-and-permission scope is the normal application model. Add <code>resource.billId</code> only for a deliberately narrow view, such as a read-only link. A bill-restricted session cannot create bills.</p>
      <CodeBlock code={restricted} filename="server/restricted-session.ts" />
      <h2 id="server">Use the permanent key for trusted jobs</h2>
      <p>Background imports, reporting jobs, and server-to-server workflows can call the REST API directly. Browser components should use sessions instead.</p>
      <CodeBlock code={direct} language="bash" filename="Terminal" />
      <Callout tone="warning" title="Security rules">Never expose the permanent key. Derive <code>subject</code> and permissions from the authenticated server session, use a configured exact origin, and keep browser sessions short-lived.</Callout>
    </DocPage>
  );
}
