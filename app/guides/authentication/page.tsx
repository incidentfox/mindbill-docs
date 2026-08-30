import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Authentication" };

const serverClient = `import { MindBillClient } from "@mindbill/node";

export const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
  // Set organizationId only when MindBill issued one credential for
  // multiple organizations.
  organizationId: process.env.MINDBILL_ORGANIZATION_ID,
});`;

const sessionRoute = `app.post("/api/mindbill/session", async (request, response) => {
  const user = await requireSignedInUser(request);
  const { billId, component } = request.body;

  // Your application remains responsible for user and role authorization.
  await assertUserCanAccessBill(user, billId);

  const session = await mindbill.createBrowserSession({
    component, // "bill-review" or "bill-timeline"
    billId,
    allowedOrigin: "https://your-product.example",
    expiresIn: 900,
  });

  response.json(session);
});`;

const direct = `curl https://app.mindbill.org/partner/v2/bills \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: create-report-9f7a" \\
  --header "Content-Type: application/json" \\
  --data @bill.json`;

export default function AuthenticationPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Authentication"
      description="Use an organization-scoped API key from your server. Mint a short-lived, bill-bound browser session only when you render MindBill components."
      toc={[
        { id: "server", label: "Server API key" },
        { id: "organization", label: "Organization isolation" },
        { id: "session", label: "Browser sessions" },
        { id: "rbac", label: "Your RBAC" },
      ]}
      previous={{ href: "/learn/quickstart", label: "Quickstart" }}
      next={{ href: "/guides/bills", label: "The bill resource" }}
    >
      <h2 id="server">Keep the API key on your server</h2>
      <p>The permanent key authenticates trusted REST and SDK calls. It can create, edit, submit, and query bills for the organization that owns the key.</p>
      <CodeBlock code={serverClient} filename="server/mindbill.ts" />
      <p>Any server framework can call the API directly. The Node SDK is a typed convenience layer, not a requirement.</p>
      <CodeBlock code={direct} language="bash" filename="Terminal" />

      <h2 id="organization">Organization isolation is the outer boundary</h2>
      <p>Every bill belongs to one MindBill organization. A key for one organization cannot read or change another organization&apos;s bills. Most partners receive one key per organization and do not send an organization ID at all.</p>
      <Callout title="Your database can stay canonical">Use <code>externalId</code> values from your case, report, patient, or injury records. MindBill stores the billing snapshot and lifecycle; your application can keep its existing domain model.</Callout>

      <h2 id="session">Browser sessions are optional and bill-bound</h2>
      <p>React and Angular components call MindBill directly from the browser. To render one, your server mints a short-lived session for one existing bill and one component scope.</p>
      <CodeBlock code={sessionRoute} filename="server/billing-session.ts" />
      <p>The session is also bound to one exact HTTPS origin. A token copied to another site, another bill, or another component cannot be reused.</p>

      <h2 id="rbac">Keep roles and permissions in your product</h2>
      <p>MindBill isolates organizations and constrains the browser token. Your server still decides whether the signed-in user may access that bill before minting the session. This keeps your existing RBAC model authoritative.</p>
      <Callout tone="warning" title="Do not trust a bill ID from the browser">Look up the bill&apos;s <code>externalId</code> or stored association and verify it belongs to the signed-in user&apos;s organization, practice, or case before minting a session.</Callout>
    </DocPage>
  );
}
