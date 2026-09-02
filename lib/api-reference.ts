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
  description: "The MindBill bill identifier returned after atomic submission.",
};

const documentId: ApiField = {
  name: "documentId",
  type: "string",
  required: true,
  description: "The document identifier returned with the atomically submitted bill.",
};

const reviewId: ApiField = {
  name: "reviewId",
  type: "string",
  required: true,
  description: "The Second Bill Review or Independent Bill Review identifier.",
};

const addressFields = (prefix: string, subject: string): ApiField[] => [
  { name: `${prefix}.line1`, type: "string", required: true, description: `${subject} street address.` },
  { name: `${prefix}.line2`, type: "string", description: `${subject} suite, unit, or secondary address line.` },
  { name: `${prefix}.city`, type: "string", required: true, description: `${subject} city.` },
  { name: `${prefix}.state`, type: "string", required: true, description: "Two-letter state code.", constraint: "2 characters" },
  { name: `${prefix}.postalCode`, type: "string", required: true, description: `${subject} ZIP or ZIP+4 postal code.` },
];

const createBillFields: ApiField[] = [
  { name: "externalId", type: "string", description: "Stable report, case, or work-item identifier in your system. Use it to find the bill later." },
  { name: "billingMode", type: '"med_legal"', description: "Selects California medical-legal billing. The professional value is reserved but not enabled in the public API.", constraint: 'Default: "med_legal"' },
  { name: "patient.externalId", type: "string", description: "Your patient identifier. Do not send this together with patient.id." },
  { name: "patient.firstName", type: "string", required: true, description: "Patient given name." },
  { name: "patient.middleName", type: "string", description: "Patient middle name or initial." },
  { name: "patient.lastName", type: "string", required: true, description: "Patient family name." },
  { name: "patient.dateOfBirth", type: "string", required: true, description: "Patient date of birth.", constraint: "YYYY-MM-DD" },
  { name: "patient.ssn", type: "string", description: "Patient Social Security number. Omit to use the claim-form fallback 999999999." },
  { name: "patient.gender", type: '"M" | "F" | "X"', description: "Patient sex or gender value. Omit when unknown." },
  { name: "patient.phone", type: "string", description: "Patient phone number." },
  ...addressFields("patient.address", "Patient"),
  { name: "claim.externalId", type: "string", description: "Your injury or claim identifier. Do not send this together with claim.id." },
  { name: "claim.claimNumber", type: "string", required: true, description: "Workers’ compensation claim number assigned by the payer or administrator." },
  { name: "claim.adjNumber", type: "string", description: "California WCAB/EAMS case number when applicable." },
  { name: "claim.employer", type: "string", required: true, description: "Employer name associated with the injury." },
  { name: "claim.dateOfInjury", type: "string", required: true, description: "Date of injury. For a cumulative injury, use the final injury date and describe the range separately.", constraint: "YYYY-MM-DD" },
  { name: "claim.injuryState", type: "string", description: "Two-letter state code governing the claim." },
  { name: "claim.description", type: "string", description: "Short injury description." },
  { name: "claim.claimsAdministrator.id", type: "string", required: true, description: "Opaque MindBill payer-directory identifier selected from the claims-administrator directory." },
  { name: "claim.claimsAdministrator.name", type: "string", required: true, description: "Canonical carrier or third-party administrator display name." },
  { name: "service.date", type: "string", required: true, description: "Primary date of service for the bill.", constraint: "YYYY-MM-DD" },
  { name: "service.endDate", type: "string | null", description: "End date only for a service that spans multiple dates.", constraint: "YYYY-MM-DD" },
  { name: "service.authorizationNumber", type: "string | null", description: "Prior authorization number when the payer supplied one." },
  { name: "billingProvider", type: "BillingProviderSnapshot", required: true, description: "Payee identity printed in CMS-1500 boxes 25 and 33." },
  { name: "billingProvider.name", type: "string", required: true, description: "Billing provider or practice name." },
  { name: "billingProvider.taxId", type: "string", required: true, description: "Billing provider EIN or SSN." },
  { name: "billingProvider.npi", type: "string", required: true, description: "Billing provider NPI.", constraint: "10 digits" },
  { name: "billingProvider.phone", type: "string", required: true, description: "Billing provider phone number." },
  ...addressFields("billingProvider.address", "Billing provider"),
  { name: "renderingProvider", type: "RenderingProviderSnapshot", required: true, description: "Clinician identity printed in CMS-1500 box 24J." },
  { name: "renderingProvider.name", type: "string", required: true, description: "Rendering clinician name." },
  { name: "renderingProvider.npi", type: "string", required: true, description: "Rendering provider NPI.", constraint: "10 digits" },
  { name: "renderingProvider.taxonomy", type: "string", required: true, description: "NUCC taxonomy code sent with qualifier ZZ.", constraint: "10 alphanumeric characters" },
  { name: "renderingProvider.specialty", type: "string", description: "Human-readable specialty." },
  { name: "renderingProvider.licenseNumber", type: "string", description: "State professional license number." },
  { name: "renderingProvider.licenseState", type: "string", description: "Two-letter license state.", constraint: "2 characters" },
  { name: "serviceLocation", type: "ServiceLocationSnapshot", required: true, description: "Facility address and place-of-service code printed in CMS-1500 box 32." },
  { name: "serviceLocation.name", type: "string", description: "Human-readable facility name." },
  { name: "serviceLocation.placeOfServiceCode", type: "string", required: true, description: "CMS place-of-service code.", constraint: "2 digits" },
  ...addressFields("serviceLocation.address", "Service location"),
  { name: "diagnoses", type: "string[]", required: true, description: "At least one ICD-10 diagnosis code.", constraint: "1 or more items" },
  { name: "serviceLines", type: "ServiceLine[]", required: true, description: "At least one procedure line.", constraint: "1–50 items" },
  { name: "serviceLines[].code", type: "string", required: true, description: "Procedure or service code, such as ML201 or 99205." },
  { name: "serviceLines[].modifiers", type: "string[]", description: "Procedure modifiers without hyphens." },
  { name: "serviceLines[].units", type: "number", description: "Positive unit count.", constraint: "Default: 1; > 0" },
];

