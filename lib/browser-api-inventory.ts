export type BrowserApiPermission =
  | "bills:create"
  | "bills:read"
  | "bills:act"
  | "documents:read"
  | "eors:read"
  | "payers:read"
  | "organization:manage";

export type BrowserApiInventoryEntry = {
  method: "GET" | "POST" | "PUT";
  path: string;
  permission: BrowserApiPermission;
  purpose: string;
  sdkMethod: string;
  referenceSlug?: string;
};

/** Distinct MindBill routes called by @mindbill/browser and @mindbill/react. */
export const browserApiInventory: BrowserApiInventoryEntry[] = [
  {
    method: "POST",
    path: "/partner/v2/browser/bills",
    permission: "bills:create",
    purpose: "Submit a complete bill, including its supporting documents, from an organization-wide browser session.",
    sdkMethod: "submitBill",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills",
    permission: "bills:read",
    purpose: "List and filter the partner's bills in the session organization; requires an organization-wide session.",
    sdkMethod: "getBills",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills/{billId}/status",
    permission: "bills:read",
    purpose: "Read the status snapshot used by the connected bill status component.",
    sdkMethod: "getStatus",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills/{billId}/lifecycle",
    permission: "bills:read",
    purpose: "Load the bill's timeline, balance, documents, payments, and available follow-up actions.",
    sdkMethod: "getLifecycle",
  },
  {
    method: "POST",
    path: "/partner/v2/browser/bills/{billId}/actions",
    permission: "bills:act",
    purpose: "Perform a supported bill action, including notes, close/reopen, payments, second review, resubmission, a new bill, duplicates, or status reporting.",
    sdkMethod: "addNote, closeBill, reopenBill, postPayment, submitSecondReview, resubmitBill, submitNewBill, sendDuplicateBill, reportBillStatus",
  },
  {
    method: "POST",
    path: "/partner/v2/browser/bills/{billId}/simulate",
    permission: "bills:act",
    purpose: "Simulate a bill lifecycle outcome in sandbox; unavailable for live sessions.",
    sdkMethod: "simulateSandbox",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills/{billId}/delivery-options",
    permission: "bills:read",
    purpose: "Read the available delivery options and recommended route for an existing bill.",
    sdkMethod: "getDeliveryOptions",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills/{billId}/documents/{attachmentId}",
    permission: "documents:read",
    purpose: "Download a supporting attachment as PDF bytes.",
    sdkMethod: "getAttachment",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills/{billId}/eors/{documentId}",
    permission: "eors:read",
    purpose: "Download an explanation of review document as PDF bytes.",
    sdkMethod: "getEor",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bills/{billId}/packet",
    permission: "bills:read",
    purpose: "Download the bill submission packet as PDF bytes.",
    sdkMethod: "getPacket",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/claims-administrators",
    permission: "payers:read",
    purpose: "Browse or search claims administrators, payer choices, and matching hints before a bill exists.",
    sdkMethod: "listClaimsAdministrators, searchClaimsAdministrators",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/claims-administrators/{id}",
    permission: "payers:read",
    purpose: "Read a directory profile with contacts, instructions, payer information, and claim-number patterns.",
    sdkMethod: "getClaimsAdministratorDirectory",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/diagnosis-codes",
    permission: "payers:read",
    purpose: "Search ICD-10-CM codes by code or description with offset pagination.",
    sdkMethod: "searchDiagnosisCodes",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/postal-codes",
    permission: "payers:read",
    purpose: "Look up the city and state for a US ZIP code.",
    sdkMethod: "lookupPostalCode",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/delivery-preview",
    permission: "payers:read",
    purpose: "Preview delivery options for a selected claims administrator and payer before submission; the final route is resolved at submission.",
    sdkMethod: "getDeliveryPreview",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/bill-tasks",
    permission: "bills:read",
    purpose: "Read the partner's bill task dashboard, waiting items, and claims-administrator filters with an organization-wide session.",
    sdkMethod: "getBillTasks",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/reports/service-line-items",
    permission: "bills:read",
    purpose: "Read service-line reporting for the partner's bills with optional from/to dates and an organization-wide session.",
    sdkMethod: "getServiceLineItems",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/reports/productivity",
    permission: "bills:read",
    purpose: "Read biller productivity for a required from/to date range with an organization-wide session.",
    sdkMethod: "getProductivity",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/organization",
    permission: "organization:manage",
    purpose: "Read the organization's profile, providers, locations, W-9 metadata, and onboarding checklist.",
    sdkMethod: "getOrganization",
  },
  {
    method: "GET",
    path: "/partner/v2/browser/organization/billing-profile",
    permission: "bills:create",
    purpose: "Read saved billing profiles for bill entry with an organization-wide session; sensitive stored tax identifiers remain masked.",
    sdkMethod: "getBillingProfile",
  },
  {
    method: "PUT",
    path: "/partner/v2/browser/organization/billing-profile",
    permission: "organization:manage",
    purpose: "Update practice identity and upsert billing or rendering providers by id or externalId; omitted records remain saved.",
    sdkMethod: "saveBillingProfile",
  },
  {
    method: "PUT",
    path: "/partner/v2/browser/organization/locations",
    permission: "organization:manage",
    purpose: "Upsert locations by id or externalId without deleting omitted locations.",
    sdkMethod: "saveLocations",
  },
  {
    method: "PUT",
    path: "/partner/v2/browser/organization/w9",
    permission: "organization:manage",
    purpose: "Upload the organization's current W-9 as a base64 PDF, up to 10 MB, with an optional tax year.",
    sdkMethod: "saveW9",
  },
];
