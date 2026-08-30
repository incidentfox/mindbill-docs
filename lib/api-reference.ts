export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiField = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  constraint?: string;
};

export type ApiExample = {
  label: string;
  language: string;
  filename: string;
  code: string;
};

export type ApiEndpoint = {
  slug: string;
  group: "Bills" | "Documents" | "Reviews" | "Lifecycle" | "Platform";
  method: HttpMethod;
  path: string;
  title: string;
  summary: string;
  useWhen: string;
  permissions?: string[];
  idempotent?: boolean;
  pathFields?: ApiField[];
  queryFields?: ApiField[];
  requestFields?: ApiField[];
  responseFields: ApiField[];
  examples: ApiExample[];
  responseExample: string;
  responseLanguage?: string;
  responseStatus?: string;
  notes?: Array<{ title: string; body: string }>;
};

const billId: ApiField = {
  name: "billId",
  type: "string",
  required: true,
  description: "The MindBill bill identifier returned when the draft is created.",
};

const documentId: ApiField = {
  name: "documentId",
  type: "string",
  required: true,
  description: "The bill document identifier returned when the file was uploaded.",
};

const reviewId: ApiField = {
  name: "reviewId",
  type: "string",
  required: true,
  description: "The Second Bill Review or Independent Bill Review identifier.",
};

const addressFields: ApiField[] = [
  { name: "patient.address.line1", type: "string", required: true, description: "Street address printed in CMS-1500 box 5." },
  { name: "patient.address.city", type: "string", required: true, description: "Patient city." },
  { name: "patient.address.state", type: "string", required: true, description: "Two-letter state code.", constraint: "2 characters" },
  { name: "patient.address.postalCode", type: "string", required: true, description: "ZIP or ZIP+4 postal code." },
];

const createBillFields: ApiField[] = [
  { name: "externalId", type: "string", description: "Stable report, case, or work-item identifier in your system. Use it to find the bill later." },
  { name: "billingMode", type: '"med_legal" | "professional"', description: "Selects California med-legal rules or professional/treatment billing.", constraint: 'Default: "med_legal"' },
  { name: "patient.externalId", type: "string", description: "Your patient identifier. Do not send this together with patient.id." },
  { name: "patient.firstName", type: "string", required: true, description: "Patient given name." },
  { name: "patient.middleName", type: "string", description: "Patient middle name or initial." },
  { name: "patient.lastName", type: "string", required: true, description: "Patient family name." },
  { name: "patient.dateOfBirth", type: "string", description: "Patient date of birth.", constraint: "YYYY-MM-DD" },
  { name: "patient.ssn", type: "string", description: "Patient Social Security number when the payer requires it." },
  { name: "patient.gender", type: '"M" | "F" | "X"', description: "Patient sex or gender value printed on the claim." },
  { name: "patient.phone", type: "string", description: "Patient phone number." },
  ...addressFields,
  { name: "claim.externalId", type: "string", description: "Your injury or claim identifier. Do not send this together with claim.id." },
  { name: "claim.claimNumber", type: "string", required: true, description: "Workers’ compensation claim number assigned by the payer or administrator." },
  { name: "claim.adjNumber", type: "string", description: "California WCAB/EAMS case number when applicable." },
  { name: "claim.employer", type: "string", description: "Employer name associated with the injury." },
  { name: "claim.dateOfInjury", type: "string", description: "Date of injury. For a cumulative injury, use the final injury date and describe the range separately.", constraint: "YYYY-MM-DD" },
  { name: "claim.injuryState", type: "string", description: "Two-letter state code governing the claim." },
  { name: "claim.description", type: "string", description: "Short injury description." },
  { name: "claim.claimsAdministrator.id", type: "string", description: "MindBill payer-directory identifier, if already resolved." },
  { name: "claim.claimsAdministrator.name", type: "string", description: "Carrier or third-party administrator name. MindBill uses the name and claim pattern to resolve delivery." },
  { name: "service.date", type: "string", required: true, description: "Primary date of service for the bill.", constraint: "YYYY-MM-DD" },
  { name: "service.endDate", type: "string | null", description: "End date only for a service that spans multiple dates.", constraint: "YYYY-MM-DD" },
  { name: "service.authorizationNumber", type: "string | null", description: "Prior authorization number when the payer supplied one." },
  { name: "billingProvider", type: "BillingProviderSnapshot", description: "Payee identity: name, tax ID, billing NPI, phone, and address printed in boxes 25 and 33." },
  { name: "renderingProvider", type: "RenderingProviderSnapshot", description: "Clinician identity: name, NPI, taxonomy, specialty, license, and QME/AME flags." },
  { name: "serviceLocation", type: "ServiceLocationSnapshot", description: "Facility name, address, and place-of-service code printed in box 32." },
  { name: "diagnoses", type: "string[]", description: "ICD-10 diagnosis codes in the order referenced by service-line diagnosis pointers." },
  { name: "serviceLines[].code", type: "string", description: "Procedure or service code, such as ML201 or 99205." },
  { name: "serviceLines[].modifiers", type: "string[]", description: "Procedure modifiers without hyphens." },
  { name: "serviceLines[].units", type: "number", description: "Positive unit count.", constraint: "> 0" },
  { name: "serviceLines[].serviceDate", type: "string", description: "Line-level date of service. Required for professional/treatment billing.", constraint: "YYYY-MM-DD" },
  { name: "serviceLines[].charge", type: "number", description: "Exact billed charge for a professional service line." },
  { name: "serviceLines[].diagnosisPointers", type: "number[]", description: "One-based indexes into diagnoses, matching CMS-1500 box 24E." },
];

