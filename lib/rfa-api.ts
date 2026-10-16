import type { ApiEndpoint, ApiExample, ApiField, HttpMethod } from "./api-reference";

// Treatment authorization (RFA) endpoints. Source of truth: the MindBill partner OpenAPI contract.
// All identifiers below are synthetic.

const field = (name: string, type: string, description: string, required = false, constraint?: string): ApiField =>
  ({ name, type, description, required, ...(constraint ? { constraint } : {}) });

const rfaId = field("rfaId", "string", "MindBill RFA identifier.", true);
const billIdField = field("billId", "string", "MindBill bill identifier.", true);

type ExampleInput = { method: HttpMethod; path: string; body?: unknown; idempotencyKey?: string; accept?: string; output?: string };

function examples({ method, path, body, idempotencyKey, accept, output }: ExampleInput): ApiExample[] {
  const lines = (token: string, origin: boolean) => [
    `curl '${`https://app.mindbill.org/partner/v2${path}`}'`,
    method === "GET" ? null : `  --request ${method}`,
    `  --header "Authorization: Bearer ${token}"`,
    origin ? "  --header 'Origin: https://your-app.example'" : null,
    idempotencyKey ? `  --header 'Idempotency-Key: ${idempotencyKey}'` : null,
    accept ? `  --header 'Accept: ${accept}'` : null,
    body === undefined ? null : "  --header 'Content-Type: application/json'",
    body === undefined ? null : `  --data '${JSON.stringify(body, null, 2)}'`,
    output ? `  --output ${output}` : null,
  ].filter(Boolean).join(" \\\n");
  return [
    { label: "Server", language: "bash", filename: "Server API key", code: lines("$MINDBILL_API_KEY", false) },
    { label: "Browser session", language: "bash", filename: "Browser session", code: lines("$MINDBILL_BROWSER_TOKEN", true) },
  ];
}

const access = (serverScope: string, browserPermission: string) => [`Server: ${serverScope}`, `Browser: ${browserPermission}`];

const treatmentAccess = {
  title: "Treatment access",
  body: "Requires the organization's treatmentBilling capability; otherwise the API returns 403 with problem code treatment_billing_not_enabled. Browser sessions must be organization-wide (bill-scoped sessions are rejected) and are bound to their exact allowed Origin.",
};

const pdfNote = { title: "PDF response", body: "A successful response is application/pdf. Save or display the bytes; nothing is stored, signed, or sent by this request." };

const rfaSummary = `{
  "data": {
    "id": "rfa_example",
    "claimId": "clm_example",
    "patientId": "pat_example",
    "renderingProviderId": "rp_example",
    "status": "submitted",
    "lifecycleStatus": "sent",
    "contentRevision": 2,
    "submittedAt": "2026-10-01T17:05:00.000Z",
    "receivedAt": null,
    "decisionDueAt": null,
    "items": [{ "id": "rfaitem_example", "serviceDescription": "Physical therapy", "procedureCode": "97110", "outcome": "pending" }],
    "documents": [], "transmissions": [], "informationRequests": [], "events": []
  }
}`;

