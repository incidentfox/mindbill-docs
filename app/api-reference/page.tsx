import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "REST API" };

type Endpoint = { method: "GET" | "POST" | "PATCH" | "DELETE"; path: string; description: string };
const endpoints: Endpoint[] = [
  { method: "POST", path: "/bills", description: "Create a bill snapshot." },
  { method: "GET", path: "/bills", description: "List and filter bills." },
  { method: "GET", path: "/bills/{billId}", description: "Read a bill and its current snapshot." },
  { method: "PATCH", path: "/bills/{billId}", description: "Update a draft or corrected bill." },
  { method: "GET", path: "/bills/{billId}/documents", description: "List payer-packet documents." },
  { method: "POST", path: "/bills/{billId}/documents", description: "Upload a supporting PDF." },
  { method: "DELETE", path: "/bills/{billId}/documents/{documentId}", description: "Remove a payer document." },
  { method: "GET", path: "/bills/{billId}/delivery-options", description: "Resolve e-bill, fax, mail, and email routes." },
  { method: "POST", path: "/bills/{billId}/submissions", description: "Submit or resubmit the bill." },
  { method: "GET", path: "/bills/{billId}/status", description: "Read normalized lifecycle status and balances." },
  { method: "GET", path: "/bills/{billId}/eor", description: "Read EOR data and original PDFs." },
  { method: "POST", path: "/bills/{billId}/actions", description: "Post payment, close, or start a correction." },
  { method: "POST", path: "/bills/{billId}/reviews", description: "Create Second Review or IBR." },
  { method: "POST", path: "/bills/{billId}/reviews/{reviewId}/submissions", description: "Submit a review packet." },
  { method: "GET", path: "/events", description: "Read ordered lifecycle events." },
  { method: "POST", path: "/browser-sessions", description: "Mint a scoped browser session." },
];

const error = `{
  "error": "validation_error",
  "message": "The bill is missing required fields.",
  "issues": [
    { "path": "claim.claimsAdministrator", "message": "Select a claims administrator." }
  ],
  "requestId": "req_01J68Y2K6G"
}`;

export default function ApiReferencePage() {
  return (
    <DocPage eyebrow="Reference" title="REST API" description="The API is resource-oriented, JSON by default, and rooted at https://app.mindbill.org/partner/v2. Use multipart form data only for document uploads."
      toc={[{ id: "endpoints", label: "Endpoints" }, { id: "writes", label: "Idempotent writes" }, { id: "errors", label: "Errors" }, { id: "events", label: "Events and webhooks" }]}
      previous={{ href: "/components/angular", label: "Angular components" }}>
      <Callout title="OpenAPI contract"><a href="/openapi.yaml">Download the complete OpenAPI document</a> for request schemas, response schemas, and generated clients.</Callout>
      <h2 id="endpoints">Endpoints</h2>
      <div className="endpoint-table">
        {endpoints.map((endpoint) => <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}`}><b className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</b><code>{endpoint.path}</code><span>{endpoint.description}</span></div>)}
      </div>
      <h2 id="writes">Idempotent writes</h2>
      <p>Every <code>POST</code>, <code>PATCH</code>, and <code>DELETE</code> requires <code>Idempotency-Key</code>. Reuse the key only when retrying the same logical transaction.</p>
      <h2 id="errors">Errors</h2>
      <p>Errors use a stable machine code, human message, optional field issues, and a request ID for support.</p>
      <CodeBlock code={error} language="json" filename="HTTP 422" />
      <h2 id="events">Events and webhooks</h2>
      <p>Poll <code>GET /events</code> by cursor or configure signed webhook delivery. Store the event ID before processing so retries remain safe.</p>
    </DocPage>
  );
}