const billResponseFields: ApiField[] = [
  { name: "id", type: "string", required: true, description: "Stable MindBill bill identifier." },
  { name: "externalId", type: "string | null", required: true, description: "Your supplied source-system identifier." },
  { name: "state", type: "string", required: true, description: "Current native lifecycle state." },
  { name: "billingMode", type: '"med_legal" | "professional"', required: true, description: "Billing rule set used by the bill." },
  { name: "billNumber", type: "number | null", required: true, description: "Human-readable MindBill bill number when assigned." },
  { name: "patient", type: "PatientSnapshot", required: true, description: "Frozen patient values on this bill." },
  { name: "claim", type: "ClaimSnapshot", required: true, description: "Frozen claim and payer values, including diagnoses." },
  { name: "service", type: "object", required: true, description: "Primary service date, optional end date, and authorization number." },
  { name: "serviceLines", type: "ServiceLine[]", required: true, description: "Procedure lines and calculated allowed amounts." },
  { name: "documents", type: "BillDocument[]", required: true, description: "Documents currently included in the payer packet." },
  { name: "amounts", type: "object", required: true, description: "Charged, paid, and balance amounts." },
];

const createCurl = `curl https://app.mindbill.org/partner/v2/bills \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: report_9f7a" \\
  --data '{
    "externalId": "report_9f7a",
    "billingMode": "med_legal",
    "patient": {
      "externalId": "patient_42",
      "firstName": "Alex",
      "lastName": "Morgan",
      "dateOfBirth": "1984-05-17",
      "address": {
        "line1": "100 Main St",
        "city": "Fresno",
        "state": "CA",
        "postalCode": "93721"
      }
    },
    "claim": {
      "externalId": "claim_17",
      "claimNumber": "WC-44871",
      "employer": "Example Foods",
      "dateOfInjury": "2026-02-14",
      "claimsAdministrator": { "name": "Example Claims Administrator" }
    },
    "service": { "date": "2026-08-26" },
    "diagnoses": ["M25.512"],
    "serviceLines": [{ "code": "ML201", "modifiers": ["95"], "units": 1 }]
  }'`;

const createNode = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

