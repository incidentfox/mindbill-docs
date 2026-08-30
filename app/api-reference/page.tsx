import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "REST API reference" };

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  input: string;
  output: string;
  description: string;
};

const billEndpoints: Endpoint[] = [
  { method: "POST", path: "/bills", input: "CreateBillRequest", output: "Bill", description: "Create a private draft." },
  { method: "GET", path: "/bills", input: "ListBillsQuery", output: "BillPage", description: "List organization bills." },
  { method: "GET", path: "/bills/{billId}", input: "—", output: "Bill", description: "Read one bill." },
  { method: "PATCH", path: "/bills/{billId}", input: "UpdateBillRequest", output: "Bill", description: "Edit a draft or correction." },
  { method: "GET", path: "/bills/{billId}/delivery-options", input: "—", output: "BillDeliveryOptions", description: "Resolve actual routes and destinations." },
  { method: "POST", path: "/bills/{billId}/submissions", input: "SubmitBillRequest", output: "SubmitBillResponse", description: "Submit by e-bill, fax, mail, or email." },
  { method: "GET", path: "/bills/{billId}/status", input: "—", output: "{ data: BillStatus }", description: "Read normalized status and balances." },
  { method: "GET", path: "/bills/{billId}/eor", input: "—", output: "BillEorResponse", description: "Read EOR data and source PDFs." },
  { method: "POST", path: "/bills/{billId}/actions", input: "BillAction", output: "BillActionResponse", description: "Correct, pay, review, or close." },
];

const documentEndpoints: Endpoint[] = [
  { method: "GET", path: "/bills/{billId}/documents", input: "—", output: "{ data: BillDocument[] }", description: "List the payer packet." },
  { method: "POST", path: "/bills/{billId}/documents", input: "multipart UploadBillDocumentRequest", output: "{ data: BillDocument }", description: "Upload one document." },
  { method: "GET", path: "/bills/{billId}/documents/{documentId}", input: "—", output: "PDF / Blob", description: "Download a document." },
  { method: "DELETE", path: "/bills/{billId}/documents/{documentId}", input: "—", output: "204 No Content", description: "Remove a document." },
];

const reviewEndpoints: Endpoint[] = [
  { method: "GET", path: "/bills/{billId}/reviews", input: "—", output: "{ data: BillReview[] }", description: "List SBR and IBR records." },
  { method: "POST", path: "/bills/{billId}/reviews", input: "CreateBillReviewRequest", output: "{ data: BillReview }", description: "Create an SBR or IBR draft." },
  { method: "GET", path: "/bills/{billId}/reviews/{reviewId}", input: "—", output: "{ data: BillReview }", description: "Read one review." },
  { method: "POST", path: "/bills/{billId}/reviews/{reviewId}/submissions", input: "SubmitBillRequest", output: "{ data: BillReview }", description: "Submit the review." },
];

const platformEndpoints: Endpoint[] = [
  { method: "GET", path: "/events", input: "cursor, limit", output: "EventPage", description: "Read ordered lifecycle events." },
  { method: "GET", path: "/webhook-deliveries", input: "cursor, limit", output: "WebhookDeliveryPage", description: "Inspect webhook delivery attempts." },
  { method: "POST", path: "/browser-sessions", input: "BrowserSessionRequest", output: "BrowserSession", description: "Mint a short-lived browser token." },
];

