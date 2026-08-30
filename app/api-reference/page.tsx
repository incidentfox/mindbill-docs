import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "REST API" };

type Endpoint = { method: "GET" | "POST" | "PATCH" | "DELETE"; path: string; description: string };

const browserEndpoints: Endpoint[] = [
  { method: "POST", path: "/browser/bills", description: "Create a private bill draft." },
  { method: "GET", path: "/browser/bills/{billId}/lifecycle", description: "Read the bill, status, EORs, and allowed actions." },
  { method: "PATCH", path: "/browser/bills/{billId}", description: "Save reviewed bill values." },
  { method: "GET", path: "/browser/claims-administrators", description: "Search and explain payer matches." },
  { method: "POST", path: "/browser/bills/{billId}/documents", description: "Attach an intentional payer-packet document." },
  { method: "DELETE", path: "/browser/bills/{billId}/documents/{documentId}", description: "Remove a payer-packet document." },
  { method: "GET", path: "/browser/bills/{billId}/delivery-options", description: "Resolve e-bill, fax, mail, and email destinations." },
  { method: "POST", path: "/browser/bills/{billId}/submissions", description: "Save and submit the bill atomically." },
  { method: "POST", path: "/browser/bills/{billId}/actions", description: "Correct, review, post payment, or close." },
  { method: "GET", path: "/browser/bills/{billId}/eors/{documentId}", description: "Open an original EOR PDF." },
];

const serverEndpoints: Endpoint[] = [
  { method: "POST", path: "/browser-sessions", description: "Mint an organization- and user-scoped browser session." },
  { method: "GET", path: "/bills", description: "List and filter bills for reporting or reconciliation." },
  { method: "POST", path: "/bills", description: "Optional server-to-server bill creation." },
  { method: "GET", path: "/bills/{billId}", description: "Read a bill from a trusted server." },
  { method: "PATCH", path: "/bills/{billId}", description: "Update a bill from a trusted server." },
  { method: "GET", path: "/events", description: "Read ordered lifecycle events." },
  { method: "GET", path: "/webhook-deliveries", description: "Inspect signed webhook delivery attempts." },
];

const session = `POST /partner/v2/browser-sessions
Authorization: Bearer mb_live_••••
Content-Type: application/json

{
  "subject": "user_42",
  "allowedOrigin": "https://your-app.example",
  "permissions": [
    "bills:create",
    "bills:read",
    "bills:edit",
    "bills:submit",
    "bills:act",
    "documents:read",
    "documents:write",
    "payers:read",
    "eors:read"
  ],
  "expiresIn": 900
}`;

const error = `{
  "error": "validation_error",
  "message": "The bill is missing required fields.",
  "issues": [
    { "path": "claim.claimsAdministrator", "message": "Select a claims administrator." }
  ],
  "requestId": "req_01J68Y2K6G"
}`;

function EndpointTable({ endpoints }: { endpoints: Endpoint[] }) {
  return (
    <div className="endpoint-table">
      {endpoints.map((endpoint) => (
        <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}`}>
          <b className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</b>
          <code>{endpoint.path}</code>
          <span>{endpoint.description}</span>
        </div>
      ))}
    </div>
  );
}

export default function ApiReferencePage() {
  return (
    <DocPage
      eyebrow="Reference"
      title="REST API"
      description="Browser sessions are the default integration. Trusted server endpoints remain available for reporting, reconciliation, and API-only workflows."
      toc={[
        { id: "browser", label: "Browser API" },
        { id: "sessions", label: "Session endpoint" },
        { id: "server", label: "Trusted server API" },
        { id: "writes", label: "Idempotent writes" },
        { id: "errors", label: "Errors" },
        { id: "events", label: "Events and webhooks" },
      ]}
      previous={{ href: "/components/angular", label: "Angular components" }}
    >
      <Callout title="Base URL"><code>https://app.mindbill.org/partner/v2</code>. Use JSON except for multipart document uploads.</Callout>
      <h2 id="browser">Browser API</h2>
      <p>The React, Angular, and browser packages call these endpoints with a short-lived session token. Your frontend can create the bill; a server-side create call is not required.</p>
      <EndpointTable endpoints={browserEndpoints} />
      <h2 id="sessions">Mint a browser session</h2>
      <p>This is the one endpoint your server normally calls. The API key fixes the organization boundary. Your signed-in user becomes <code>subject</code>, their role determines <code>permissions</code>, and <code>allowedOrigin</code> prevents token reuse from another site.</p>
      <CodeBlock code={session} language="http" filename="Browser session request" />
      <h2 id="server">Trusted server API</h2>
      <p>Use these endpoints only when work genuinely belongs on your server—for example, an API-only integration, a receivables export, or webhook reconciliation.</p>
      <EndpointTable endpoints={serverEndpoints} />
      <h2 id="writes">Idempotent writes</h2>
      <p>The SDK adds idempotency keys to mutations automatically. For direct server calls, send <code>Idempotency-Key</code> and reuse it only when retrying the same logical transaction.</p>
      <h2 id="errors">Errors</h2>
      <p>Errors use a stable machine code, human message, optional field issues, and a request ID for support.</p>
      <CodeBlock code={error} language="json" filename="HTTP 422" />
      <h2 id="events">Events and webhooks</h2>
      <p>Component callbacks improve the current screen. Signed webhooks are the durable source for submission, rejection, denial, EOR, payment, review, resubmission, and closure changes. Store each event ID before processing so retries remain safe.</p>
      <Callout title="Organization isolation">API keys and browser sessions are organization-scoped. A user from one organization cannot list or mutate another organization&apos;s bills, even if they know a bill ID.</Callout>
    </DocPage>
  );
}