const bill = await mindbill.createBill({
  externalId: "report_9f7a",
  billingMode: "med_legal",
  patient: {
    externalId: "patient_42",
    firstName: "Alex",
    lastName: "Morgan",
    dateOfBirth: "1984-05-17",
    address: {
      line1: "100 Main St",
      city: "Fresno",
      state: "CA",
      postalCode: "93721",
    },
  },
  claim: {
    externalId: "claim_17",
    claimNumber: "WC-44871",
    employer: "Example Foods",
    dateOfInjury: "2026-02-14",
    claimsAdministrator: { name: "Example Claims Administrator" },
  },
  service: { date: "2026-08-26" },
  diagnoses: ["M25.512"],
  serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
}, "report_9f7a");`;

export const apiEndpoints: ApiEndpoint[] = [
  {
    slug: "create-bill",
    group: "Bills",
    method: "POST",
    path: "/bills",
    title: "Create a bill",
    summary: "Create a private bill draft from the CMS-1500 values your product already knows.",
    useWhen: "Use this server-side for API-only workflows, or let a browser session with bills:create call the same operation through a MindBill component.",
    permissions: ["Server API key", "Browser: bills:create"],
    idempotent: true,
    requestFields: createBillFields,
    responseFields: billResponseFields,
    examples: [
      { label: "cURL", language: "bash", filename: "Create a bill", code: createCurl },
      { label: "Node.js", language: "typescript", filename: "create-bill.ts", code: createNode },
    ],
    responseStatus: "201 Created",
    responseExample: `{
  "id": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D",
  "externalId": "report_9f7a",
  "state": "incomplete",
  "billingMode": "med_legal",
  "billNumber": 1038,
  "patient": { "firstName": "Alex", "lastName": "Morgan", "address": { "line1": "100 Main St", "city": "Fresno", "state": "CA", "postalCode": "93721" } },
  "claim": { "claimNumber": "WC-44871", "employer": "Example Foods", "dateOfInjury": "2026-02-14", "diagnoses": ["M25.512"] },
  "service": { "date": "2026-08-26", "endDate": null, "authorizationNumber": null },
  "serviceLines": [{ "id": "line_01", "code": "ML201", "modifiers": ["95"], "units": 1, "allowed": 2015 }],
  "documents": [],
  "amounts": { "charged": 2015, "paid": 0, "balance": 2015 }
}`,
    notes: [
      { title: "Snapshot, not synchronization", body: "Provider, location, patient, and claim values are frozen on the bill. You may keep your own canonical database, use MindBill profiles for repeated values, or mix both approaches." },
      { title: "The bill is still private", body: "Creating a bill does not transmit it. Attach the explicit payer packet, review delivery options, and submit in a separate operation." },
    ],
  },
  {
    slug: "list-bills",
    group: "Bills",
    method: "GET",
    path: "/bills",
    title: "List bills",
    summary: "List bills belonging to the authenticated organization.",
    useWhen: "Use filters to reconcile source records, build receivables views, or recover a bill ID from your external IDs.",
    permissions: ["Server API key", "Browser: bills:read"],
    queryFields: [
      { name: "cursor", type: "string", description: "Opaque cursor returned by the previous page." },
      { name: "limit", type: "number", description: "Maximum records to return." },
      { name: "externalId", type: "string", description: "Filter by your bill/report/work-item identifier." },
      { name: "patientExternalId", type: "string", description: "Filter by your patient identifier." },
      { name: "claimExternalId", type: "string", description: "Filter by your claim or injury identifier." },
      { name: "state", type: "string", description: "Filter by native lifecycle state." },
    ],
    responseFields: [
      { name: "data", type: "Bill[]", required: true, description: "Bills in this page." },
      { name: "nextCursor", type: "string | null", required: true, description: "Cursor for the next page, or null when complete." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "List bills", code: `curl "https://app.mindbill.org/partner/v2/bills?claimExternalId=claim_17&limit=25" \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "data": [{ "id": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D", "externalId": "report_9f7a", "state": "submitted", "amounts": { "charged": 2015, "paid": 0, "balance": 2015 } }],
  "nextCursor": null
}`,
  },
  {
    slug: "get-bill",
    group: "Bills",
    method: "GET",
    path: "/bills/{billId}",
    title: "Retrieve a bill",
    summary: "Read the complete frozen claim snapshot and payer packet for one bill.",
    useWhen: "Use this to reopen a bill editor or inspect the source values behind a status record.",
    permissions: ["Server API key", "Browser: bills:read"],
    pathFields: [billId],
    responseFields: billResponseFields,
    examples: [{ label: "cURL", language: "bash", filename: "Retrieve a bill", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{ "id": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D", "externalId": "report_9f7a", "state": "submitted", "billingMode": "med_legal", "documents": [], "amounts": { "charged": 2015, "paid": 0, "balance": 2015 } }`,
  },
  {
    slug: "update-bill",
    group: "Bills",
    method: "PATCH",
    path: "/bills/{billId}",
    title: "Update a bill",
    summary: "Patch bill values before submission or while correcting a rejected bill.",
    useWhen: "Send only fields that changed. Existing submitted claim snapshots remain immutable unless the lifecycle is in a correction state.",
    permissions: ["Server API key", "Browser: bills:edit"],
    idempotent: true,
    pathFields: [billId],
    requestFields: createBillFields.filter((field) => !["patient.firstName", "patient.lastName", "patient.address.line1", "patient.address.city", "patient.address.state", "patient.address.postalCode", "claim.claimNumber", "service.date"].includes(field.name)).concat([
      { name: "patient", type: "Partial<PatientSnapshot>", description: "Patient fields to update. Address may also be partial." },
      { name: "claim", type: "Partial<ClaimSnapshot>", description: "Claim and payer fields to update." },
      { name: "service", type: "Partial<ServiceSnapshot>", description: "Service fields to update." },
    ]),
    responseFields: billResponseFields,
    examples: [{ label: "cURL", language: "bash", filename: "Update a bill", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID \\
  --request PATCH \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: correction_42" \\
  --data '{ "claim": { "employer": "Example Foods, Inc." } }'` }],
    responseExample: `{ "id": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D", "state": "incomplete", "claim": { "employer": "Example Foods, Inc." }, "amounts": { "charged": 2015, "paid": 0, "balance": 2015 } }`,
  },
  {
    slug: "delivery-options",
    group: "Lifecycle",
    method: "GET",
    path: "/bills/{billId}/delivery-options",
    title: "Get delivery options",
    summary: "Resolve the actual e-bill, fax, mail, and email routes available for this payer.",
    useWhen: "Call this immediately before submission so the user can review the recommended route and intentionally override its destination.",
    permissions: ["Server API key", "Browser: bills:submit"],
    pathFields: [billId],
    responseFields: [
      { name: "payerName", type: "string", required: true, description: "Resolved payer or claims administrator." },
      { name: "recommended", type: "BillDeliveryOption", required: true, description: "Highest-confidence available delivery route." },
      { name: "options", type: "BillDeliveryOption[]", required: true, description: "All available routes. Each includes route, detail, confidence, fallback, and optional destination metadata." },
      { name: "contacts.faxNumber", type: "string", description: "Known payer fax number." },
      { name: "contacts.claimsEmail", type: "string", description: "Known claims billing email." },
      { name: "contacts.portalUrl", type: "string", description: "Known payer portal URL." },
      { name: "contacts.mailingAddress", type: "string", description: "Known physical billing address." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Resolve delivery", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/delivery-options \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "payerName": "Example Claims Administrator",
  "recommended": { "route": "ebill", "label": "E-bill", "detail": "Electronic payer ID 12345", "fallback": false, "confidence": "high", "payerName": "Example Claims Administrator", "payerId": "12345" },
  "options": [
    { "route": "ebill", "label": "E-bill", "detail": "Electronic payer ID 12345", "fallback": false, "confidence": "high", "payerName": "Example Claims Administrator", "payerId": "12345" },
    { "route": "fax", "label": "Fax", "detail": "(213) 555-0199", "fallback": true, "confidence": "medium", "payerName": "Example Claims Administrator", "target": "+12135550199" }
  ],
  "contacts": { "faxNumber": "+12135550199", "mailingAddress": "PO Box 19600, Irvine, CA 92623" }
}`,
    notes: [{ title: "Resolve at submission time", body: "Payer routing can change. Treat saved destinations as hints, not a permanent routing table." }],
  },
  {
    slug: "submit-bill",
    group: "Lifecycle",
    method: "POST",
    path: "/bills/{billId}/submissions",
    title: "Submit a bill",
    summary: "Transmit the reviewed bill and its explicit payer packet.",
    useWhen: "Submit only after the user has reviewed bill values, attachments, and a delivery option. Omitting route uses the recommended option.",
    permissions: ["Server API key", "Browser: bills:submit"],
    idempotent: true,
    pathFields: [billId],
    requestFields: [
      { name: "route", type: '"ebill" | "fax" | "mail" | "email"', description: "Chosen delivery route. Omit to use the current recommendation." },
      { name: "destination.faxNumber", type: "string", description: "Intentional fax override when route is fax." },
      { name: "destination.email", type: "string", description: "Intentional email override when route is email." },
      { name: "destination.mailingAddress", type: "string", description: "Intentional physical-address override when route is mail." },
      { name: "attention", type: "string", description: "Recipient or adjuster name printed on the cover sheet." },
      { name: "subject", type: "string", description: "Email or fax subject override." },
      { name: "note", type: "string", description: "Delivery note retained with the submission." },
    ],
    responseFields: [
      { name: "ok", type: "true", description: "Present on sandbox submissions." },
      { name: "sandbox", type: "true", description: "Indicates simulated delivery in sandbox." },
      { name: "billId", type: "string", description: "Submitted bill identifier." },
      { name: "controlNumber", type: "string", description: "Sandbox transmission control number." },
      { name: "state", type: '"submitted"', description: "Normalized submission state." },
      { name: "acknowledgments", type: "Array<999 | 277CA>", description: "Simulated electronic acknowledgements in sandbox." },
      { name: "bill", type: "Bill", description: "Updated bill on a live submission." },
      { name: "transmissionState", type: "string", description: "Live transmission state." },
      { name: "uploaded", type: "string[]", description: "Documents included in live transmission." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Submit a bill", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/submissions \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: submit_$BILL_ID" \\
  --data '{ "route": "ebill" }'` }],
    responseStatus: "200 OK",
    responseExample: `{
  "ok": true,
  "sandbox": true,
  "billId": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D",
  "controlNumber": "TEST-0001842",
  "state": "submitted",
  "acknowledgments": [
    { "type": "999", "status": "accepted" },
    { "type": "277CA", "status": "accepted" }
  ]
}`,
    notes: [{ title: "Submission is asynchronous after acceptance", body: "A successful request records the transmission. Later acknowledgements, payer responses, EORs, denials, and payments arrive as lifecycle events." }],
  },
  {
    slug: "bill-status",
    group: "Lifecycle",
    method: "GET",
    path: "/bills/{billId}/status",
    title: "Get bill status",
    summary: "Read normalized lifecycle state, balances, and the latest event position.",
    useWhen: "Use this for compact status surfaces or an on-demand refresh. Use events or webhooks for durable synchronization.",
    permissions: ["Server API key", "Browser: bills:read"],
    pathFields: [billId],
    responseFields: [
      { name: "data.billId", type: "string", required: true, description: "Bill identifier." },
      { name: "data.externalId", type: "string | null", required: true, description: "Your source-system identifier." },
      { name: "data.state", type: "string", required: true, description: "Normalized lifecycle state used for UI and automation." },
      { name: "data.nativeStatus", type: "string | null", required: true, description: "More specific payer or internal status when available." },
      { name: "data.totalCharge", type: "number", required: true, description: "Total submitted charge." },
      { name: "data.totalPaid", type: "number", required: true, description: "Total payments posted." },
      { name: "data.balanceDue", type: "number", required: true, description: "Current unpaid balance." },
      { name: "data.lastEventId", type: "string | null", required: true, description: "Latest lifecycle event reflected in this status." },
      { name: "data.updatedAt", type: "string | null", required: true, description: "ISO timestamp of the latest status update." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Get status", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/status \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "data": {
    "billId": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D",
    "externalId": "report_9f7a",
    "state": "processed",
    "nativeStatus": "EOR posted",
    "totalCharge": 2015,
    "totalPaid": 0,
    "balanceDue": 2015,
    "lastEventId": "evt_01J6Z2",
    "updatedAt": "2026-08-29T18:42:11.000Z"
  }
}`,
  },
  {
    slug: "bill-eor",
    group: "Lifecycle",
    method: "GET",
    path: "/bills/{billId}/eor",
    title: "Get the EOR",
    summary: "Read structured Explanation of Review data and source documents.",
    useWhen: "Show the payer decision, line-level allowed and paid amounts, adjustment reasons, and the original EOR PDF when available.",
    permissions: ["Server API key", "Browser: eors:read"],
    pathFields: [billId],
    responseFields: [
      { name: "data.reportedPaid", type: "number | null", required: true, description: "Amount reported by the EOR." },
      { name: "data.totalPaid", type: "number", required: true, description: "Payments currently posted to the bill." },
      { name: "data.balanceDue", type: "number", required: true, description: "Current unpaid balance." },
      { name: "data.lineItems[].code", type: "string", required: true, description: "Procedure code adjudicated by the payer." },
      { name: "data.lineItems[].paid", type: "number", required: true, description: "Amount paid for the line." },
      { name: "data.lineItems[].allowedAmount", type: "number | null", required: true, description: "Payer allowed amount." },
      { name: "data.lineItems[].adjustmentAmount", type: "number | null", required: true, description: "Adjustment amount." },
      { name: "data.lineItems[].reasonCodes", type: "string[]", required: true, description: "CARC/RARC or payer reason codes." },
      { name: "data.documents[].contentUrl", type: "string", required: true, description: "Authorized URL for the original EOR document." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Get EOR", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/eor \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "data": {
    "billId": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D",
    "reportedPaid": 1600,
    "totalPaid": 0,
    "balanceDue": 2015,
    "lineItems": [{ "id": "eor_line_1", "code": "ML201", "paid": 1600, "allowedAmount": 1600, "adjustmentAmount": 415, "patientResponsibility": 0, "reasonCodes": ["CO-45"] }],
    "documents": [{ "id": "doc_eor_1", "filename": "eor.pdf", "contentType": "application/pdf", "addedAt": "2026-08-29T18:42:11.000Z", "contentUrl": "https://app.mindbill.org/..." }]
  }
}`,
  },
  {
    slug: "bill-actions",
    group: "Lifecycle",
    method: "POST",
    path: "/bills/{billId}/actions",
    title: "Perform a bill action",
    summary: "Close, post payment, start correction, or submit a second review from one state-aware operation.",
    useWhen: "Available actions depend on bill state. The React and Angular lifecycle components already render only valid actions.",
    permissions: ["Server API key", "Browser: bills:act"],
    idempotent: true,
    pathFields: [billId],
    requestFields: [
      { name: "action", type: '"close" | "post_payment" | "second_review" | "start_correction"', required: true, description: "Lifecycle action to perform." },
      { name: "reason", type: "string", description: "Required for close and second_review." },
      { name: "amount", type: "number", description: "Payment amount for post_payment." },
      { name: "method", type: '"check" | "eft"', description: "Payment method for post_payment." },
      { name: "checkNumber", type: "string", description: "Optional check number." },
      { name: "depositDate", type: "string", description: "Required payment deposit date.", constraint: "YYYY-MM-DD" },
      { name: "payerClaimControlNumber", type: "string", description: "Required payer claim control number for second_review." },
      { name: "disputedAmount", type: "number", description: "Amount disputed in the second review." },
      { name: "attachmentIds", type: "string[]", description: "Supporting document IDs intentionally included in the second review." },
      { name: "route", type: '"ebill" | "fax" | "mail" | "email"', description: "Optional second-review delivery override." },
    ],
    responseFields: [
      { name: "ok", type: "true", required: true, description: "Action accepted." },
      { name: "replacementBillId", type: "string", description: "New correction bill identifier when start_correction creates one." },
      { name: "data", type: "object | null", required: true, description: "Action-specific result." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Post a payment", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/actions \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: payment_check_4811505" \\
  --data '{
    "action": "post_payment",
    "amount": 1600,
    "method": "check",
    "checkNumber": "4811505",
    "depositDate": "2026-08-29"
  }'` }],
    responseExample: `{ "ok": true, "data": { "amount": 1600, "balanceDue": 415 } }`,
  },
  {
    slug: "documents",
    group: "Documents",
    method: "POST",
    path: "/bills/{billId}/documents",
    title: "Upload a bill document",
    summary: "Add one intentional PDF to the payer billing packet.",
    useWhen: "Default sensible billing documents such as the final report, proof of service, W-9, and required forms. Never silently add medical records.",
    permissions: ["Server API key", "Browser: documents:write"],
    idempotent: true,
    pathFields: [billId],
    requestFields: [
      { name: "file", type: "binary", required: true, description: "Document bytes.", constraint: "multipart/form-data" },
      { name: "filename", type: "string", required: true, description: "Filename shown in packet review." },
      { name: "documentType", type: "BillDocumentType", required: true, description: "final_report, proof_of_service, letter_of_attestation, form_122, return_to_work_voucher, w9, medical_records, appeal, or other." },
      { name: "externalId", type: "string", description: "Your document identifier." },
      { name: "description", type: "string", description: "Human-readable packet description." },
    ],
    responseFields: [
      { name: "data.id", type: "string", required: true, description: "MindBill document identifier." },
      { name: "data.documentType", type: "BillDocumentType", required: true, description: "Document classification." },
      { name: "data.filename", type: "string", required: true, description: "Stored filename." },
      { name: "data.contentUrl", type: "string", required: true, description: "Authorized content URL." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Attach a final report", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/documents \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: report_pdf_9f7a" \\
  --form "file=@final-report.pdf;type=application/pdf" \\
  --form "filename=final-report.pdf" \\
  --form "documentType=final_report" \\
  --form "externalId=document_73"` }],
    responseStatus: "201 Created",
    responseExample: `{ "data": { "id": "doc_01J6Z1", "externalId": "document_73", "filename": "final-report.pdf", "description": null, "documentType": "final_report", "source": "partner_api", "addedAt": "2026-08-29T18:20:00.000Z", "contentUrl": "https://app.mindbill.org/..." } }`,
    notes: [{ title: "Packet boundary", body: "The payer billing packet is separate from any attorney report-service packet. The bill document list is the source of truth for what MindBill will transmit." }],
  },
  {
    slug: "list-documents",
    group: "Documents",
    method: "GET",
    path: "/bills/{billId}/documents",
    title: "List bill documents",
    summary: "List every document currently included in the payer billing packet.",
    useWhen: "Render packet review before submission or reconcile documents uploaded from another workflow.",
    permissions: ["Server API key", "Browser: documents:read"],
    pathFields: [billId],
    responseFields: [
      { name: "data[].id", type: "string", required: true, description: "MindBill document identifier." },
      { name: "data[].externalId", type: "string | null", required: true, description: "Your document identifier when supplied." },
      { name: "data[].filename", type: "string", required: true, description: "Filename shown during packet review." },
      { name: "data[].description", type: "string | null", required: true, description: "Human-readable packet description." },
      { name: "data[].documentType", type: "BillDocumentType", required: true, description: "Document classification." },
      { name: "data[].source", type: "string", required: true, description: "How the document entered the bill." },
      { name: "data[].addedAt", type: "string", required: true, description: "ISO timestamp when the document was attached." },
      { name: "data[].contentUrl", type: "string", required: true, description: "Authorized content URL." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "List packet documents", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/documents \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "data": [{
    "id": "doc_01J6Z1",
    "externalId": "document_73",
    "filename": "final-report.pdf",
    "description": "Final medical-legal report",
    "documentType": "final_report",
    "source": "partner_api",
    "addedAt": "2026-08-29T18:20:00.000Z",
    "contentUrl": "https://app.mindbill.org/..."
  }]
}`,
  },
  {
    slug: "get-document",
    group: "Documents",
    method: "GET",
    path: "/bills/{billId}/documents/{documentId}",
    title: "Download a bill document",
    summary: "Download the original PDF attached to the payer billing packet.",
    useWhen: "Open or save a document from packet review without copying the file into your own frontend bundle.",
    permissions: ["Server API key", "Browser: documents:read"],
    pathFields: [billId, documentId],
    responseFields: [],
    examples: [{ label: "cURL", language: "bash", filename: "Download a document", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/documents/$DOCUMENT_ID \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --output bill-document.pdf` }],
    responseStatus: "200 PDF",
    responseExample: "Binary PDF response.",
    responseLanguage: "text",
  },
  {
    slug: "delete-document",
    group: "Documents",
    method: "DELETE",
    path: "/bills/{billId}/documents/{documentId}",
    title: "Remove a bill document",
    summary: "Remove one document from a draft payer billing packet.",
    useWhen: "A user intentionally excludes a preselected document or removes an incorrect upload before submission.",
    permissions: ["Server API key", "Browser: documents:write"],
    idempotent: true,
    pathFields: [billId, documentId],
    responseFields: [],
    examples: [{ label: "cURL", language: "bash", filename: "Remove a document", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/documents/$DOCUMENT_ID \\
  --request DELETE \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: remove_document_73"` }],
    responseStatus: "204 No Content",
    responseExample: "No response body.",
    responseLanguage: "text",
    notes: [{ title: "Draft packets only", body: "A submitted packet is immutable. Start the state-appropriate correction or review workflow to send changed evidence after submission." }],
  },
  {
    slug: "reviews",
    group: "Reviews",
    method: "POST",
    path: "/bills/{billId}/reviews",
    title: "Create a bill review",
    summary: "Create a Second Bill Review or Independent Bill Review draft with selected evidence.",
    useWhen: "Use second_review for a denial or partial payment; use independent_bill_review when escalating an eligible dispute after SBR.",
    permissions: ["Server API key", "Browser: bills:act"],
    idempotent: true,
    pathFields: [billId],
    requestFields: [
      { name: "externalId", type: "string", description: "Your review or appeal identifier." },
      { name: "type", type: '"second_review" | "independent_bill_review"', required: true, description: "Review stage." },
      { name: "reason", type: "string", required: true, description: "Reason and argument submitted to the payer." },
      { name: "disputedAmount", type: "number", description: "Amount in dispute." },
      { name: "payerClaimControlNumber", type: "string", description: "Original EOR/835 claim control number." },
      { name: "attachmentIds", type: "string[]", description: "Supporting documents intentionally included with the review." },
    ],
    responseFields: [
      { name: "data.id", type: "string", required: true, description: "Review identifier." },
      { name: "data.type", type: "BillReviewType", required: true, description: "Review stage." },
      { name: "data.state", type: '"draft" | "submitted"', required: true, description: "Review lifecycle state." },
      { name: "data.attachmentIds", type: "string[]", required: true, description: "Evidence included in the review." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Create SBR draft", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/reviews \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: sbr_case_17" \\
  --data '{
    "type": "second_review",
    "reason": "The report meets the med-legal criteria and supports the billed service.",
    "disputedAmount": 415,
    "payerClaimControlNumber": "835-REF-F8-10042",
    "attachmentIds": ["doc_01J6Z1"]
  }'` }],
    responseStatus: "201 Created",
    responseExample: `{ "data": { "id": "review_01J6Z4", "billId": "bill_01J6Y7", "originalBillId": "bill_01J6Y7", "externalId": null, "type": "second_review", "state": "draft", "reason": "The report meets the med-legal criteria and supports the billed service.", "disputedAmount": 415, "payerClaimControlNumber": "835-REF-F8-10042", "attachmentIds": ["doc_01J6Z1"], "submittedAt": null } }`,
  },
  {
    slug: "list-reviews",
    group: "Reviews",
    method: "GET",
    path: "/bills/{billId}/reviews",
    title: "List bill reviews",
    summary: "List Second Bill Review and Independent Bill Review attempts for a bill.",
    useWhen: "Show appeal history, current review state, and supporting evidence after a denial or partial payment.",
    permissions: ["Server API key", "Browser: bills:act"],
    pathFields: [billId],
    responseFields: [
      { name: "data[].id", type: "string", required: true, description: "Review identifier." },
      { name: "data[].type", type: "BillReviewType", required: true, description: "second_review or independent_bill_review." },
      { name: "data[].state", type: '"draft" | "submitted"', required: true, description: "Review lifecycle state." },
      { name: "data[].reason", type: "string", required: true, description: "Argument sent or prepared for the payer." },
      { name: "data[].disputedAmount", type: "number | null", required: true, description: "Amount in dispute." },
      { name: "data[].attachmentIds", type: "string[]", required: true, description: "Supporting evidence included in the review." },
      { name: "data[].submittedAt", type: "string | null", required: true, description: "ISO submission timestamp." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "List reviews", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/reviews \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{ "data": [{ "id": "review_01J6Z4", "type": "second_review", "state": "draft", "reason": "The report supports the billed service.", "disputedAmount": 415, "attachmentIds": ["doc_01J6Z1"], "submittedAt": null }] }`,
  },
  {
    slug: "get-review",
    group: "Reviews",
    method: "GET",
    path: "/bills/{billId}/reviews/{reviewId}",
    title: "Retrieve a bill review",
    summary: "Retrieve one review draft or submitted review with its selected evidence.",
    useWhen: "Open a review editor or render the exact argument and attachments that were submitted.",
    permissions: ["Server API key", "Browser: bills:act"],
    pathFields: [billId, reviewId],
    responseFields: [
      { name: "data.id", type: "string", required: true, description: "Review identifier." },
      { name: "data.billId", type: "string", required: true, description: "Bill currently being reviewed." },
      { name: "data.originalBillId", type: "string", required: true, description: "Original submitted bill in the review chain." },
      { name: "data.type", type: "BillReviewType", required: true, description: "Review stage." },
      { name: "data.state", type: '"draft" | "submitted"', required: true, description: "Review lifecycle state." },
      { name: "data.reason", type: "string", required: true, description: "Review argument." },
      { name: "data.payerClaimControlNumber", type: "string | null", required: true, description: "Original EOR or 835 claim control number." },
      { name: "data.attachmentIds", type: "string[]", required: true, description: "Selected supporting documents." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Retrieve a review", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/reviews/$REVIEW_ID \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{ "data": { "id": "review_01J6Z4", "billId": "bill_01J6Y7", "originalBillId": "bill_01J6Y7", "type": "second_review", "state": "draft", "reason": "The report supports the billed service.", "payerClaimControlNumber": "835-REF-F8-10042", "attachmentIds": ["doc_01J6Z1"] } }`,
  },
  {
    slug: "submit-review",
    group: "Reviews",
    method: "POST",
    path: "/bills/{billId}/reviews/{reviewId}/submissions",
    title: "Submit a bill review",
    summary: "Submit a completed SBR or IBR through the bill’s available delivery route.",
    useWhen: "The review reason, payer control number, disputed amount, and evidence have been confirmed by the user.",
    permissions: ["Server API key", "Browser: bills:act"],
    idempotent: true,
    pathFields: [billId, reviewId],
    requestFields: [],
    responseFields: [
      { name: "data.id", type: "string", required: true, description: "Review identifier." },
      { name: "data.state", type: '"submitted"', required: true, description: "Updated review state." },
      { name: "data.submittedAt", type: "string", required: true, description: "ISO submission timestamp." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Submit a review", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID/reviews/$REVIEW_ID/submissions \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Idempotency-Key: submit_sbr_case_17"` }],
    responseStatus: "201 Created",
    responseExample: `{ "data": { "id": "review_01J6Z4", "state": "submitted", "submittedAt": "2026-08-29T19:04:00.000Z" } }`,
  },
  {
    slug: "events",
    group: "Platform",
    method: "GET",
    path: "/events",
    title: "List lifecycle events",
    summary: "Read an ordered cursor-based stream of organization billing changes.",
    useWhen: "Persist bill IDs immediately from component callbacks, then use events or signed webhooks as the authoritative server-side synchronization channel.",
    permissions: ["Server API key"],
    queryFields: [
      { name: "cursor", type: "string", description: "Opaque cursor from the previous page." },
      { name: "limit", type: "number", description: "Maximum events to return." },
    ],
    responseFields: [
      { name: "events[].id", type: "string", required: true, description: "Stable event identifier for deduplication." },
      { name: "events[].sequence", type: "string", required: true, description: "Organization-ordering sequence." },
      { name: "events[].type", type: "string", required: true, description: "Lifecycle event type." },
      { name: "events[].apiVersion", type: "string", required: true, description: "Event schema version." },
      { name: "events[].createdAt", type: "string", required: true, description: "ISO event timestamp." },
      { name: "events[].data", type: "object", required: true, description: "Event-specific payload containing bill and transition identifiers." },
      { name: "nextCursor", type: "string | null", required: true, description: "Cursor to persist after processing the page." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Read events", code: `curl "https://app.mindbill.org/partner/v2/events?cursor=$CURSOR&limit=100" \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "events": [{
    "id": "evt_01J6Z2",
    "sequence": "1842",
    "type": "bill.status.updated",
    "apiVersion": "2026-08-29",
    "createdAt": "2026-08-29T18:42:11.000Z",
    "data": { "billId": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D", "state": "processed" }
  }],
  "nextCursor": "cursor_1842"
}`,
    notes: [{ title: "Process at least once", body: "Store the event ID before applying a side effect, ignore duplicates, process events in sequence order, and advance your cursor only after the page commits successfully." }],
  },
  {
    slug: "webhook-deliveries",
    group: "Platform",
    method: "GET",
    path: "/webhook-deliveries",
    title: "List webhook deliveries",
    summary: "Inspect recent webhook attempts and their delivery outcome.",
    useWhen: "Troubleshoot a missing event or verify that your webhook receiver acknowledged a lifecycle update.",
    permissions: ["Server API key"],
    queryFields: [
      { name: "cursor", type: "string", description: "Opaque cursor from the previous page." },
      { name: "limit", type: "number", description: "Maximum deliveries to return." },
    ],
    responseFields: [
      { name: "data[]", type: "object", required: true, description: "Webhook attempt metadata, event identity, response status, and timestamps." },
      { name: "nextCursor", type: "string | null", required: true, description: "Cursor for the next page." },
    ],
    examples: [{ label: "cURL", language: "bash", filename: "Inspect deliveries", code: `curl "https://app.mindbill.org/partner/v2/webhook-deliveries?limit=50" \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{
  "data": [{
    "eventId": "evt_01J6Z2",
    "status": "delivered",
    "responseStatus": 200,
    "attemptedAt": "2026-08-29T18:42:12.000Z"
  }],
  "nextCursor": null
}`,
    notes: [{ title: "Diagnostic view", body: "Events and signed webhook payloads remain the lifecycle source of truth. Delivery history is for operations and replay diagnosis." }],
  },
  {
    slug: "browser-sessions",
    group: "Platform",
    method: "POST",
    path: "/browser-sessions",
    title: "Create a browser session",
    summary: "Exchange a server API key for a short-lived, organization-bound browser token.",
    useWhen: "Use one authenticated route in your server so React, Angular, or the framework-neutral browser client can create and manage bills without exposing the permanent API key.",
    permissions: ["Server API key only"],
    idempotent: true,
    requestFields: [
      { name: "subject", type: "string", required: true, description: "Stable identifier for the signed-in user in your system." },
      { name: "allowedOrigin", type: "string", required: true, description: "Exact browser origin. Paths, query strings, fragments, and credentials are rejected.", constraint: "HTTPS; HTTP loopback allowed in sandbox" },
      { name: "permissions", type: "MindBillBrowserPermission[]", required: true, description: "Role-derived grants: bills:create/read/edit/submit/act, documents:read/write, payers:read, and eors:read." },
      { name: "resource.billId", type: "string", description: "Optional least-privilege restriction to one existing bill. Cannot be combined with bills:create." },
      { name: "expiresIn", type: "number", description: "Session lifetime in seconds.", constraint: "Integer 60–3600" },
    ],
    responseFields: [
      { name: "sessionId", type: "string", required: true, description: "Session audit identifier." },
      { name: "organizationId", type: "string", required: true, description: "Organization fixed by the server credential." },
      { name: "subject", type: "string", required: true, description: "Your signed-in user identifier." },
      { name: "permissions", type: "string[]", required: true, description: "Effective browser permissions." },
      { name: "resource", type: "{ billId: string } | null", required: true, description: "Optional bill restriction." },
      { name: "token", type: "string", required: true, description: "Short-lived browser bearer token." },
      { name: "expiresAt", type: "string", required: true, description: "ISO expiration timestamp." },
    ],
    examples: [
      { label: "Node.js", language: "typescript", filename: "server/mindbill-session.ts", code: `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

export async function POST(request: Request) {
  const user = await requireSignedInUser(request);
  const permissions = permissionsForRole(user.role);

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    allowedOrigin: process.env.APP_ORIGIN!,
    permissions,
    expiresIn: 900,
  });

  return Response.json(session);
}` },
      { label: "cURL", language: "bash", filename: "Create a browser session", code: `curl https://app.mindbill.org/partner/v2/browser-sessions \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --header "Idempotency-Key: session_user_42" \\
  --data '{
    "subject": "user_42",
    "allowedOrigin": "https://your-product.example",
    "permissions": ["bills:create", "bills:read", "bills:edit", "bills:submit", "documents:read", "documents:write", "payers:read"]
  }'` },
    ],
    responseStatus: "201 Created",
    responseExample: `{
  "sessionId": "session_01J6Z8",
  "organizationId": "org_01J4",
  "subject": "user_42",
  "permissions": ["bills:create", "bills:read", "bills:edit", "bills:submit", "documents:read", "documents:write", "payers:read"],
  "resource": null,
  "token": "mb_browser_…",
  "expiresAt": "2026-08-29T19:15:00.000Z"
}`,
    notes: [
      { title: "Organization and role are separate boundaries", body: "The API key fixes the organization. Your session route authenticates the user and maps their application role to permissions. A session does not need a bill ID when the user is allowed to create bills." },
      { title: "Trust events, not the browser callback", body: "Use onBillCreated for immediate UI state. Persist durable lifecycle changes from ordered events or signed webhooks because payer responses can arrive after the browser closes." },
    ],
  },
];

export const endpointGroups = ["Bills", "Documents", "Reviews", "Lifecycle", "Platform"] as const;

export function endpointBySlug(slug: string) {
  return apiEndpoints.find((endpoint) => endpoint.slug === slug);
}