const billResponseFields: ApiField[] = [
  { name: "id", type: "string", required: true, description: "Stable MindBill bill identifier." },
  { name: "externalId", type: "string | null", required: true, description: "Your supplied source-system identifier." },
  { name: "state", type: "string", required: true, description: "Current native lifecycle state." },
  { name: "billingMode", type: '"med_legal"', required: true, description: "Billing rule set used by the bill." },
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
    "bill": {
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
        "claimsAdministrator": {
          "id": "payer_example_01",
          "name": "Example Claims Administrator"
        }
      },
      "service": { "date": "2026-08-26" },
      "billingProvider": {
        "name": "Example Evaluations",
        "taxId": "123456789",
        "npi": "1234567890",
        "phone": "5595550100",
        "address": { "line1": "200 Market St", "city": "Fresno", "state": "CA", "postalCode": "93721" }
      },
      "renderingProvider": {
        "name": "Morgan Chen, MD",
        "npi": "1098765432",
        "taxonomy": "2084P0800X"
      },
      "serviceLocation": {
        "name": "Fresno Exam Office",
        "placeOfServiceCode": "11",
        "address": { "line1": "300 Pine Ave", "city": "Fresno", "state": "CA", "postalCode": "93721" }
      },
      "diagnoses": ["M25.512"],
      "serviceLines": [{ "code": "ML201", "modifiers": ["95"], "units": 1 }]
    },
    "submission": { "route": "ebill" },
    "documents": [{
      "filename": "final-report.pdf",
      "documentType": "final_report",
      "contentBase64": "$FINAL_REPORT_BASE64",
      "externalId": "document_73"
    }]
  }'`;

const createNode = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