const createTypes = `type CreateBillRequest = {
  externalId?: string;
  billingMode?: "med_legal" | "professional";
  patient: PatientSnapshot;
  claim: ClaimSnapshot;
  service: {
    date: string;
    endDate?: string | null;
    authorizationNumber?: string | null;
  };
  billingProvider?: BillingProviderSnapshot;
  renderingProvider?: RenderingProviderSnapshot;
  serviceLocation?: ServiceLocationSnapshot;
  diagnoses?: string[];
  serviceLines?: Array<Omit<ServiceLine, "id">>;
};

type PatientSnapshot = {
  id?: string; externalId?: string; // use one, never both
  firstName: string; middleName?: string; lastName: string;
  dateOfBirth?: string; ssn?: string; gender?: "M" | "F" | "X";
  phone?: string; address: Address;
};

type ClaimSnapshot = {
  id?: string; externalId?: string; // use one, never both
  claimNumber: string; adjNumber?: string; employer?: string;
  dateOfInjury?: string; injuryState?: string; description?: string;
  claimsAdministrator?: { id?: string; name: string };
};

type Address = {
  line1: string; city: string; state: string; postalCode: string;
};

type BillingProviderSnapshot = {
  name?: string; taxId?: string; npi?: string;
  phone?: string; address?: Address;
};

type RenderingProviderSnapshot = {
  name?: string; specialty?: string; npi?: string; taxonomy?: string;
  licenseNumber?: string; licenseState?: string; isQme?: boolean; isAme?: boolean;
};

type ServiceLocationSnapshot = {
  name?: string; address?: Address; placeOfServiceCode?: string;
};

type ServiceLine = {
  id?: string; code: string; modifiers?: string[]; units?: number;
  serviceDate?: string; serviceDateEnd?: string | null; charge?: number;
  diagnosisPointers?: number[]; // one-based CMS-1500 box 24E pointers
};`;

const billOutput = `type Bill = {
  id: string;
  externalId: string | null;
  state: string;
  billingMode: "med_legal" | "professional";
  billNumber: number | null;
  patient: {
    firstName: string; middleName: string | null; lastName: string;
    dateOfBirth: string | null; ssn: string | null;
    gender: "M" | "F" | "X" | null; phone: string | null; address: Address;
  };
  claim: {
    claimNumber: string; adjNumber: string | null; employer: string | null;
    dateOfInjury: string | null; injuryState: string | null;
    description: string | null;
    diagnoses: string[];
    claimsAdministrator: { id?: string; name: string } | null;
  };
  service: { date: string; endDate: string | null; authorizationNumber: string | null };
  billingProvider: BillingProviderSnapshot | null;
  renderingProvider: RenderingProviderSnapshot | null;
  serviceLocation: ServiceLocationSnapshot | null;
  serviceLines: Array<ServiceLine & { allowed?: number }>;
  documents: BillDocument[];
  amounts: { charged: number; paid: number; balance: number };
};

type BillPage = { data: Bill[]; nextCursor: string | null };

type ListBillsQuery = {
  cursor?: string; limit?: number; externalId?: string;
  patientExternalId?: string; claimExternalId?: string; state?: string;
};

type UpdateBillRequest = {
  patient?: Partial<Omit<PatientSnapshot, "id" | "externalId" | "address">> & {
    address?: Partial<Address>;
  };
  claim?: Partial<Omit<ClaimSnapshot, "id" | "externalId">>;
  service?: Partial<CreateBillRequest["service"]>;
  billingProvider?: BillingProviderSnapshot;
  renderingProvider?: RenderingProviderSnapshot;
  serviceLocation?: ServiceLocationSnapshot;
  diagnoses?: string[];
  serviceLines?: ServiceLine[];
};`;

const deliveryTypes = `type BillDeliveryOptions = {
  payerName: string;
  recommended: BillDeliveryOption;
  options: BillDeliveryOption[];
  contacts: {
    faxNumber?: string;
    claimsEmail?: string;
    portalUrl?: string;
    mailingAddress?: string;
  };
};

type BillDeliveryOption = {
  route: "ebill" | "fax" | "mail" | "email";
  label: string;
  detail: string;
  fallback: boolean;
  confidence: "high" | "medium" | "low";
  payerName: string;
  target?: string;
  chKey?: string;
  payerId?: string;
  printAndMail?: boolean;
  costUsd?: number;
};

type SubmitBillRequest = {
  route?: "ebill" | "fax" | "mail" | "email";
  destination?: { faxNumber?: string; email?: string; mailingAddress?: string };
  attention?: string;
  subject?: string;
  note?: string;
};

type SubmitBillResponse =
  | { ok: true; sandbox: true; billId: string; controlNumber: string;
      state: "submitted"; acknowledgments: Array<{
        type: "999" | "277CA"; status: "accepted";
      }> }
  | { bill: Bill; transmissionState: string; transmissionError?: string;
      uploaded: string[] };
`;

