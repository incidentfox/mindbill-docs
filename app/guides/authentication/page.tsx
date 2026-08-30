import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Authentication" };

const direct = `curl https://app.mindbill.org/partner/v2/bills \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: create-report-9f7a" \\
  --header "Content-Type: application/json" \\
  --data @bill.json`;

const frameworkNeutral = `// The route can be Express, Fastify, Rails, Django, Laravel, Go, etc.
async function createBillSession(request, response) {
  const user = await requireSignedInUser(request);
  const { billId } = await request.json();

  await assertUserCanAccessBill(user, billId);

  const session = await mindbill.createBrowserSession({
    component: "bill-review",
    billId,
    allowedOrigin: new URL(request.url).origin,
    expiresIn: 900,
  });

  return response.json(session);
}`;

export default function AuthenticationPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Authentication"
      description="Use the permanent API key for trusted server requests. Use a short-lived, origin-bound session for native browser components."
      toc={[{ id: "server", label: "Server requests" }, { id: "browser", label: "Browser sessions" }, { id: "rules", label: "Security rules" }]}
      previous={{ href: "/learn/quickstart", label: "Quickstart" }}
      next={{ href: "/guides/bills", label: "Create and edit bills" }}
    >
      <h2 id="server">Server requests</h2>
      <p>Send the API key as a bearer token. Every write also requires an idempotency key so a retry cannot create a duplicate transaction.</p>
      <CodeBlock code={direct} language="bash" filename="Terminal" />
      <h2 id="browser">Browser sessions</h2>
      <p>The frontend asks your server for a session. Your server authenticates the user, checks bill access, and returns the signed session. After that, the component makes lifecycle requests directly.</p>
      <CodeBlock code={frameworkNeutral} filename="server/session.ts" />
      <h2 id="rules">Security rules</h2>
      <ul>
        <li>Never put <code>MINDBILL_API_KEY</code> in browser code, HTML, or a public environment variable.</li>
        <li>Bind each browser session to one bill, one component scope, and one exact HTTPS origin.</li>
        <li>Authorize the signed-in user before minting the session.</li>
        <li>Use a fresh idempotency key for each distinct write, and reuse it only when retrying that write.</li>
      </ul>
      <Callout tone="success" title="Simple frontend">Partners do not need to proxy every billing API call. One small server route protects the key; the component handles session refresh and API calls.</Callout>
    </DocPage>
  );
}

