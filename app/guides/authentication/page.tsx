import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Authentication" };

const serverClient = `import { MindBillClient } from "@mindbill/node";

export const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});`;

const roles = `const permissionsByRole = {
  billing_admin: [
    "bills:create", "bills:read", "bills:edit", "bills:submit", "bills:act",
    "documents:read", "documents:write", "payers:read", "eors:read",
  ],
  biller: [
    "bills:create", "bills:read", "bills:edit", "bills:submit",
    "documents:read", "documents:write", "payers:read", "eors:read",
  ],
  viewer: ["bills:read", "documents:read", "eors:read"],
} as const;`;

const sessionRoute = `app.post("/api/mindbill/session", async (request, response) => {
  const user = await requireSignedInUser(request);
  const permissions = permissionsByRole[user.role];

  if (!permissions) return response.sendStatus(403);

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    permissions,
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  response.json(session);
});`;

const narrowSession = `const session = await mindbill.createBrowserSession({
  subject: user.id,
  permissions: ["bills:read", "bills:edit", "documents:read"],
  resource: { billId },
  allowedOrigin: process.env.APP_ORIGIN!,
  expiresIn: 300,
});`;

const direct = `curl https://app.mindbill.org/partner/v2/bills \
  --header "Authorization: Bearer $MINDBILL_API_KEY" \
  --header "Idempotency-Key: create-report-9f7a" \
  --header "Content-Type: application/json" \
  --data @bill.json`;

export default function AuthenticationPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Authentication and authorization"
      description="An API key fixes the organization. A short-lived browser session identifies the signed-in user, carries role permissions, and is valid only on your exact origin."
      toc={[
        { id: "boundaries", label: "Security boundaries" },
        { id: "roles", label: "Map roles" },
        { id: "session", label: "Mint a session" },
        { id: "resource", label: "Optional bill restriction" },
        { id: "server", label: "Server-only REST" },
      ]}
      previous={{ href: "/learn/quickstart", label: "Quickstart" }}
      next={{ href: "/guides/bills", label: "The bill resource" }}
    >
      <h2 id="boundaries">Three boundaries protect browser access</h2>
      <div className="term-list compact">
        <div><b>Organization</b><p>The permanent API key binds the session to one MindBill organization. A bill ID cannot cross that boundary.</p></div>
        <div><b>User and role</b><p><code>subject</code> is your user ID. <code>permissions</code> are the billing operations that user may perform.</p></div>
        <div><b>Origin and time</b><p>The token works only from one exact HTTPS origin and expires quickly.</p></div>
      </div>
      <Callout title="No bill must exist first">The normal browser session is organization- and user-scoped. A permitted component can create a new bill and later reopen existing bills. You do not create a bill on the server merely to authorize the UI.</Callout>

      <h2 id="roles">Map your roles to billing permissions</h2>
      <p>Your application remains authoritative for sign-in and roles. Map those roles to the least set of MindBill permissions they need.</p>
      <CodeBlock code={roles} filename="server/billing-permissions.ts" />

      <h2 id="session">Add one authenticated session route</h2>
      <p>The route is the only required partner-server integration for browser-side billing. It never accepts an organization ID from the client.</p>
      <CodeBlock code={serverClient} filename="server/mindbill.ts" />
      <CodeBlock code={sessionRoute} filename="server/billing-session.ts" />
      <Callout tone="warning" title="Derive the origin safely">Use a configured production origin or a trusted proxy-aware origin. Do not reflect an arbitrary client-supplied origin into the session.</Callout>

      <h2 id="resource">Optionally restrict a session to one bill</h2>
      <p>Most embedded products should use the organization/user/role session above. For an unusually narrow read or edit surface, add a bill resource restriction. A bill-restricted session cannot include <code>bills:create</code>.</p>
      <CodeBlock code={narrowSession} filename="server/narrow-session.ts" />

      <h2 id="server">Server-only REST remains available</h2>
      <p>Use the permanent key from a trusted worker or backend when no browser user is involved. The Node SDK is optional; any server framework can call REST directly.</p>
      <CodeBlock code={direct} language="bash" filename="Terminal" />
      <Callout title="Synchronize with events">Browser callbacks are useful for immediate UI. Use ordered events or signed webhooks for durable server state; never rely on an untrusted browser callback as the sole record of payer activity.</Callout>
    </DocPage>
  );
}
