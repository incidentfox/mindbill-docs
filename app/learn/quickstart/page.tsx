import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";
import { QuickstartPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/react @mindbill/node`;

const server = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

// Any server framework: POST /api/mindbill/session
export async function POST(request: Request) {
  const user = await requireSignedInUser(request);

  const permissions = user.role === "billing_admin"
    ? [
        "bills:create", "bills:read", "bills:edit", "bills:submit", "bills:act",
        "documents:read", "documents:write", "payers:read", "eors:read",
      ]
    : [
        "bills:create", "bills:read", "bills:edit",
        "documents:read", "documents:write", "payers:read",
      ];

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    permissions,
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  return Response.json(session);
}`;

const browser = `import { createBillLifecycleClient } from "@mindbill/browser";

const billing = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const { billId, data } = await billing.createBill(knownBillValues);`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Add billing with React"
      description="Mint one short-lived browser session on your server, then render the complete bill review and lifecycle in your product."
      toc={[
        { id: "install", label: "Install" },
        { id: "authorize", label: "Create a session route" },
        { id: "render", label: "Render the lifecycle" },
        { id: "sync", label: "Keep the bill ID" },
        { id: "api-only", label: "Without React" },
      ]}
      previous={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
      next={{ href: "/learn/routing", label: "Routing and EDI" }}
    >
      <Callout title="The server only authorizes">Keep the organization API key on your server. Your route checks the signed-in user and mints an origin-bound session for that user&apos;s role. The React component creates the bill and returns its ID.</Callout>
      <Steps>
        <Step title="Install React and the server client">
          <span id="install" />
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Create one session route">
          <span id="authorize" />
          <p>Use any server framework. The API key fixes the organization, <code>subject</code> identifies your user, and <code>permissions</code> come from your own role-based access control.</p>
          <CodeBlock code={server} filename="server/mindbill-session.ts" />
          <Callout tone="warning" title="Do not put the API key in frontend code">Only the short-lived, exact-origin session reaches the browser. MindBill enforces both the organization boundary and the permissions on every request.</Callout>
        </Step>
        <Step title="Render the lifecycle">
          <span id="render" />
          <p>Pass every value your product already knows. They become the editable snapshot that prints on the <a href="https://www.nucc.org/images/stories/PDF/1500_claim_form_2012_02.pdf">CMS-1500</a> and travels in the <a href="https://www.cms.gov/files/document/mln006976-medicare-billing-cms-1500-837p.pdf">837P</a>.</p>
          <QuickstartPlayground />
          <p>The first tab is a safe live preview. Use the other tabs for the connected React component, server route, and bill data. Pass <code>billId</code> instead of <code>create</code> when reopening a bill.</p>
        </Step>
        <Step title="Keep the bill ID">
          <span id="sync" />
          <p>Store the <code>billId</code> returned by <code>onBillCreated</code> beside your case or report. Signed webhooks keep server-side status current after acknowledgements, EORs, payments, or denials arrive.</p>
        </Step>
      </Steps>
      <h2 id="api-only">Use the same flow without React</h2>
      <p>The framework-neutral browser package uses the same session route. Angular ships a native lifecycle component. Your server may call the REST API directly when no user review is required.</p>
      <CodeBlock code={`npm install @mindbill/browser`} language="bash" filename="Terminal" />
      <CodeBlock code={browser} filename="billing.ts" />
    </DocPage>
  );
}
