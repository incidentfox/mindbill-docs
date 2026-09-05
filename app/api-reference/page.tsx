import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { EndpointList } from "@/components/api-reference";
import { apiEndpoints, endpointGroups } from "@/lib/api-reference";

export const metadata: Metadata = { title: "REST API reference" };

const authenticate = `curl https://app.mindbill.org/partner/v2/bills \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"`;

const error = `{
  "type": "about:blank",
  "title": "The request body is invalid.",
  "status": 422,
  "code": "validation_error",
  "detail": "Complete the required bill fields and submit again.",
  "errors": [
    { "path": "bill.renderingProvider.taxonomy", "message": "Required" },
    { "path": "bill.diagnoses", "message": "Add at least one ICD-10 code" }
  ]
}`;

export default function ApiReferencePage() {
  return (
    <DocPage
      eyebrow="API reference"
      title="REST API"
      description="Create and submit workers’ compensation bills, then manage documents, status, payer responses, payments, and reviews through one versioned JSON API."
      toc={[
        { id: "conventions", label: "Conventions" },
        ...endpointGroups.map((group) => ({ id: group.toLowerCase(), label: group })),
        { id: "errors", label: "Errors" },
      ]}
      previous={{ href: "/components/angular", label: "Angular components" }}
      next={{ href: "/api-reference/create-bill", label: "Create and submit a bill" }}
    >
      <div className="api-base-url"><small>Base URL</small><code>https://app.mindbill.org/partner/v2</code></div>
      <p>Use the same business endpoints from your server or browser to look up reference data, create and submit bills atomically, and perform allowed lifecycle actions. All resources are isolated to the organization attached to the credential.</p>

      <Callout title="APIs behind the React components">The components use these same endpoints for the <Link href="/api-reference/claims-administrators">claims-administrator directory</Link>, bills, reports, and settings. The <Link href="/api-reference/browser-api">component API inventory</Link> maps each surface to its routes.</Callout>
      <p>The <a href="/openapi.yaml">downloadable OpenAPI contract</a> describes the shared API and the credentials accepted by each operation.</p>
      <h2 id="conventions">Conventions</h2>
      <h3>Authentication</h3>
      <p>Business endpoints accept a server API key or a short-lived browser session as a bearer token. Browser sessions also require the authorized Origin and remain limited by their permissions and bill scope. Session issuance, management sessions, events, and webhook-delivery administration require a server key. See <Link href="/guides/authentication">authentication</Link> for setup and permission rules.</p>
      <CodeBlock code={authenticate} language="bash" filename="Request" />
      <h3>Idempotency</h3>
      <p>For endpoints marked idempotent, send a stable <code>Idempotency-Key</code> on mutations. Reusing a key with the same request safely returns the original result; reusing it with a different request is rejected.</p>
      <Callout title="Create and submit are atomic">The public API has no draft bill. Send the reviewed snapshot, delivery route, and payer packet together. Success creates an immutable bill whose first status is <code>submitted</code>; failure creates no public bill.</Callout>

      {endpointGroups.map((group) => {
        const endpoints = apiEndpoints.filter((endpoint) => endpoint.group === group);
        return <section key={group}><h2 id={group.toLowerCase()}>{group}</h2><EndpointList endpoints={endpoints} /></section>;
      })}

      <h2 id="errors">Errors</h2>
      <p>API errors generally use RFC 9457-style Problem Details. Lookup routes also have endpoint-specific error shapes documented on their reference pages; the diagnosis-code lookup can return an error field with HTTP 200. Use <code>code</code> for program logic and map each <code>errors[].path</code> back to the corresponding form field.</p>
      <CodeBlock code={error} language="json" filename="422 Unprocessable Entity" />
      <div className="term-list compact">
        <div><b>400</b><p>Malformed JSON or an invalid parameter.</p></div>
        <div><b>401</b><p>Missing, expired, or invalid credential.</p></div>
        <div><b>403</b><p>The credential lacks the organization, resource, or role permission.</p></div>
        <div><b>404</b><p>The resource does not exist in the authenticated organization.</p></div>
        <div><b>409</b><p>Lifecycle conflict or idempotency-key reuse with different input.</p></div>
        <div><b>413</b><p>The request body, or the total document bytes on a submission, exceeded the <a href="/guides/documents#limits">size limits</a>.</p></div>
        <div><b>415</b><p>A document was not a valid PDF, or exceeded the 25 MB per-document limit.</p></div>
        <div><b>422</b><p>Bill data failed field or submission validation.</p></div>
        <div><b>429</b><p>Rate limit exceeded; retry with backoff.</p></div>
      </div>
    </DocPage>
  );
}
