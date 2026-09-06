import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SchemaTable } from "@/components/api-reference";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { compatBaseUrl, compatCurl, compatDocsPath, compatEndpointBySlug, compatEndpoints } from "@/lib/daisybill-compat-reference";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return compatEndpoints.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const endpoint = compatEndpointBySlug((await params).slug);
  const title = endpoint ? `${endpoint.title} · daisyBill compatibility` : "Compatibility endpoint";
  const path = endpoint ? `${compatDocsPath}/${endpoint.slug}` : compatDocsPath;
  return {
    title, description: endpoint?.summary,
    alternates: { canonical: path }, robots: { index: false, follow: false },
    openGraph: { title, description: endpoint?.summary, url: `https://docs.mindbill.org${path}` },
  };
}

export default async function CompatibilityEndpointPage({ params }: PageProps) {
  const endpoint = compatEndpointBySlug((await params).slug);
  if (!endpoint) notFound();
  const index = compatEndpoints.indexOf(endpoint);
  const previous = compatEndpoints[index - 1];
  const next = compatEndpoints[index + 1];
  const writing = endpoint.method !== "GET";
  const hasBody = endpoint.method === "POST" || endpoint.method === "PATCH";
  const attachment = endpoint.resource.key === "attachment";
  const submission = endpoint.resource.key === "bill_submission";
  const validation422 = ["injury", "bill", "bill_submission"].includes(endpoint.resource.key) && (hasBody || (endpoint.list && endpoint.resource.key === "injury"));
  const operationErrors = endpoint.resource.errors?.filter(error => {
    if (!writing && [409, 413, 415, 502].includes(error.status)) return false;
    if (error.status === 422 && !validation422) return false;
    if (error.status === 409 && endpoint.resource.key === "patient" && endpoint.method !== "DELETE") return false;
    return true;
  });
  const errors = [
    { name: "400 Bad Request", type: "error / errors", description: "Malformed JSON, unknown or repeated query parameters, invalid pagination, unsupported fields, or invalid input. Writes reject all query parameters." },
    { name: "401 Unauthorized", type: "error", description: "Missing, invalid, expired, or revoked server API key." },
    { name: "403 Forbidden", type: "error", description: "Missing required scope, inaccessible organization, credential restriction, browser credential, or incomplete live onboarding." },
    { name: "404 Not Found", type: "error", description: "Resource does not exist or is inaccessible in this partner, organization, and environment." },
    ...(writing ? [
      { name: "409 Conflict", type: "error / problem", description: "Conflicting resource state, linked records preventing deletion, an operation in progress, or an Idempotency-Key reused with different input. Reconcile uncertain operations before retrying." },
    ] : []),
    ...(hasBody ? [
      { name: "413 Content Too Large", type: "error", description: attachment ? "JSON body exceeds 38 MiB or decoded PDF exceeds 25 MiB." : "Request body exceeds 32 KiB." },
      { name: "415 Unsupported Media Type", type: "error", description: attachment || submission ? "Use Content-Type: application/json." : "Use application/json or application/x-www-form-urlencoded." },
    ] : []),
    ...(validation422 ? [{ name: "422 Unprocessable Entity", type: "error / errors", description: "Invalid resource fields, filters, or operation requirements. See the endpoint-specific conditions below." }] : []),
    { name: "429 Too Many Requests", type: "error", description: "Credential rate limit exceeded." },
    { name: "500 Internal Server Error", type: "error", description: "Unexpected failure. The error message is sanitized." },
    ...(submission ? [{ name: "502 Bad Gateway", type: "error", description: "Native submission failed or did not reach a queued/submitted state. Check the bill before retrying." }] : []),
  ];

  return (
    <DocPage eyebrow="daisyBill compatibility" title={endpoint.title} description={endpoint.summary}
      toc={[
        { id: "authentication", label: "Authentication" },
        ...(endpoint.pathFields.length ? [{ id: "path-parameters", label: "Path parameters" }] : []),
        ...(endpoint.queryFields.length ? [{ id: "query-parameters", label: "Query parameters" }] : []),
        { id: "request-body", label: "Request body" },
        { id: "request-example", label: "Request example" },
        { id: "response", label: "Response" },
        { id: "behavior", label: "Behavior and limits" },
        { id: "errors", label: "Errors" },
      ]}
      previous={previous ? { href: `${compatDocsPath}/${previous.slug}`, label: previous.title } : { href: compatDocsPath, label: "Compatibility guide" }}
      next={next ? { href: `${compatDocsPath}/${next.slug}`, label: next.title } : undefined}>
      <p><Link href={`${compatDocsPath}#endpoints`}>All compatibility endpoints</Link></p>
      <div className="api-method-path" aria-label={`${endpoint.method} ${endpoint.path}`}>
        <span className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
        <code>{compatBaseUrl}{endpoint.path}</code>
      </div>

      <h2 id="authentication">Authentication</h2>
      <SchemaTable fields={[
        { name: "Authorization", type: "header", required: true, description: "Bearer YOUR_MINDBILL_API_KEY. Use a server key from the developer console; browser sessions are not accepted." },
        { name: "X-MindBill-Org-Id", type: "header", description: "Required for a key with access to multiple organizations; omit for a key bound to one organization. Use the MindBill organization ID." },
        ...(hasBody ? [{ name: "Content-Type", type: "header", required: true, description: attachment || submission ? "application/json" : "application/json (shown below) or application/x-www-form-urlencoded with Rails-style nested fields." }] : []),
        ...(writing ? [{ name: "Idempotency-Key", type: "header", description: "Optional; recommended for safe retries. Reuse the same key only for the same operation and input. Without it, repeated creates may create duplicates. Completed replays return Idempotent-Replayed: true.", constraint: "Trimmed, nonempty string; maximum 255 characters" }] : []),
      ]} />
      <p>Required scope: <code>{endpoint.scope}</code>. Sandbox and live use this URL; the API key selects the environment. The examples use synthetic data. Start with a sandbox key.</p>

      {endpoint.pathFields.length ? <><h2 id="path-parameters">Path parameters</h2><SchemaTable fields={endpoint.pathFields} /></> : null}
      {endpoint.queryFields.length ? <><h2 id="query-parameters">Query parameters</h2><SchemaTable fields={endpoint.queryFields} /><p>All are optional. Unknown and repeated query parameters are rejected. Empty collections return an empty array.</p></> : null}

      <h2 id="request-body">Request body</h2>
      {hasBody ? <>
        <p>{submission ? "Send a flat JSON object; there is no bill_submission envelope." : <>Wrap the fields in <code>{endpoint.resource.singular}</code>. Unknown fields are rejected.</>} {endpoint.method === "PATCH" ? "Only send fields to change. Fields marked nullable accept null; omission preserves the saved value." : "Required fields are marked below. Optional fields may be omitted."} Maximum body: {attachment ? "38 MiB (25 MiB decoded PDF)" : "32 KiB"}.</p>
        <SchemaTable fields={endpoint.requestFields} />
      </> : <p>No request body. {writing ? "Do not add query parameters." : "Send the path and supported query parameters only."}</p>}

      <h2 id="request-example">Request example</h2>
      <p>Set <code>MINDBILL_API_KEY</code>{writing ? <> and a new <code>IDEMPOTENCY_KEY</code> for this operation</> : null}. Replace example route IDs with IDs returned by your compatibility API. Add <code>X-MindBill-Org-Id</code> if your key accesses multiple organizations.</p>
      {attachment ? <Callout title="Synthetic PDF example">The example contains a valid, synthetic one-page PDF encoded as standard base64. Replace it with your report bytes for your own integration.</Callout> : null}
      <CodeBlock code={compatCurl(endpoint)} language="bash" filename="Request · cURL" />
      {endpoint.requestExample ? <CodeBlock code={JSON.stringify(endpoint.requestExample, null, 2)} language="json" filename="Request body · JSON" /> : null}

      <h2 id="response">Response</h2>
      <p><span className="api-status">{endpoint.responseStatus}</span></p>
      {endpoint.responseExample ? <>
        <p>{endpoint.list ? <>The top-level <code>{endpoint.resource.plural}</code> array contains resource objects. The example shows one result.</> : "The response is the resource itself, without a top-level envelope. IDs and timestamps below are illustrative."}</p>
        <CodeBlock code={JSON.stringify(endpoint.responseExample, null, 2)} language="json" filename="Response body · JSON" />
        <SchemaTable fields={endpoint.responseFields} />
      </> : <p>The response has no body. Do not attempt to parse JSON.</p>}
      {endpoint.list ? <><h3>Pagination response headers</h3><CodeBlock language="text" filename="Response headers · one-page result" code={'X-Page: 1\nX-Per-Page: 25\nX-Total-Pages: 1\nX-Prev-Page: \nX-Next-Page: '} /><p>The previous/next header is an empty string when that page does not exist. Page numbers are derived from the effective offset. There is no total-count header.</p></> : null}
      <p>All responses include <code>Cache-Control: no-store</code> and <code>X-Robots-Tag: noindex, nofollow</code>.</p>

      <h2 id="behavior">Behavior and limits</h2>
      <ul style={{ overflowWrap: "anywhere" }}>{endpoint.notes.map(note => <li key={note}>{note}</li>)}</ul>
      {endpoint.method === "POST" && !submission ? <p>Creation is synchronous: the response contains the persisted ID immediately. There is no creation-event polling step.</p> : null}

      <h2 id="errors">Errors</h2>
      <SchemaTable fields={errors} />
      {operationErrors?.length ? <ul style={{ overflowWrap: "anywhere" }}>{operationErrors.map((error, i) => <li key={i}><code>{error.status}</code>: {error.description}</li>)}</ul> : null}
      <p>Typical error body:</p>
      <CodeBlock language="json" filename="Error response · example" code={'{\n  "error": "Resource not found."\n}'} />
      {hasBody && !attachment && !submission ? <><p>Field validation can instead return paths and message arrays:</p><CodeBlock language="json" filename="Field validation · shape" code={JSON.stringify({ errors: { [`${endpoint.resource.singular}.${endpoint.resource.requestFields.find(f => f.required)?.name ?? "field"}`]: [["patient", "bill"].includes(endpoint.resource.key) ? "Invalid or missing value." : "Invalid or unsupported value."] } }, null, 2)} /></> : null}
      <p>Unsupported authorized methods or routes return <code>501</code>.</p>
      {writing ? <><p>Idempotency failures use <code>application/problem+json</code> with <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>, and <code>code</code>. A blank or overlong key returns <code>400 idempotency_key_required</code>; a changed input returns <code>409 idempotency_conflict</code>; an unfinished request returns <code>409 request_in_progress</code>.</p><CodeBlock language="json" filename="Idempotency conflict · 409" code={JSON.stringify({ type: "https://developers.mindbill.org/problems/idempotency_conflict", title: "idempotency_conflict", status: 409, detail: "This key was already used with a different request.", code: "idempotency_conflict" }, null, 2)} /></> : null}
    </DocPage>
  );
}