const eorTypes = `type BillEorResponse = {
  data: {
    billId: string;
    reportedPaid: number | null;
    totalPaid: number;
    balanceDue: number;
    payment: unknown | null;
    payments: unknown[];
    lineItems: Array<{
      id: string; code: string; paid: number;
      allowedAmount: number | null;
      adjustmentAmount: number | null;
      patientResponsibility: number | null;
      reasonCodes: string[];
    }>;
    documents: Array<{
      id: string; filename: string; contentType: string | null;
      addedAt: string; contentUrl: string;
    }>;
  };
};`;

const statusTypes = `type BillStatus = {
  billId: string;
  externalId: string | null;
  state: string;
  nativeStatus: string | null;
  totalCharge: number;
  totalPaid: number;
  balanceDue: number;
  lastEventId: string | null;
  updatedAt: string | null;
};

type BillAction =
  | { action: "close"; reason: string }
  | { action: "post_payment"; amount: number; method: "check" | "eft";
      checkNumber?: string; depositDate: string; note?: string }
  | { action: "second_review"; reason: string; payerClaimControlNumber: string;
      disputedAmount?: number; attachmentIds?: string[]; route?: SubmitRoute }
  | { action: "start_correction" };

type BillActionResponse = {
  ok: true;
  replacementBillId?: string;
  data: Record<string, unknown> | null;
};`;

const documentTypes = `type BillDocumentType =
  | "final_report" | "proof_of_service" | "letter_of_attestation"
  | "form_122" | "return_to_work_voucher" | "w9"
  | "medical_records" | "appeal" | "other";

type UploadBillDocumentRequest = {
  file: Blob;
  filename: string;
  documentType: BillDocumentType;
  externalId?: string;
  description?: string;
};

type BillDocument = {
  id: string;
  externalId: string | null;
  filename: string;
  description: string | null;
  documentType: BillDocumentType;
  reportType: string | null;
  reportTypeCode: string | null;
  source: string;
  addedAt: string;
  contentUrl: string;
};`;

const reviewTypes = `type CreateBillReviewRequest = {
  externalId?: string;
  type: "second_review" | "independent_bill_review";
  reason: string;
  disputedAmount?: number;
  payerClaimControlNumber?: string;
  attachmentIds?: string[];
};

type BillReview = {
  id: string;
  billId: string;
  originalBillId: string;
  externalId: string | null;
  type: "second_review" | "independent_bill_review";
  state: "draft" | "submitted";
  reason: string;
  disputedAmount: number | null;
  payerClaimControlNumber: string | null;
  attachmentIds: string[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};`;

const eventTypes = `type MindBillEvent = {
  id: string;
  sequence: string;
  type: string;
  apiVersion: string;
  createdAt: string;
  data: Record<string, unknown>;
};

type EventPage = { events: MindBillEvent[]; nextCursor: string | null };
type WebhookDeliveryPage = {
  data: Record<string, unknown>[];
  nextCursor: string | null;
};`;

const sessionTypes = `type BrowserSessionRequest = {
  subject: string;
  allowedOrigin: string;
  permissions: Array<
    | "bills:create" | "bills:read" | "bills:edit" | "bills:submit" | "bills:act"
    | "documents:read" | "documents:write" | "payers:read" | "eors:read"
  >;
  resource?: { billId: string };
  expiresIn?: number; // 60–3600 seconds
};

type BrowserSession = {
  sessionId: string;
  organizationId: string;
  subject: string;
  permissions: string[];
  resource: { billId: string } | null;
  token: string;
  expiresAt: string;
};`;