export const rfaEndpoints: ApiEndpoint[] = [
  {
    slug: "rfa-creation-context", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "GET", path: "/rfas/creation-context",
    title: "Get RFA creation choices",
    summary: "Search saved patient claims and requesting physicians for a new authorization request.",
    useWhen: "Populate your own patient/claim and physician pickers before the first save of an RFA, or resolve the saved IDs you pass to POST /rfas and POST /fee-quotes/encounter. Read-only.",
    permissions: access("rfas:write", "rfas:create"),
    queryFields: [
      field("search", "string", "Claim search by patient name or claim number.", false, "Up to 200 characters"),
      field("cursor", "string", "Opaque claim cursor from nextCursor. Reset it when search or filters change."),
      field("providerSearch", "string", "Physician search by name or NPI.", false, "Up to 200 characters"),
      field("providerCursor", "string", "Opaque physician cursor from renderingProvidersNextCursor."),
      field("limit", "integer", "Page size for each list.", false, "1–100; default 50"),
      field("claimId", "string", "Restrict choices to one saved claim. The selected claim also returns its employer, date of birth, and adjuster name for the DWC Form RFA."),
      field("renderingProviderId", "string", "Restrict physicians to one saved rendering provider."),
    ],
    responseFields: [
      field("data.claims[]", "object[]", "claimId, patientId, employeeName, claimNumber, dateOfInjury, claimsAdminId, and diagnosisCodes for each matching saved claim.", true),
      field("data.renderingProviders[]", "object[]", "id, name, npi, and specialty for each active rendering provider.", true),
      field("data.nextCursor / renderingProvidersNextCursor", "string | null", "Cursors for the next claim and physician pages.", true),
      field("data.returnFax / returnEmail", "string", "The organization's managed return channels for utilization review responses, when configured."),
    ],
    examples: examples({ method: "GET", path: "/rfas/creation-context?search=Example&limit=25" }),
    responseExample: `{
  "data": {
    "claims": [{ "claimId": "clm_example", "patientId": "pat_example", "employeeName": "Alex Example", "claimNumber": "SYN-0001", "dateOfInjury": "2026-08-01", "diagnosisCodes": ["M54.50"] }],
    "renderingProviders": [{ "id": "rp_example", "name": "Sample Physician, MD", "npi": "1234567893" }],
    "nextCursor": null,
    "renderingProvidersNextCursor": null
  }
}`,
    notes: [treatmentAccess, { title: "Canonical route", body: "This route replaces the legacy /partner/v2/browser/rfas/creation-context alias. @mindbill/browser 0.51.0 getCreationContext() calls the canonical route and unwraps data." }],
  },
  {
    slug: "rfa-provider-signature", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/providers/{providerId}/signature", idempotent: true,
    title: "Save a physician signature",
    summary: "Store an authorized PNG signature for an active rendering provider, with an attestation.",
    useWhen: "Run once per physician from an administrator setup screen before that physician signs RFAs. This does not sign any request; each generated form is reviewed and signed separately.",
    permissions: ["Server: rfas:sign", "Browser: rfas:sign + organization:manage"],
    pathFields: [field("providerId", "string", "Saved rendering provider identifier.", true)],
    requestFields: [
      field("contentBase64", "string", "Canonical base64 PNG without a data-URL prefix.", true, "Decoded ≤ 512 KiB, ≤ 4096 px per side, ≤ 4 million pixels"),
      field("physicianAuthorized", "true", "Confirms the physician authorized this signature for RFA use.", true),
      field("actorReference", "string", "Stable identifier of the authenticated human saving the signature. Never an API key.", true, "1–200 characters"),
    ],
    responseFields: [
      field("data.providerId", "string", "The provider whose signature was saved.", true),
      field("data.signatureConfigured", "true", "Always true on success.", true),
    ],
    examples: examples({ method: "POST", path: "/rfas/providers/rp_example/signature", idempotencyKey: "signature-rp_example-1", body: { contentBase64: "iVBORw0KGgo...", physicianAuthorized: true, actorReference: "user_example" } }),
    responseExample: `{ "data": { "providerId": "rp_example", "signatureConfigured": true } }`,
    notes: [treatmentAccess, { title: "Canonical route", body: "Replaces the legacy /partner/v2/browser/rfas/providers/{providerId}/signature alias. Browser sessions also need organization:manage and must be organization-wide." }],
  },
  {
    slug: "rfa-draft-preview", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/draft-preview",
    title: "Preview the DWC Form RFA from a draft",
    summary: "Fill the official DWC Form RFA from an unsaved request and return the unsigned PDF.",
    useWhen: "Show the user the form as typed so far, before saving. No field is required and nothing is saved, signed, or sent.",
    permissions: access("rfas:write", "rfas:create"),
    requestFields: [
      field("claimId / patientId / renderingProviderId / claimsAdminId", "string", "Saved records to fill from. A claimId must be one the caller can use."),
      field("requestType / expedited / rationale", "string / boolean / string", "Request details printed on the form."),
      field("requestingPractice / authorizationContact", "object", "Optional practice and contact overrides."),
      field("items[]", "object[]", "Treatments: diagnosisCode, diagnosisDescription, serviceDescription, procedureCode, quantity, frequency, duration.", false, "Up to 100 items; body ≤ 500 KB"),
    ],
    responseFields: [],
    examples: examples({ method: "POST", path: "/rfas/draft-preview", output: "rfa-draft-preview.pdf", body: { claimId: "clm_example", patientId: "pat_example", renderingProviderId: "rp_example", items: [{ diagnosisCode: "M54.50", diagnosisDescription: "Low back pain", serviceDescription: "Physical therapy", procedureCode: "97110", quantity: 8, frequency: "2x/week", duration: "4 weeks" }] } }),
    responseLanguage: "text", responseExample: "200 OK\nContent-Type: application/pdf\n\n<unsigned DWC Form RFA without the instructions page>",
    notes: [treatmentAccess, pdfNote, { title: "SDK", body: "createRfaClient().previewDraft(draft) returns a Blob. RfaDashboard with officialForm uses it automatically for its Preview action." }],
  },
  {
    slug: "rfa-form-preview", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "GET", path: "/rfas/{rfaId}/form-preview",
    title: "View the DWC Form RFA or fax packet",
    summary: "Return the signed form (or an unsigned preview), or the whole packet in transmitted order.",
    useWhen: "Open the current form for review, or with packet=1 the full packet: cover sheet, form without its instructions page, then clinical and supporting documents. Read-only.",
    permissions: access("rfas:read", "rfas:read"),
    pathFields: [rfaId],
    queryFields: [field("packet", '"1"', "Return the complete fax packet instead of the form alone.")],
    responseFields: [],
    examples: examples({ method: "GET", path: "/rfas/rfa_example/form-preview?packet=1", output: "rfa-packet.pdf" }),
    responseLanguage: "text", responseExample: "200 OK\nContent-Type: application/pdf\n\n<signed form, or unsigned preview when the current revision is unsigned>",
    notes: [treatmentAccess, pdfNote, { title: "Limits and SDK", body: "Responses are at most 20 MB. createRfaClient().previewForm(rfaId, { packet: true }) returns a Blob." }],
  },
  {
    slug: "rfa-response-reading", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/{rfaId}/response-reading",
    title: "Read a UR response",
    summary: "Propose per-treatment decisions from an attached utilization review response. Saves nothing.",
    useWhen: "After a UR response is attached as a ur_response document, prefill your decision form. A person must check the proposal and record it with POST /rfas/{rfaId}/decisions.",
    permissions: access("rfas:write", "rfas:act"),
    pathFields: [rfaId],
    requestFields: [field("documentId", "string", "A ur_response document attached to this RFA.", true)],
    responseFields: [
      field("data.status", '"read" | "unreadable"', "unreadable means no text could be read; enter the decision manually.", true),
      field("data.reason", '"no_text" | "model_unavailable" | "model_answer_invalid"', "Why the response was unreadable."),
      field("data.decidedAt", "string", "Decision date found in the response, YYYY-MM-DD."),
      field("data.items[]", "object[]", "One proposal per still-pending treatment: itemId, outcome (approved, modified, denied, not_addressed), confident, authorizationNumber, authorizedProcedureCode, authorizedQuantity, authorizedUnits, effectiveFrom, effectiveTo, decisionReason, reviewerName, reviewerPhone.", true),
    ],
    examples: examples({ method: "POST", path: "/rfas/rfa_example/response-reading", body: { documentId: "rfadoc_example" } }),
    responseExample: `{
  "data": {
    "status": "read",
    "decidedAt": "2026-10-08",
    "items": [{
      "itemId": "rfaitem_example",
      "outcome": "approved",
      "confident": true,
      "authorizationNumber": "SYN-AUTH-001",
      "authorizedProcedureCode": "97110",
      "authorizedQuantity": 8,
      "effectiveFrom": "2026-10-08",
      "effectiveTo": "2026-11-08"
    }]
  }
}`,
    notes: [treatmentAccess, { title: "A proposal, not a decision", body: "Results are cached per document. Treat confident=false items as requiring manual review. Nothing changes until an authorized user records decisions. createRfaClient().readResponse(rfaId, documentId) returns data." }],
  },
  {
    slug: "rfa-related", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "GET", path: "/rfas/related",
    title: "List related bills or RFAs",
    summary: "Bills on the same claim as an RFA, or RFAs on the same claim as a bill.",
    useWhen: "Show cross-links on an RFA page or a bill page. Pass exactly one of rfaId or billId.",
    permissions: access("rfas:read", "rfas:read"),
    queryFields: [
      field("rfaId", "string", "Return bills on this RFA's claim."),
      field("billId", "string", "Return RFAs on this bill's claim."),
    ],
    responseFields: [
      field("claimId", "string", "The shared claim.", true),
      field("hasMore", "boolean", "True when more than 100 related records exist.", true),
      field("data[]", "object[]", "id (bill ID for an rfaId query, RFA ID for a billId query), label, treatments, relationship, status, and serviceDate.", true),
      field("data[].relationship", '"Linked authorization" | "Same injury"', "Linked when a bill line uses one of the request's approved treatments. Linked records sort first.", true),
    ],
    examples: examples({ method: "GET", path: "/rfas/related?rfaId=rfa_example" }),
    responseExample: `{
  "claimId": "clm_example",
  "hasMore": false,
  "data": [
    { "id": "bill_example", "label": "Bill #1042", "treatments": ["Physical therapy"], "relationship": "Linked authorization", "status": "submitted", "serviceDate": "2026-10-12" },
    { "id": "bill_example_2", "label": "Bill #1031", "treatments": ["Office visit"], "relationship": "Same injury", "status": "paid", "serviceDate": "2026-09-30" }
  ]
}`,
    notes: [treatmentAccess, { title: "Scope and SDK", body: "Partner integrations see only their own requests and bills. createRfaRecordsClient().listRelated({ rfaId } | { billId }) calls this route; RelatedAuthorizationRecords renders it." }],
  },
  {
    slug: "bill-ur-decisions", group: "Authorizations", authentication: "api-key-or-browser-session",
    method: "GET", path: "/bills/{billId}/ur-decisions",
    title: "List UR decisions for a bill",
    summary: "Every recorded utilization review decision on the bill's patient and claim, plus linked authorizations.",
    useWhen: "Show which authorizations support a treatment bill and which decision letters are attached to it.",
    permissions: access("bills:read", "bills:read"),
    pathFields: [billIdField],
    responseFields: [
      field("data.editable", "boolean", "True only while the bill is unsent.", true),
      field("data.decisions[]", "object[]", "documentId, rfaId, filename, decidedAt, treatments, attached (already on the bill), and matchesBill (authorizes a billed procedure on a billed date).", true),
      field("data.linked[]", "object[]", "Each RFA linked to a service line, with the attachment state of its signed form and decision.", true),
    ],
    examples: examples({ method: "GET", path: "/bills/bill_example/ur-decisions" }),
    responseExample: `{
  "data": {
    "editable": true,
    "decisions": [{
      "documentId": "rfadoc_example",
      "rfaId": "rfa_example",
      "filename": "ur-decision.pdf",
      "decidedAt": "2026-10-08T17:00:00.000Z",
      "treatments": [{ "service": "Physical therapy", "code": "97110", "outcome": "approved", "authorizationNumber": "SYN-AUTH-001" }],
      "attached": false,
      "matchesBill": true
    }],
    "linked": [{ "rfaId": "rfa_example", "rfaItemId": "rfaitem_example", "form": { "state": "attached" }, "decision": { "state": "attached" } }]
  }
}`,
    notes: [{ title: "SDK", body: "createRfaRecordsClient().listBillUrDecisions(billId) calls this route; BillUrDecisions renders it. Bill-scoped browser sessions for this bill are accepted." }],
  },
  {
    slug: "attach-bill-ur-decisions", group: "Authorizations", authentication: "api-key-or-browser-session",
    method: "POST", path: "/bills/{billId}/ur-decisions",
    title: "Attach UR decisions to a bill",
    summary: "Copy chosen decision letters onto an unsent bill, or retry attaching every linked authorization.",
    useWhen: "Let a biller add utilization review evidence to a treatment bill before it is sent. Safe to repeat; nothing is sent.",
    permissions: access("bills:write", "bills:act"),
    pathFields: [billIdField],
    requestFields: [
      field("documentIds", "string[]", "Decision letters to copy onto the bill as supporting documents. Send this or linked.", false, "1–8 items"),
      field("linked", "true", "Retry attaching every linked RFA's signed form and decision. Send this or documentIds."),
    ],
    responseFields: [
      field("data.attached", "integer", "Number of documents newly attached.", true),
      field("data.linked", "object[]", "Linked authorization state after a linked=true retry."),
    ],
    examples: examples({ method: "POST", path: "/bills/bill_example/ur-decisions", body: { documentIds: ["rfadoc_example"] } }),
    responseExample: `{ "data": { "attached": 1 } }`,
    notes: [{ title: "Only before sending", body: "A sent bill returns 409 bill_already_sent. createRfaRecordsClient().attachBillUrDecisions(billId, { documentIds }) calls this route." }],
  },
  {
    slug: "rfa-delivery-preview", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/{rfaId}/delivery-preview", idempotent: true,
    title: "Prepare the RFA packet for delivery",
    summary: "Retain an immutable signed packet for a chosen channel and recipient so the user can review its exact bytes.",
    useWhen: "After signing, prepare the packet, download it with GET /rfas/{rfaId}/packets/{packetId}, and show it to the user before submitting. Preparation does not send and works in sandbox.",
    permissions: access("rfas:write", "rfas:act"),
    pathFields: [rfaId],
    requestFields: [
      field("channel", '"fax" | "email" | "download"', "Delivery channel for the retained packet.", true),
      field("to", "string", "Verified authorization fax in E.164 format, or email address. Not used for download.", false),
      field("recipientName", "string", "Recipient or adjuster name printed on the cover; must match at submission.", false, "1–200 characters"),
      field("message", "string", "Cover message (and email body); must match at submission.", false, "Up to 1,000 characters"),
      field("documentIds", "string[]", "The current signed form and clinical support to include.", true, "2–100 unique IDs"),
    ],
    responseFields: [
      field("data.packetId", "string", "Retained packet identifier.", true),
      field("data.sha256", "string", "Hash of the retained packet bytes; required to submit.", true),
      field("data.contentRevision", "integer", "Signed content revision the packet was built from.", true),
    ],
    examples: examples({ method: "POST", path: "/rfas/rfa_example/delivery-preview", idempotencyKey: "rfa_example-preview-1", body: { channel: "fax", to: "+15555550123", recipientName: "Utilization Review", documentIds: ["rfadoc_form_example", "rfadoc_report_example"] } }),
    responseExample: `{ "data": { "packetId": "rfapkt_example", "sha256": "3f1c…64 hex characters…", "contentRevision": 2 } }`,
    notes: [treatmentAccess, { title: "Limits", body: "Requires one current signed form and clinical support. Packets are at most 20 MB and 500 pages. Preparation never changes receipt clocks." }],
  },
  {
    slug: "rfa-submit", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/{rfaId}/submit", idempotent: true,
    title: "Submit a reviewed RFA",
    summary: "Send exactly the retained packet the user reviewed, by fax or email.",
    useWhen: "Call only after the user reviews the prepared packet and confirms the destination. Any change to the channel, destination, message, signed revision, or documents requires a fresh delivery preview.",
    permissions: access("rfas:write", "rfas:act"),
    pathFields: [rfaId],
    requestFields: [
      field("channel", '"fax" | "email"', "Must match the preview.", true),
      field("to", "string", "Must match the preview.", true),
      field("packetId / sha256", "string", "The reviewed packet and its hash from delivery-preview.", true),
      field("recipientName / message", "string", "Must match the preview when supplied."),
      field("nonBusinessDates", "string[]", "Organization non-business dates (YYYY-MM-DD) used for deadline calculation.", false, "Up to 366"),
    ],
    responseFields: [
      field("data.transmissionId", "string", "The delivery attempt.", true),
      field("data.packetId", "string", "The packet that was sent.", true),
    ],
    examples: examples({ method: "POST", path: "/rfas/rfa_example/submit", idempotencyKey: "rfa_example-submit-1", body: { channel: "fax", to: "+15555550123", packetId: "rfapkt_example", sha256: "<sha256 from delivery-preview>" } }),
    responseExample: `{ "data": { "transmissionId": "rfatx_example", "packetId": "rfapkt_example" } }`,
    notes: [treatmentAccess, { title: "Submitted is not received", body: "Accepted delivery marks the request submitted. Record receipt evidence separately. Sandbox never dispatches. If the outcome is uncertain, reconcile the existing attempt instead of retrying with a new key; an identical retry with the same key only recovers bookkeeping." }],
  },
  {
    slug: "rfa-sent-outside", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/{rfaId}/sent-outside", idempotent: true,
    title: "Record an RFA sent outside MindBill",
    summary: "Mark a request sent when the office faxed, mailed, emailed, or hand-delivered it without MindBill.",
    useWhen: "Allowed while the request was never sent, or while every MindBill attempt failed and nothing was received. No signed form or attachments are required in MindBill.",
    permissions: access("rfas:write", "rfas:act"),
    pathFields: [rfaId],
    requestFields: [
      field("sentAt", "string", "When the office sent it; not in the future.", true, "ISO date-time"),
      field("channel", '"fax" | "mail" | "email" | "manual"', "How it was sent; manual means hand delivery.", true),
      field("destination", "string", "Fax number, address, or email it went to.", false, "Up to 500 characters"),
      field("proofDocumentId", "string", "A document already on the RFA showing what was sent."),
      field("receivedAt", "string", "Known claims administrator receipt time, on or after sentAt. Marks the request received and starts the decision clock.", false, "ISO date-time"),
    ],
    responseFields: [field("data", "Rfa", "The updated RFA.", true)],
    responseStatus: "201 Created",
    examples: examples({ method: "POST", path: "/rfas/rfa_example/sent-outside", idempotencyKey: "rfa_example-outside-1", body: { sentAt: "2026-10-01T17:05:00Z", channel: "fax", destination: "+15555550123" } }),
    responseExample: rfaSummary,
    notes: [treatmentAccess, { title: "Undo", body: "Returns 409 invalid_transition once the request was sent. Undo a recorded outside send with DELETE /rfas/{rfaId}/sent-outside/{transmissionId} while nothing has happened since." }],
  },
  {
    slug: "undo-rfa-sent-outside", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "DELETE", path: "/rfas/{rfaId}/sent-outside/{transmissionId}", idempotent: true,
    title: "Undo an outside send",
    summary: "Restore the request to how it was before an outside send was recorded.",
    useWhen: "Correct a send recorded by mistake. Only for transmissions created by the sent-outside endpoint, and only while there is no later transmission, receipt, information request, or decision.",
    permissions: access("rfas:write", "rfas:act"),
    pathFields: [rfaId, field("transmissionId", "string", "The transmission returned on the RFA's transmissions.", true)],
    responseFields: [field("data", "Rfa", "The restored RFA.", true)],
    examples: examples({ method: "DELETE", path: "/rfas/rfa_example/sent-outside/rfatx_example", idempotencyKey: "rfa_example-outside-undo-1" }),
    responseExample: rfaSummary.replace('"submitted"', '"ready"').replace('"sent"', '"incomplete"').replace('"2026-10-01T17:05:00.000Z"', "null"),
    notes: [treatmentAccess, { title: "Audit history", body: "History keeps both the send and its undo. Otherwise the request returns 409 invalid_transition." }],
  },
  {
    slug: "rfa-forwards", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/{rfaId}/forwards", idempotent: true,
    title: "Forward an RFA",
    summary: "Re-send a retained packet, or compose a forwarded copy with chosen documents, to a fax or email recipient.",
    useWhen: "Send a sent request to an adjuster or another recipient. Give packetId alone to re-send exact bytes; add documentIds to compose a copy with a forward cover sheet that keeps the original sent, received, and due dates.",
    permissions: access("rfas:write", "rfas:act"),
    pathFields: [rfaId],
    requestFields: [
      field("channel", '"fax" | "email"', "Delivery channel.", true),
      field("to", "string", "E.164 fax number or email address.", true),
      field("packetId", "string", "A retained packet of this request. Send packetId, documentIds, or both."),
      field("documentIds", "string[]", "Documents to include: signed form, clinical reports, supporting records, UR responses, or other documents. Saved fax covers and signing previews cannot be forwarded.", false, "Up to 100"),
      field("message / recipientName", "string", "Printed on the forward cover sheet (and in the email body).", false, "1,000 / 200 characters"),
    ],
    responseFields: [
      field("data.transmissionId", "string", "The forward attempt.", true),
      field("data.packetId", "string", "The packet sent: the exact packet for a re-send, or a new packet with source forward for a composed copy.", true),
    ],
    examples: examples({ method: "POST", path: "/rfas/rfa_example/forwards", idempotencyKey: "rfa_example-forward-1", body: { channel: "email", to: "adjuster@example.com", documentIds: ["rfadoc_form_example"], message: "Forwarding the signed request." } }),
    responseExample: `{ "data": { "transmissionId": "rfatx_forward_example", "packetId": "rfapkt_forward_example" } }`,
    notes: [treatmentAccess, { title: "Delivery rules", body: "The request must have been sent and must not be Incomplete. Requires the live environment and enabled delivery for the channel. Forwards preserve original submission, receipt, and review deadlines. A 502 can mean the outcome is uncertain; reconcile before trying again." }],
  },
  {
    slug: "rfa-export", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "GET", path: "/rfas/export",
    title: "Export RFAs as CSV",
    summary: "Export requested treatments and authorization outcomes, one row per treatment item.",
    useWhen: "Give staff a spreadsheet of the filtered request list. Uses the same filters as GET /rfas, without pagination.",
    permissions: access("rfas:read", "rfas:read"),
    queryFields: [
      field("search", "string", "Every word must match an RFA or external ID, patient or physician name, claim number, administrator, status, or treatment."),
      field("patientId / claimId / renderingProviderId", "string", "Saved-record filters."),
      field("status", "RfaStatus", "Raw workflow or aggregate clinical status."),
      field("lifecycleStatus", '"incomplete" | "sent" | "failed" | "received" | "closed" | "canceled"', "Derived delivery lifecycle."),
      field("agingBucket", '"0_5" | "6_14" | "15_30" | "31_plus"', "UTC days since submission for unresolved sent or received RFAs."),
      field("decisionDue", '"overdue" | "next_7_days"', "Requests awaiting a decision by deadline."),
      field("createdFrom / createdTo", "string", "Inclusive UTC creation dates, YYYY-MM-DD."),
    ],
    responseFields: [],
    examples: examples({ method: "GET", path: "/rfas/export?lifecycleStatus=sent&decisionDue=overdue", accept: "text/csv", output: "rfas.csv" }),
    responseLanguage: "text",
    responseExample: "id,injury_id,rendering_provider_id,status,lifecycle_status,created_at,received_at,decision_due_at,decision_deadline_basis,item_id,diagnosis_code,service_description,procedure_code,quantity,units,outcome,decision_closed,decision_closure_reason,authorization_number,authorized_procedure_code,authorized_quantity,authorized_units,effective_from,effective_to\nrfa_example,clm_example,rp_example,submitted,sent,2026-09-30T16:00:00.000Z,,,,rfaitem_example,M54.50,Physical therapy,97110,8,,pending,false,,,,,,,",
    notes: [treatmentAccess, { title: "Limits", body: "Cursors are rejected. More than 50,000 treatment rows returns 413; narrow the filters. Spreadsheet formula cells are neutralized. createRfaClient().exportCsv(filters) returns a Blob." }],
  },
  {
    slug: "rfa-treatment-closure", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "PATCH", path: "/rfas/{rfaId}/items/{itemId}/closure", idempotent: true,
    title: "Close or reopen a requested treatment",
    summary: "Administratively close a pending treatment when a decision is no longer needed, or reopen it.",
    useWhen: "Stop follow-up for a treatment the patient no longer needs. This does not change clinical outcomes, authorization, review clocks, or submitted documents.",
    permissions: access("rfas:write", "rfas:edit"),
    pathFields: [rfaId, field("itemId", "string", "Requested treatment identifier.", true)],
    requestFields: [
      field("closed", "boolean", "true to close, false to reopen.", true),
      field("reason", "string", "Why the decision is no longer required, kept in RFA history.", true, "1–2,000 characters"),
      field("expectedVersion", "integer", "Current closure version; 0 before the first closure.", true),
    ],
    responseFields: [field("data", "Rfa", "The updated RFA detail.", true)],
    examples: examples({ method: "PATCH", path: "/rfas/rfa_example/items/rfaitem_example/closure", idempotencyKey: "rfaitem_example-close-1", body: { closed: true, reason: "Patient declined the treatment.", expectedVersion: 0 } }),
    responseExample: rfaSummary,
    notes: [treatmentAccess, { title: "Eligibility", body: "Only submitted requests with a pending item and no clinical decision are eligible. Stale versions and unchanged dispositions return 409. Webhooks emit rfa.updated with action treatment_closed or treatment_reopened, itemId, and version, without the reason." }],
  },
  {
    slug: "rfa-reconcile-fax", group: "Authorizations", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/rfas/{rfaId}/transmissions/{transmissionId}/reconcile-fax", idempotent: true,
    title: "Reconcile an uncertain fax attempt",
    summary: "Associate an uncertain live fax attempt with the provider's message after verification.",
    useWhen: "Use when a fax attempt's outcome is unknown and you have the fax provider's message ID. It never sends another fax, creates a replacement attempt, establishes receipt, or infers approval.",
    permissions: ["Server: rfas:write (operator role)", "Browser: rfas:act"],
    pathFields: [rfaId, field("transmissionId", "string", "The uncertain transmission.", true)],
    requestFields: [
      field("providerMessageId", "string", "Candidate fax provider message ID to verify.", true, "UUID"),
      field("expectedContentRevision", "integer", "From a fresh RFA read.", true),
      field("expectedUpdatedAt", "string", "From a fresh RFA read.", true, "ISO date-time"),
    ],
    responseFields: [
      field("data.transmissionId", "string", "The reconciled attempt.", true),
      field("data.providerMessageId", "string", "The verified provider message.", true),
      field("data.reconciled", "true", "Always true on success.", true),
    ],
    examples: examples({ method: "POST", path: "/rfas/rfa_example/transmissions/rfatx_example/reconcile-fax", idempotencyKey: "rfatx_example-reconcile-1", body: { providerMessageId: "00000000-0000-4000-8000-000000000000", expectedContentRevision: 2, expectedUpdatedAt: "2026-10-01T17:06:00.000Z" } }),
    responseExample: `{ "data": { "transmissionId": "rfatx_example", "providerMessageId": "00000000-0000-4000-8000-000000000000", "reconciled": true } }`,
    notes: [treatmentAccess, { title: "Verification", body: "MindBill verifies the attempt's dispatch marker, packet hash, sender, recipient, and direction with the provider. Stale or conflicting evidence returns 409 without association. Sandbox requests are rejected. Refresh fax status separately for delivery evidence." }],
  },
];
