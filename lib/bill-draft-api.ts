import type { ApiEndpoint, ApiExample, ApiField, HttpMethod } from "./api-reference";

// Unsent treatment bill drafts (/partner/v2/bill-drafts). Source of truth: the MindBill partner OpenAPI
// contract (listBillDrafts, createBillDraft, getBillDraft, updateBillDraft, deleteBillDraft). All identifiers
// below are synthetic.

const field = (name: string, type: string, description: string, required = false, constraint?: string): ApiField =>
  ({ name, type, description, required, ...(constraint ? { constraint } : {}) });

type ExampleInput = { method: HttpMethod; path: string; body?: unknown; idempotencyKey?: string };

function examples({ method, path, body, idempotencyKey }: ExampleInput): ApiExample[] {
  const lines = (token: string, origin: boolean) => [
    `curl '${`https://app.mindbill.org/partner/v2${path}`}'`,
    method === "GET" ? null : `  --request ${method}`,
    `  --header "Authorization: Bearer ${token}"`,
    origin ? "  --header 'Origin: https://your-app.example'" : null,
    idempotencyKey ? `  --header 'Idempotency-Key: ${idempotencyKey}'` : null,
    body === undefined ? null : "  --header 'Content-Type: application/json'",
    body === undefined ? null : `  --data '${JSON.stringify(body, null, 2)}'`,
  ].filter(Boolean).join(" \\\n");
  return [
    { label: "Server", language: "bash", filename: "Server API key", code: lines("$MINDBILL_API_KEY", false) },
    { label: "Browser session", language: "bash", filename: "Browser session", code: lines("$MINDBILL_BROWSER_TOKEN", true) },
  ];
}

const access = (serverScope: string, browserPermission: string) => [`Server: ${serverScope}`, `Browser: ${browserPermission}`];

const draftAccess = {
  title: "Treatment access",
  body: "Requires the organization's treatmentBilling capability; otherwise the API returns 403 with problem code treatment_billing_not_enabled. Browser sessions must be organization-wide (bill-scoped sessions are rejected) and are bound to their exact allowed Origin. Drafts are visible only to the integration, organization, and environment that saved them.",
};

const neverSent = {
  title: "A draft is not a bill",
  body: "Saving a draft validates nothing for submission, prices nothing as final, transmits nothing, and creates no bill. Drafts do not appear in bill lists, events, or usage. Submit one through POST /bills with draft: { id, revision }.",
};

const draftId = field("draftId", "string", "Bill draft identifier returned when the draft was saved.", true, "1–255 characters");

const encounterFields = (prefix: string): ApiField[] => [
  field(`${prefix}.renderingProviderId`, "string", "Saved rendering provider used to price the visit with POST /fee-quotes/encounter."),
  field(`${prefix}.placeOfServiceId`, "string", "Saved service location used for pricing."),
  field(`${prefix}.billingProviderId`, "string", "Saved billing provider; the organization default applies when omitted."),
  field(`${prefix}.claimId`, "string", "Saved claim whose claims administrator and prior therapy visits apply to pricing."),
];

const draftResponseFields: ApiField[] = [
  field("data.id", "string", "Stable draft identifier.", true),
  field("data.externalId", "string | null", "Your reference supplied when the draft was created.", true),
  field("data.status", '"draft" | "submitting" | "submitted"', "draft is editable. submitting means a POST /bills holds it. submitted is final and carries submittedBillId.", true),
  field("data.revision", "integer", "Current revision. Send it as expectedRevision to update or delete, and as draft.revision to submit.", true),
  field("data.claimId / data.patientId", "string | null", "Existing claim and patient IDs referenced by the saved bill, when present."),
  field("data.bill", "object", "The bill input exactly as saved. It may be incomplete.", true),
  field("data.encounter", "BillDraftEncounter | null", "Saved IDs used to price the draft."),
  field("data.serviceLineCount", "integer", "Number of saved service lines."),
  field("data.submittedBillId", "string | null", "The bill created from this draft once submitted."),
  field("data.createdAt / data.updatedAt", "string", "ISO 8601 timestamps.", true),
  field("data.submittedAt", "string | null", "When the draft became submitted."),
];

const draftBill = {
  billingMode: "professional",
  claim: { id: "clm_example" },
  patient: { id: "pat_example" },
  service: { date: "2026-10-08" },
  diagnoses: ["M54.50"],
  serviceLines: [{ code: "99213", units: 1, charge: 150, diagnosisPointers: [1] }],
};