const error = `{
  "error": "validation_error",
  "message": "The bill is missing required fields.",
  "issues": [{
    "path": "claim.claimsAdministrator",
    "message": "Select a claims administrator."
  }],
  "requestId": "req_01J68Y2K6G"
}`;

function EndpointTable({ endpoints }: { endpoints: Endpoint[] }) {
  return (
    <div className="endpoint-table">
      <div className="endpoint-row endpoint-head"><b>Method</b><b>Path</b><b>Input</b><b>Output</b><b>Purpose</b></div>
      {endpoints.map((endpoint) => (
        <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}`}>
          <b className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</b>
          <code>{endpoint.path}</code>
          <code>{endpoint.input}</code>
          <code>{endpoint.output}</code>
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
      description="One bill ID covers creation, documents, delivery, submission, payer responses, payment, disputes, correction, and closure."
      toc={[
        { id: "conventions", label: "Conventions" },
        { id: "bills", label: "Bills" },
        { id: "documents", label: "Documents" },
        { id: "reviews", label: "Reviews" },
        { id: "platform", label: "Events and sessions" },
        { id: "types", label: "Request and response types" },
        { id: "errors", label: "Errors" },
      ]}
      previous={{ href: "/components/angular", label: "Angular components" }}
      next={{ href: "/pricing", label: "Pricing" }}
    >
      <h2 id="conventions">Conventions</h2>
      <div className="term-list compact">
        <div><b>Base URL</b><p><code>https://app.mindbill.org/partner/v2</code></p></div>
        <div><b>Authentication</b><p><code>Authorization: Bearer mb_live_...</code></p></div>
        <div><b>Writes</b><p>Send <code>Idempotency-Key</code>; reuse it only to retry the same mutation.</p></div>
        <div><b>Uploads</b><p>Multipart form data. Other request bodies are JSON.</p></div>
        <div><b>Organization</b><p>The API key fixes the tenant. Multi-org keys also send <code>x-mindbill-org-id</code>.</p></div>
      </div>

      <h2 id="bills">Bills and lifecycle</h2>
      <EndpointTable endpoints={billEndpoints} />

      <h2 id="documents">Documents</h2>
      <EndpointTable endpoints={documentEndpoints} />

      <h2 id="reviews">Second and independent bill review</h2>
      <EndpointTable endpoints={reviewEndpoints} />

      <h2 id="platform">Events, webhooks, and browser sessions</h2>
      <EndpointTable endpoints={platformEndpoints} />
      <Callout title="Callbacks are not durable state">Use browser callbacks for UI feedback. Use ordered events or signed webhooks for payer responses that arrive after the user leaves.</Callout>

      <h2 id="types">Request and response types</h2>
      <h3>Create and read bills</h3>
      <CodeBlock code={createTypes} filename="CreateBillRequest.ts" />
      <CodeBlock code={billOutput} filename="Bill.ts" />
      <h3>Delivery and submission</h3>
      <CodeBlock code={deliveryTypes} filename="Submission.ts" />
      <h3>Status and actions</h3>
      <CodeBlock code={statusTypes} filename="Lifecycle.ts" />
      <CodeBlock code={eorTypes} filename="EOR.ts" />
      <h3>Documents</h3>
      <CodeBlock code={documentTypes} filename="Documents.ts" />
      <h3>Reviews</h3>
      <CodeBlock code={reviewTypes} filename="Reviews.ts" />
      <h3>Browser sessions</h3>
      <CodeBlock code={sessionTypes} filename="BrowserSession.ts" />
      <h3>Events and webhook delivery</h3>
      <CodeBlock code={eventTypes} filename="Events.ts" />

      <h2 id="errors">Errors</h2>
      <p>Errors include a machine code, message, optional field issues, and request ID.</p>
      <CodeBlock code={error} language="json" filename="HTTP 422" />
    </DocPage>
  );
}
