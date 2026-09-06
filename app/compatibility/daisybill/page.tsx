import type { Metadata } from "next";
import Link from "next/link";
import { compatDocsPath, compatEndpoints, compatResources } from "@/lib/daisybill-compat-reference";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = {
  title: "daisyBill compatibility API",
  description: "Supported endpoints, payloads, and migration differences for an existing daisyBill integration.",
  alternates: { canonical: "/compatibility/daisybill" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "daisyBill compatibility API · MindBill docs",
    description: "Endpoints, authentication, and differences for an existing daisyBill integration.",
    url: "https://docs.mindbill.org/compatibility/daisybill",
  },
};

// Direct-link reference for existing integrations; keep out of the core API navigation.
export default function DaisybillCompatibilityPage() {
  return (
    <DocPage eyebrow="Compatibility" title="daisyBill compatibility API"
      description="Keep the familiar resource workflow when connecting an existing daisyBill integration to MindBill. Start here for supported endpoints and the changes to make in your client."
      toc={[{"id": "connection-and-authorization", "label": "Connection and authorization"}, {"id": "workflow", "label": "Workflow"}, {"id": "endpoints", "label": "Endpoints"}, {"id": "differences-to-plan-for", "label": "Differences to plan for"}, {"id": "requests-and-responses", "label": "Requests and responses"}, {"id": "supported-fields", "label": "Supported fields"}, {"id": "pdfs-and-submission", "label": "PDFs and submission"}, {"id": "before-switching", "label": "Before switching"}]}>
      <Callout title="A separate compatibility contract">
        These endpoints follow daisyBill&apos;s resource paths and supported payload fields.
        They live under <code>/partner/compat/daisybill/v1</code>, separate from the core
        <code> /partner/v2</code> API. This is the supported subset below, not full daisyBill parity.
      </Callout>
<h2 id="connection-and-authorization">Connection and authorization</h2>
<p>{"Base URL: "}<code>{"https://app.mindbill.org/partner/compat/daisybill/v1"}</code></p>
<p>{"Use an API key issued in the "}<a href="https://platform.mindbill.org">{"MindBill developer console"}</a>{". No separate activation or key rotation is required. Send "}<code>{"Authorization: Bearer YOUR_MINDBILL_API_KEY"}</code>{". Sandbox and live use this same URL; the key selects the environment. Start with a sandbox key and synthetic data."}</p>
<CodeBlock language="bash" code={"curl --fail-with-body \\\n  'https://app.mindbill.org/partner/compat/daisybill/v1/billing_providers' \\\n  -H \"Authorization: Bearer $MINDBILL_API_KEY\""} />
<p>{"For a key bound to one organization, no organization header is needed. For a key with access to multiple organizations, send "}<code>{"X-MindBill-Org-Id"}</code>{" with the MindBill organization ID from your console. Existing revocation, expiry, IP restrictions, rate limits, organization links, environment isolation, and live onboarding checks apply. Use these credentials from your backend. This compatibility API accepts server API keys, not browser embed tokens."}</p>
<div className="data-table networks">
<div className="table-head"><b>{"Operations"}</b><b>{"Required scope"}</b></div>
<div><span>{"Billing provider/location/rendering-provider reads"}</span><span><code>{"orgs:read"}</code></span></div>
<div><span>{"Location/rendering-provider writes"}</span><span><code>{"orgs:write"}</code></span></div>
<div><span>{"Patient/injury reads and writes"}</span><span><code>{"bills:read"}</code>{" / "}<code>{"bills:write"}</code></span></div>
<div><span>{"Draft bill reads and writes; PDF uploads"}</span><span><code>{"bills:read"}</code>{" / "}<code>{"bills:write"}</code></span></div>
<div><span>{"Original bill submission"}</span><span><code>{"bills:submit"}</code></span></div>
<div><span>{"Claims-administrator directory"}</span><span><code>{"payers:read"}</code></span></div>
</div>
<p>{"The default console key includes these scopes. Restricted keys still require the corresponding scope; live keys still require completed live onboarding. Patients, injuries, bills, and attachments are limited to records created through this compatibility API for your partner account, organization, and environment. Configuration is shared organization configuration, as in the core API. The claims-administrator directory is read-only."}</p>

<h2 id="workflow">Workflow</h2>
<ol>
<li>{"Read the billing provider and address; find or create locations and rendering providers."}</li>
<li>{"Find or create a patient, then create an injury containing the claim details."}</li>
<li>{"Create a draft bill. The response contains the saved bill and its numeric ID immediately."}</li>
<li>{"Upload the report and supporting PDFs to that bill."}</li>
<li>{"Create an original bill submission, then GET the bill for its current status."}</li>
</ol>
<p>{"Resource creation is synchronous. There is no creation-event polling step. Submission and payer processing still have asynchronous delivery states; a saved draft or queued submission does not establish payer acceptance."}</p>

<h2 id="endpoints">Endpoints</h2>
<p>Choose a method below for its path and query parameters, request fields and JSON, cURL example, complete response body, and errors. Paths are relative to the compatibility base URL. Updates use PATCH.</p>
{compatResources.map(resource => (
  <section key={resource.key} aria-label={resource.label}>
    <h3>{resource.label}</h3>
    <div className="data-table networks">
      <div className="table-head"><b>Method</b><b>Endpoint reference</b></div>
      {compatEndpoints.filter(endpoint => endpoint.resource.key === resource.key).map(endpoint => (
        <div key={endpoint.slug}><span className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span><span><Link href={`${compatDocsPath}/${endpoint.slug}`}><code>{endpoint.path}</code></Link><br />{endpoint.title}</span></div>
      ))}
    </div>
  </section>
))}
<p>{"There is no separate claims resource in the referenced daisyBill API: claim number, ADJ number, administrator, employer, and diagnosis details belong to the injury. Billing-provider/address writes, attachment downloads/listing, second reviews, independent reviews, event feeds, imports, and arbitrary unsupported operations are outside this contract. Unsupported authorized operations return 501."}</p>

<h2 id="differences-to-plan-for">Differences to plan for</h2>
<ul>
<li>{"Creation returns HTTP "}<code>{"201"}</code>{" with the saved resource and numeric ID immediately. Remove the creation-event polling step; delivery and payer processing remain asynchronous."}</li>
<li>{"Save the IDs returned by this API. daisyBill IDs and MindBill core API IDs are not interchangeable. Existing patients are not imported or matched automatically."}</li>
<li>{"Locations and rendering providers are shared organization configuration, even though collection URLs are nested under a billing provider. Send "}<code>{"active: true"}</code>{" to use new configuration immediately."}</li>
<li>{"Read "}<code>{"billing_address"}</code>{"; "}<code>{"physical_address"}</code>{" is null. Billing-provider/address writes are not included."}</li>
<li>{"Claims are fields on the injury, not a separate "}<code>{"/claims"}</code>{" resource. Select administrator IDs from this API's directory."}</li>
<li>{"This API supports draft edits and a defined set of fields and procedures. Unknown fields are rejected. The field limits below specify what to adapt."}</li>
<li>{"Upload PDFs, then submit the draft in separate requests. The core API's atomic create-and-submit payload and browser embed tokens do not apply to this compatibility base URL."}</li>
</ul>

<h2 id="requests-and-responses">Requests and responses</h2>
<p>{"Ordinary writes accept JSON envelopes named "}<code>{"patient"}</code>{", "}<code>{"injury"}</code>{", "}<code>{"bill"}</code>{", "}<code>{"place_of_service"}</code>{", or "}<code>{"rendering_provider"}</code>{". Rails nested form encoding is also accepted, including numerically indexed nested service lines. Body limit: 32 KiB. Unknown fields are rejected. PATCH preserves omitted fields; optional nullable fields can be cleared explicitly. Required fields cannot be cleared."}</p>
<p>{"POST returns 201 with a raw saved resource and ID; GET/PATCH return 200. Patient and injury deletion returns the previous resource. Location/rendering-provider deletion archives the configuration ("}<code>{"active: false"}</code>{") and returns it. Bill deletion returns 204 with no body. Patient deletion rejects linked injuries/bills; injury deletion rejects linked bills. Bill changes/deletion/uploads reject submitted drafts or financial/submission history. Locations and rendering providers are native shared configuration; archiving does not rewrite historical bills."}</p>
<p>{"Numeric IDs are new stable positive int32 aliases, not imported daisyBill IDs or MindBill core string IDs. Identity includes partner, organization, environment, and resource type. Keep the returned IDs. There is no automatic import or fuzzy matching of existing patients. "}<code>{"practice_internal_id"}</code>{" is searchable, not unique. Adapter timestamps need not advance when records are edited through another MindBill interface."}</p>
<p>{"An optional "}<code>{"Idempotency-Key"}</code>{" protects retries. Use a stable key for every create/upload/submit request. A reused key with different input returns 409. An interrupted operation with uncertain completion stays in processing and requires reconciliation before retry; it is not automatically replayed. Without a key, repeated creates can create duplicates."}</p>
<p>{"Lists return a plural wrapper and "}<code>{"X-Page"}</code>{", "}<code>{"X-Per-Page"}</code>{", "}<code>{"X-Total-Pages"}</code>{", "}<code>{"X-Prev-Page"}</code>{", "}<code>{"X-Next-Page"}</code>{" headers. Default page 1, per_page 25; maximum per_page 100. Offset is supported; combining page and offset is rejected. Unknown/repeated query parameters and query parameters on writes are rejected."}</p>
<p>{"Patient search accepts first_name, last_name, ssn, date_of_birth, and practice_internal_id. Names use case-insensitive exact matching, SSNs ignore dashes, and filters combine with AND. Injury lists accept claim_number and created_at/updated_at ISO date filters. The administrator collection accepts "}<code>{"search"}</code>{"."}</p>
<p>{"Errors are sanitized "}<code>{"{ \"error\": \"...\" }"}</code>{" or "}<code>{"{ \"errors\": { \"field\": [\"...\"] } }"}</code>{". Validation uses 400 or 422, conflicts 409, large bodies 413, unsupported media 415. Concurrent edits, uploads, or submissions for the same bill return 409 while another operation holds the bill. Retry after that operation finishes. Core idempotency failures retain the core problem shape. Responses are no-store/noindex."}</p>

<h2 id="supported-fields">Supported fields</h2>
<ul>
<li>{"Patients: first/last name, gender, birth date, SSN, suffix, middle initial, practice_internal_id, telephone, and nested address. Gender is Male/Female/Unknown or null. Dates are valid ISO dates; SSNs are nine digits with optional dashes. "}<code>{"review_status: passed"}</code>{" means local validation and persistence, not external verification."}</li>
<li>{"Billing providers: name, NPI, telephone and timestamps. Native "}<code>{"billing_address"}</code>{" is exposed as an extension; "}<code>{"physical_address"}</code>{" is null. No tax ID/FEIN, fax, or inferred physical address is exposed. Use "}<code>{"billing_address"}</code>{" for the billing address."}</li>
<li>{"Locations: name, nick_name, county, two-digit place-of-service code, active, and address. Nonempty telephone/NPI/authorization-contact/address_2 inputs are rejected. Shared native locations can appear under multiple providers without duplication. New locations and rendering providers default to inactive; send "}<code>{"active: true"}</code>{" when creating configuration intended for immediate use."}</li>
<li>{"Rendering providers: Person only, structured first/last names, NPI, license, taxonomy, specialty, active. NonPerson/entity_name is unsupported. Existing native full names are not heuristically split; structured names can be null until supplied."}</li>
<li>{"Injuries: description, patient reference, dates, ADJ/claim numbers, state, practice_internal_id, administrator reference, employer name, and valid ICD-10-CM diagnoses. Nonempty payer_id, payer_list_payer_id, WCB claim number, and employer addresses are rejected. Administrator aliases are MindBill directory identities, not daisyBill payer IDs. Ambiguous payer selection can be saved in a draft but must resolve before submission. Diagnosis changes are blocked once bills exist."}</li>
<li>{"Bills: service dates, ICD-10 diagnoses, location/renderer references, authorization number, numeric practice_bill_id, admission date, and service lines. Bill diagnoses must match the injury in the same order. Supported procedures: ML200\u2013ML205 and MLPRR; charges must match MindBill's fee schedule. Up to four supported modifiers and four diagnosis references per line. PATCH replaces the complete supplied line array; nested id/_destroy edits and arbitrary custom charges are unsupported. Native state and amounts are returned. Draft "}<code>{"review_status: pending"}</code>{" does not certify readiness."}</li>
</ul>

<h2 id="pdfs-and-submission">PDFs and submission</h2>
<p>{"Upload JSON using the official Ruby client's base64 field names:"}</p>
<CodeBlock language="json" code={"{\"attachment\":{\"report_type\":\"09\",\"document_file_name\":\"report.pdf\",\"document_file_content\":\"BASE64_PDF\"}}"} />
<p>{"Only valid, readable, unencrypted PDFs are accepted. Maximum decoded PDF: 25 MiB; maximum JSON body: 38 MiB, accommodating base64 and escaped CRLF line breaks. "}<code>{"report_type"}</code>{" uses native supported PWK report codes. The response contains the saved attachment ID, filename, size and bill link; document_url is null. The upload persists native document records and bytes before acknowledging success."}</p>
<p>{"Original submission accepts a flat JSON body:"}</p>
<CodeBlock language="json" code={"{\"comment\":\"Ready for submission\",\"supporting_document_ids\":[]}"} />
<p>{"The documents already uploaded to the bill are used. Nonempty supporting_document_ids is unsupported. Submission requires native structural validation, valid payer routing, and readable required report bytes. Sandbox follows readiness validation and the native sandbox simulator without sending to a payer. Live dispatch uses the native submission service and existing duplicate/dry-run protections. The response reports actual route ("}<code>{"ebill"}</code>{", "}<code>{"fax"}</code>{", "}<code>{"email"}</code>{", or "}<code>{"mail"}</code>{"), transmission_state, dry_run, livemode, and dispatched. These are intentional differences from daisyBill's mode fields."}</p>

<h2 id="before-switching">Before switching</h2>
<p>{"Test sanitized examples from your current integration in the sandbox, especially billing-address mapping, structured provider names, service-line updates, and charges. Keep your existing daisyBill IDs separate from the IDs returned by MindBill."}</p>
<p>{"Reference: "}<a href="https://dev.daisybill.com/reference">{"daisyBill API documentation"}</a>{"."}</p>
    </DocPage>
  );
}