const draftExample = (revision: number, status = "draft", extra: Record<string, unknown> = {}) => JSON.stringify({
  data: {
    id: "billdraft_example",
    externalId: "visit_2026_10_08_example",
    status,
    revision,
    claimId: "clm_example",
    patientId: "pat_example",
    bill: revision > 1
      ? { ...draftBill, serviceLines: [...draftBill.serviceLines, { code: "97110", units: 2, charge: 120, diagnosisPointers: [1] }] }
      : draftBill,
    encounter: { renderingProviderId: "rp_example", placeOfServiceId: "loc_example", claimId: "clm_example" },
    serviceLineCount: revision > 1 ? 2 : 1,
    submittedBillId: null,
    createdAt: "2026-10-08T17:02:11.000Z",
    updatedAt: revision > 1 ? "2026-10-08T17:20:45.000Z" : "2026-10-08T17:02:11.000Z",
    submittedAt: null,
    ...extra,
  },
}, null, 2);

const errorsNote = (codes: string) => ({ title: "Errors", body: codes });

export const billDraftEndpoints: ApiEndpoint[] = [
  {
    slug: "list-bill-drafts", group: "Bills", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "GET", path: "/bill-drafts",
    title: "List bill drafts",
    summary: "List unsent treatment bill drafts saved by this integration in the organization and environment.",
    useWhen: "Show a biller their saved, unsent treatment bills (for example on a claim page) so they can resume one. Submitted drafts are omitted unless status=submitted.",
    permissions: access("bills:read", "bills:read"),
    queryFields: [
      field("claimId", "string", "Only drafts that reference this saved claim.", false, "1–255 characters"),
      field("status", '"draft" | "submitted"', "draft returns only editable drafts; submitted returns drafts that became bills. Without a filter, every unsubmitted draft is returned, including one a submission currently holds.", false, "Default: all unsubmitted"),
      field("limit", "integer", "Page size.", false, "1–100; default 50"),
      field("cursor", "string", "nextCursor from the previous page. Keep the other filters unchanged."),
    ],
    responseFields: [
      field("data", "BillDraft[]", "Drafts in this page, oldest ID first. Each has the fields shown on Read a bill draft.", true),
      field("nextCursor", "string | null", "Cursor for the next page, or null when complete.", true),
    ],
    examples: examples({ method: "GET", path: "/bill-drafts?claimId=clm_example&limit=25" }),
    responseExample: `{
  "data": [{
    "id": "billdraft_example",
    "externalId": "visit_2026_10_08_example",
    "status": "draft",
    "revision": 2,
    "claimId": "clm_example",
    "patientId": "pat_example",
    "bill": { "billingMode": "professional", "service": { "date": "2026-10-08" }, "serviceLines": [{ "code": "99213", "units": 1, "charge": 150 }] },
    "encounter": { "renderingProviderId": "rp_example", "placeOfServiceId": "loc_example", "claimId": "clm_example" },
    "serviceLineCount": 1,
    "submittedBillId": null,
    "createdAt": "2026-10-08T17:02:11.000Z",
    "updatedAt": "2026-10-08T17:20:45.000Z",
    "submittedAt": null
  }],
  "nextCursor": null
}`,
    notes: [draftAccess, neverSent],
  },
  {
    slug: "create-bill-draft", group: "Bills", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "POST", path: "/bill-drafts",
    title: "Save a bill draft",
    summary: "Save a treatment bill as entered so far, which may be incomplete, without validating or sending it.",
    useWhen: "Call when the biller presses Save draft. Store the returned id and revision with your visit so the bill can be resumed, edited, or submitted later.",
    permissions: access("bills:write", "bills:create"),
    idempotent: true,
    requestFields: [
      field("externalId", "string", "Your stable reference for this draft, such as a visit ID. Unique per integration, organization, and environment; reuse returns 409 external_id_owned.", false, "1–255 characters"),
      field("bill", "object", "BillCreate input as entered so far: any subset of the create-bill bill object. Existing patient.id and claim.id values must belong to the organization.", true, "Up to 256 KB"),
      field("encounter", "BillDraftEncounter", "Saved IDs used to price the draft with POST /fee-quotes/encounter."),
      ...encounterFields("encounter"),
    ],
    responseFields: draftResponseFields,
    examples: examples({
      method: "POST", path: "/bill-drafts", idempotencyKey: "visit_2026_10_08_example-draft",
      body: {
        externalId: "visit_2026_10_08_example",
        bill: draftBill,
        encounter: { renderingProviderId: "rp_example", placeOfServiceId: "loc_example", claimId: "clm_example" },
      },
    }),
    responseStatus: "201 Created",
    responseExample: draftExample(1),
    notes: [
      draftAccess,
      neverSent,
      errorsNote("409 external_id_owned when another draft already uses externalId. 404 patient_not_found or claim_not_found when a referenced ID is not in the organization. 422 validation_error for an unknown property or an oversized bill."),
    ],
  },
  {
    slug: "get-bill-draft", group: "Bills", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "GET", path: "/bill-drafts/{draftId}",
    title: "Read a bill draft",
    summary: "Read a saved draft, its current revision, and its status.",
    useWhen: "Load a draft to resume editing, or check whether it became a bill (status submitted with submittedBillId).",
    permissions: access("bills:read", "bills:read"),
    pathFields: [draftId],
    responseFields: draftResponseFields,
    examples: examples({ method: "GET", path: "/bill-drafts/billdraft_example" }),
    responseExample: draftExample(3, "submitted", { submittedBillId: "bill_example", submittedAt: "2026-10-08T17:31:02.000Z", updatedAt: "2026-10-08T17:31:02.000Z" }),
    notes: [draftAccess, errorsNote("404 bill_draft_not_found when the draft does not exist for this integration, organization, and environment.")],
  },
  {
    slug: "update-bill-draft", group: "Bills", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "PATCH", path: "/bill-drafts/{draftId}",
    title: "Replace a bill draft",
    summary: "Replace the saved bill (and optionally its pricing IDs) at the draft's current revision.",
    useWhen: "Call on each later Save draft. Send the complete bill as entered; it replaces the saved bill rather than merging with it.",
    permissions: access("bills:write", "bills:create"),
    idempotent: true,
    pathFields: [draftId],
    requestFields: [
      field("expectedRevision", "integer", "The draft's current revision from your last read or save.", true, "≥ 1"),
      field("bill", "object", "The complete bill input as entered so far. Replaces the saved bill.", true, "Up to 256 KB"),
      field("encounter", "BillDraftEncounter | null", "Replaces the saved pricing IDs. Omit to keep them; send null to clear them."),
      ...encounterFields("encounter"),
    ],
    responseFields: draftResponseFields,
    examples: examples({
      method: "PATCH", path: "/bill-drafts/billdraft_example", idempotencyKey: "billdraft_example-rev-1",
      body: {
        expectedRevision: 1,
        bill: { ...draftBill, serviceLines: [...draftBill.serviceLines, { code: "97110", units: 2, charge: 120, diagnosisPointers: [1] }] },
      },
    }),
    responseExample: draftExample(2),
    notes: [
      draftAccess,
      errorsNote("409 bill_draft_revision_conflict when expectedRevision is stale: reload the draft and apply the change again. 409 bill_draft_not_editable when the draft is being submitted or was submitted. 404 bill_draft_not_found."),
    ],
  },
  {
    slug: "delete-bill-draft", group: "Bills", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    method: "DELETE", path: "/bill-drafts/{draftId}",
    title: "Delete a bill draft",
    summary: "Delete an unsent draft at its current revision.",
    useWhen: "Discard a saved draft the biller no longer needs. Submitted drafts cannot be deleted; they remain as the record of their bill.",
    permissions: access("bills:write", "bills:create"),
    idempotent: true,
    pathFields: [draftId],
    queryFields: [field("expectedRevision", "integer", "The draft's current revision.", true, "≥ 1")],
    responseFields: [
      field("data.id", "string", "The deleted draft.", true),
      field("data.deleted", "true", "Always true on success.", true),
    ],
    examples: examples({ method: "DELETE", path: "/bill-drafts/billdraft_example?expectedRevision=2", idempotencyKey: "billdraft_example-delete" }),
    responseExample: `{ "data": { "id": "billdraft_example", "deleted": true } }`,
    notes: [
      draftAccess,
      errorsNote("409 bill_draft_revision_conflict for a stale expectedRevision. 409 bill_draft_not_editable when the draft is being submitted or was submitted. 404 bill_draft_not_found."),
    ],
  },
];