const bill = await mindbill.createAndSubmitBill({
  bill: {
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
      claimsAdministrator: {
        id: "payer_example_01",
        name: "Example Claims Administrator",
      },
    },
    service: { date: "2026-08-26" },
    billingProvider: {
      name: "Example Evaluations",
      taxId: "123456789",
      npi: "1234567890",
      phone: "5595550100",
      address: { line1: "200 Market St", city: "Fresno", state: "CA", postalCode: "93721" },
    },
    renderingProvider: {
      name: "Morgan Chen, MD",
      npi: "1098765432",
      taxonomy: "2084P0800X",
    },
    serviceLocation: {
      name: "Fresno Exam Office",
      placeOfServiceCode: "11",
      address: { line1: "300 Pine Ave", city: "Fresno", state: "CA", postalCode: "93721" },
    },
    diagnoses: ["M25.512"],
    serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
  },
  submission: { route: "ebill" },
  documents: [{
    filename: "final-report.pdf",
    documentType: "final_report",
    contentBase64: finalReportBytes.toString("base64"),
    externalId: "document_73",
  }],
}, "report_9f7a");`;

export const apiEndpoints: ApiEndpoint[] = [
  {
    slug: "create-bill",
    group: "Bills",
    method: "POST",
    path: "/bills",
    title: "Create and submit a bill",
    summary: "Atomically validate, create, attach the payer packet, and submit an immutable bill snapshot.",
    useWhen: "Call once after the user reviews the complete bill form and presses Submit. A failed request creates no public bill.",
    permissions: ["Server API key", "Browser: bills:create"],
    idempotent: true,
    requestFields: [
      ...createBillFields.map((field) => ({ ...field, name: `bill.${field.name}` })),
      { name: "submission.route", type: '"ebill" | "fax" | "mail" | "email"', description: "Chosen delivery route. Omit to use MindBill routing." },
      { name: "submission.destination", type: "object", description: "Optional intentional fax, email, or mail destination override." },
      { name: "documents[]", type: "BillSubmissionDocument[]", description: "Complete payer packet included atomically with the submitted bill. Maximum 25 documents, and 45 MB of PDF bytes in total across the submission." },
      { name: "documents[].filename", type: "string", required: true, description: "Filename shown in the payer packet." },
      { name: "documents[].documentType", type: "BillDocumentType", required: true, description: "Document classification such as final_report, proof_of_service, w9, or other." },
      { name: "documents[].contentBase64", type: "string", required: true, description: "Base64-encoded PDF bytes. Maximum 25 MB per document measured before encoding. The file must be a real PDF." },
      { name: "documents[].externalId", type: "string", description: "Your stable source-document identifier." },
      { name: "documents[].reportTypeCode", type: "string", description: "Optional PWK01 report-type code. Med-legal components default to J4." },
    ],
    responseFields: billResponseFields,
    examples: [
      { label: "cURL", language: "bash", filename: "Create and submit a bill", code: createCurl },
      { label: "Node.js", language: "typescript", filename: "submit-bill.ts", code: createNode },
    ],
    responseStatus: "201 Created",
    responseExample: `{
  "id": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D",
  "externalId": "report_9f7a",
  "state": "submitted",
  "billingMode": "med_legal",
  "billNumber": 1038,
  "patient": { "firstName": "Alex", "lastName": "Morgan", "address": { "line1": "100 Main St", "city": "Fresno", "state": "CA", "postalCode": "93721" } },
  "claim": { "claimNumber": "WC-44871", "employer": "Example Foods", "dateOfInjury": "2026-02-14", "claimsAdministrator": { "id": "payer_example_01", "name": "Example Claims Administrator" }, "diagnoses": ["M25.512"] },
  "service": { "date": "2026-08-26", "endDate": null, "authorizationNumber": null },
  "billingProvider": { "name": "Example Evaluations", "taxId": "123456789", "npi": "1234567890", "phone": "5595550100", "address": { "line1": "200 Market St", "city": "Fresno", "state": "CA", "postalCode": "93721" } },
  "renderingProvider": { "name": "Morgan Chen, MD", "npi": "1098765432", "taxonomy": "2084P0800X" },
  "serviceLocation": { "name": "Fresno Exam Office", "placeOfServiceCode": "11", "address": { "line1": "300 Pine Ave", "city": "Fresno", "state": "CA", "postalCode": "93721" } },
  "serviceLines": [{ "id": "line_01", "code": "ML201", "modifiers": ["95"], "units": 1, "allowed": 2015 }],
  "documents": [{
    "id": "doc_01J6Y7J2E7D3J5F9Q8K4M6N1P0",
    "externalId": "document_456",
    "filename": "final-report.pdf",
    "documentType": "final_report",
    "source": "partner_api",
    "addedAt": "2026-08-26T18:42:15.000Z",
    "contentUrl": "https://app.mindbill.org/partner/v2/bills/bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D/documents/doc_01J6Y7J2E7D3J5F9Q8K4M6N1P0/content"
  }],
  "amounts": { "charged": 2015, "paid": 0, "balance": 2015 }
}`,
    notes: [
      { title: "Snapshot, not synchronization", body: "Provider, location, patient, and claim values are frozen on the bill. You may keep your own canonical database, use MindBill profiles for repeated values, or mix both approaches." },
      { title: "No public draft", body: "Pre-submission edits stay in your product. Success returns an immutable submitted bill; validation or packet-preparation failure creates no public bill." },
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
    useWhen: "Inspect the exact immutable snapshot and payer packet behind a lifecycle or receivables record.",
    permissions: ["Server API key", "Browser: bills:read"],
    pathFields: [billId],
    responseFields: billResponseFields,
    examples: [{ label: "cURL", language: "bash", filename: "Retrieve a bill", code: `curl https://app.mindbill.org/partner/v2/bills/$BILL_ID \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"` }],
    responseExample: `{ "id": "bill_01J6Y7F4Q4XK6P3J9G2C8A1B5D", "externalId": "report_9f7a", "state": "submitted", "billingMode": "med_legal", "documents": [], "amounts": { "charged": 2015, "paid": 0, "balance": 2015 } }`,
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
    summary: "Close, post payment, or start a payer review from one state-aware operation.",
    useWhen: "Available actions depend on bill state. The React and Angular lifecycle components already render only valid actions.",
    permissions: ["Server API key", "Browser: bills:act"],
    idempotent: true,
    pathFields: [billId],
    requestFields: [
      { name: "action", type: '"close" | "post_payment" | "second_review"', required: true, description: "Lifecycle action to perform." },
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
    slug: "list-documents",
    group: "Documents",
    method: "GET",
    path: "/bills/{billId}/documents",
    title: "List bill documents",
    summary: "List every document currently included in the payer billing packet.",
    useWhen: "Inspect or reconcile the exact document packet frozen onto a submitted bill.",
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
    useWhen: "Use one authenticated route for connected post-submit lifecycle UI, or when a browser client needs an explicitly granted public operation without exposing the permanent API key.",
    permissions: ["Server API key only"],
    idempotent: true,
    requestFields: [
      { name: "subject", type: "string", required: true, description: "Stable identifier for the signed-in user in your system." },
      { name: "allowedOrigin", type: "string", required: true, description: "Exact browser origin. Paths, query strings, fragments, and credentials are rejected.", constraint: "HTTPS; HTTP loopback allowed in sandbox" },
      { name: "permissions", type: "MindBillBrowserPermission[]", required: true, description: "Role-derived grants: bills:create/read/act, documents:read, payers:read, and eors:read." },
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
    "permissions": ["bills:create", "bills:read", "documents:read", "payers:read"]
  }'` },
    ],
    responseStatus: "201 Created",
    responseExample: `{
  "sessionId": "session_01J6Z8",
  "organizationId": "org_01J4",
  "subject": "user_42",
  "permissions": ["bills:create", "bills:read", "documents:read", "payers:read"],
  "resource": null,
  "token": "mb_browser_…",
  "expiresAt": "2026-08-29T19:15:00.000Z"
}`,
    notes: [
      { title: "Organization and role are separate boundaries", body: "The API key fixes the organization. Your session route authenticates the user and maps their application role to permissions. A bill-restricted post-submit session cannot include bills:create." },
      { title: "Trust events, not the browser callback", body: "Use the atomic submission response for immediate UI state. Persist durable lifecycle changes from ordered events or signed webhooks because payer responses can arrive after the browser closes." },
    ],
  },
  {
    slug: "management-sessions",
    group: "Platform",
    method: "POST",
    path: "/management-sessions",
    title: "Create a management session",
    summary: "Mint a one-time sign-in URL that opens the hosted MindBill billing workspace for your organization.",
    useWhen: "Use behind the prebuilt Billing-management button (or your own link) so organization staff can open the full MindBill work queue, reports, and denials without a second login. This is a hosted-SSO handoff, not a browser API token.",
    permissions: ["Server API key with the operator-granted management:write scope"],
    idempotent: false,
    requestFields: [
      { name: "subject", type: "string", required: true, description: "Stable identifier for the signed-in user in your system. Recorded for audit; never rendered in the product." },
      { name: "role", type: '"biller" | "viewer"', description: "Access level for the managed sign-in. biller covers day-to-day billing operations; viewer is read-only.", constraint: "Defaults to biller; admin is never available" },
      { name: "expiresIn", type: "number", description: "Seconds until the unopened link expires.", constraint: "Integer 60–900; defaults to 300" },
    ],
    responseFields: [
      { name: "url", type: "string", required: true, description: "One-time sign-in URL. Open it in a new tab; it works exactly once." },
      { name: "expiresAt", type: "string", required: true, description: "ISO expiration timestamp for the unopened link." },
      { name: "organizationId", type: "string", required: true, description: "Organization fixed by the server credential." },
      { name: "subject", type: "string", required: true, description: "Your signed-in user identifier." },
      { name: "role", type: "string", required: true, description: "Effective managed role." },
    ],
    examples: [
      { label: "Node.js", language: "typescript", filename: "app/api/mindbill/management-session/route.ts", code: `export async function POST(request: Request) {
  const user = await requireSignedInUser(request); // your existing auth

  const response = await fetch(
    "https://app.mindbill.org/partner/v2/management-sessions",
    {
      method: "POST",
      headers: {
        authorization: \`Bearer \${process.env.MINDBILL_API_KEY!}\`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ subject: user.id, role: "biller" }),
    },
  );
  const session = await response.json();

  return Response.json({ url: session.url });
}` },
      { label: "cURL", language: "bash", filename: "Create a management session", code: `curl https://app.mindbill.org/partner/v2/management-sessions \\
  --request POST \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header "Content-Type: application/json" \\
  --data '{
    "subject": "user_42",
    "role": "biller"
  }'` },
    ],
    responseStatus: "201 Created",
    responseExample: `{
  "url": "https://app.mindbill.org/partner/management-signin?token=mbms_…",
  "expiresAt": "2026-09-02T19:05:00.000Z",
  "organizationId": "org_01J4",
  "subject": "user_42",
  "role": "biller"
}`,
    notes: [
      { title: "Links are single-use and short-lived", body: "Opening the URL signs the visitor in exactly once; a replayed, expired, or forwarded link fails closed to an error page. Mint a fresh link on every click rather than caching one." },
      { title: "Operator-granted scope", body: "management:write is not available on self-serve keys. Ask your MindBill integration contact to enable organization management SSO for your partner account." },
    ],
  },
];

export const endpointGroups = ["Bills", "Documents", "Reviews", "Lifecycle", "Platform"] as const;

export function endpointBySlug(slug: string) {
  return apiEndpoints.find((endpoint) => endpoint.slug === slug);
}
