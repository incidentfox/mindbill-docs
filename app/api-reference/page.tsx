import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "REST API reference" };

type Endpoint = { method: "GET" | "POST" | "PATCH" | "DELETE"; path: string; description: string };

const endpoints: Endpoint[] = [
  { method: "POST", path: "/bills", description: "Create a private bill draft." },
  { method: "GET", path: "/bills", description: "List and filter organization bills." },
  { method: "GET", path: "/bills/{billId}", description: "Read a bill." },
  { method: "PATCH", path: "/bills/{billId}", description: "Update an editable draft." },
  { method: "GET", path: "/bills/{billId}/documents", description: "List payer-packet documents." },
  { method: "POST", path: "/bills/{billId}/documents", description: "Upload a payer-packet document." },
  { method: "DELETE", path: "/bills/{billId}/documents/{documentId}", description: "Remove a document." },
  { method: "POST", path: "/bills/{billId}/submissions", description: "Submit through e-bill, fax, mail, or email." },
  { method: "GET", path: "/bills/{billId}/status", description: "Read normalized lifecycle status." },
  { method: "GET", path: "/bills/{billId}/eor", description: "Read EOR data and source documents." },
  { method: "POST", path: "/bills/{billId}/actions", description: "Correct, post payment, review, or close." },
  { method: "GET", path: "/bills/{billId}/reviews", description: "List SBR and IBR records." },
  { method: "POST", path: "/bills/{billId}/reviews", description: "Create an SBR or IBR draft." },
  { method: "POST", path: "/bills/{billId}/reviews/{reviewId}/submissions", description: "Submit a review." },
  { method: "GET", path: "/events", description: "Read ordered lifecycle events." },
  { method: "GET", path: "/webhook-deliveries", description: "Inspect webhook delivery attempts." },
  { method: "POST", path: "/browser-sessions", description: "Mint a bill-bound component session." },
];

const session = `POST /partner/v2/browser-sessions
Authorization: Bearer mb_live_••••
Content-Type: application/json

{
  "component": "bill-review",
  "billId": "bill_123",
  "allowedOrigin": "https://your-app.example",
  "expiresIn": 900
}`;

const error = `{
  "error": "validation_error",
  "message": "The bill is missing required fields.",
  "issues": [
    {
      "path": "claim.claimsAdministrator",
      "message": "Select a claims administrator."
    }
  ],
  "requestId": "req_01J68Y2K6G"
}`;

function EndpointTable({ endpoints: rows }: { endpoints: Endpoint[] }) {
  return (
    <div className="endpoint-table">
      {rows.map((endpoint) => (
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
      description="Create one bill resource, attach its payer packet, submit it, and use the same ID for every status and lifecycle action that follows."
      toc={[
        { id: "conventions", label: "Conventions" },
        { id: "endpoints", label: "Endpoints" },
        { id: "events", label: "Events and webhooks" },
        { id: "sessions", label: "Component sessions" },
        { id: "writes", label: "Idempotent writes" },
        { id: "errors", label: "Errors" },
      ]}
      previous={{ href: "/components/angular", label: "Angular components" }}
      next={{ href: "/pricing", label: "Pricing" }}
    >
      <h2 id="conventions">Conventions</h2>
      <div className="term-list compact">
        <div><b>Base URL</b><p><code>https://app.mindbill.org/partner/v2</code></p></div>
        <div><b>Authentication</b><p><code>Authorization: Bearer mb_live_...</code> from a trusted server.</p></div>
        <div><b>Organization boundary</b><p>The API key fixes the organization. Bill IDs never bypass that boundary.</p></div>
        <div><b>Encoding</b><p>JSON for ordinary requests; multipart form data for document uploads.</p></div>
      </div>

      <h2 id="endpoints">Endpoints</h2>
      <EndpointTable endpoints={endpoints} />

      <h2 id="events">Events and webhooks</h2>
      <p>Every material lifecycle transition produces an ordered event: submission, clearinghouse acknowledgement, payer acceptance, EOR, payment, denial, review, correction, and closure. Poll <code>GET /events</code> from a cursor or receive signed webhooks, then persist only the fields your product needs.</p>
      <Callout title="MindBill stays authoritative">Treat browser callbacks as immediate UI feedback. Use the event feed or signed webhooks for durable synchronization because payer responses can arrive long after the original user session ends.</Callout>

      <h2 id="sessions">Browser sessions are for an existing bill</h2>
      <p>Your server creates the bill and authorizes the signed-in user. It can then mint a short-lived, origin-bound session for a React or Angular component. The session is deliberately bound to one bill, so a leaked browser token cannot enumerate the organization.</p>
      <CodeBlock code={session} language="http" filename="Browser session request" />
      <Callout title="Why the server creates the bill">The server already knows the organization, authenticated user, and source record. Creating the bill there establishes ownership once. The component session then grants the narrow browser access needed to review and act on that bill—without exposing your API key.</Callout>

      <h2 id="writes">Make every mutation idempotent</h2>
      <p>The Node SDK requires an idempotency key for create, update, upload, submit, review, payment, correction, and close operations. For direct REST calls, send <code>Idempotency-Key</code> and reuse it only when retrying the same logical transaction.</p>

      <h2 id="errors">Errors are structured</h2>
      <p>Errors include a stable machine code, a human-readable message, optional field issues, and a request ID for support.</p>
      <CodeBlock code={error} language="json" filename="HTTP 422" />
    </DocPage>
  );
}
