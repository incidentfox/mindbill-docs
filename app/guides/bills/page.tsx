import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "The bill resource" };

const setup = `npm install @mindbill/node@latest`;

const submit = `import { readFile } from "node:fs/promises";
import { MindBillClient } from "@mindbill/node";

const apiKey = process.env.MINDBILL_API_KEY;
if (!apiKey) throw new Error("Set MINDBILL_API_KEY on your server");
const mindbill = new MindBillClient({ apiKey });
const finalReportBytes = await readFile("./final-report.pdf");

const bill = await mindbill.createAndSubmitBill({
  bill: {
    externalId: "report_9f7a",
    billingMode: "med_legal",
    patient: {
      externalId: "patient_42",
      firstName: "Alex",
      lastName: "Morgan",
      dateOfBirth: "1984-03-12",
      address: {
        line1: "100 Main St",
        city: "Fresno",
        state: "CA",
        postalCode: "93721",
      },
    },
    claim: {
      externalId: "injury_81",
      claimNumber: "WC-44871",
      employer: "Example Foods, Inc.",
      dateOfInjury: "2026-02-14",
      injuryState: "CA",
      claimsAdministrator: {
        id: selectedAdministrator.id,
        name: selectedAdministrator.name,
        payerId: selectedPayer.key,
      },
    },
    service: { date: "2026-08-26" },
    billingProvider: {
      name: "Northstar Evaluations",
      taxId: "123456789",
      npi: "1234567893",
      phone: "5595550100",
      address: { line1: "200 Market St", city: "Fresno", state: "CA", postalCode: "93721" },
    },
    renderingProvider: {
      name: "Morgan Chen, MD",
      npi: "1234567893",
      taxonomy: "2084P0800X",
      licenseNumber: "A12345",
      licenseState: "CA",
    },
    serviceLocation: {
      name: "Fresno Exam Office",
      placeOfServiceCode: "11",
      address: { line1: "300 Pine Ave", city: "Fresno", state: "CA", postalCode: "93721" },
    },
    diagnoses: ["M25.562"],
    serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
  },
  submission: { route: "ebill" },
  documents: [{
    filename: "final-report.pdf",
    documentType: "final_report",
    contentBase64: finalReportBytes.toString("base64"),
    externalId: "document_88",
  }],
}, "submit-report-9f7a");

await saveBillId(bill.id);`;

const list = `const page = await mindbill.listBills({
  externalId: "report_9f7a",
  patientExternalId: "patient_42",
  claimExternalId: "injury_81",
  limit: 25,
});`;

const professionalPricing = `// Pricing-relevant excerpt from an otherwise complete bill request.
// ZIP, place of service, and taxonomy live on the parent bill—not the line.
{
  "billingMode": "professional",
  "claim": {
    "injuryState": "CA"
  },
  "service": {
    "date": "2026-09-22"
  },
  "renderingProvider": {
    "taxonomy": "2084P0800X"
  },
  "serviceLocation": {
    "placeOfServiceCode": "11",
    "address": {
      "postalCode": "94403"
    }
  },
  "serviceLines": [{
    "code": "99213",
    "units": 1
  }]
}

// Returned service-line excerpt. Amounts here are dollars.
{
  "code": "99213",
  "charge": 181.68,
  "pricing": {
    "status": "calculated",
    "expectedAmount": 181.68,
    "scheduleMaximumAmount": 181.68,
    "statutoryMaximumAmount": 181.68,
    "reimbursementBasis": "statutory_schedule",
    "warnings": []
  }
}`;

export default function BillsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="The bill resource"
      description="Create and submit an immutable claim snapshot, with automatic fee calculation for supported California professional services."
      toc={[
        { id: "snapshot", label: "Snapshot model" },
        { id: "submit", label: "Create and submit" },
        { id: "pricing", label: "Professional pricing" },
        { id: "query", label: "Find bills" },
        { id: "availability", label: "Availability" },
      ]}
      previous={{ href: "/guides/authentication", label: "Authentication" }}
      next={{ href: "/guides/documents", label: "Documents" }}
    >
      <h2 id="snapshot">Collect locally, then submit one exact snapshot</h2>
      <p>Workers&apos; compensation bills carry more claim context than an ordinary patient invoice. Collect and edit the patient, injury, claims administrator, employer, providers, place of service, diagnoses, service lines, and attachments in your application before calling MindBill.</p>
      <p>MindBill has no public draft bill. A successful request creates the bill with <code>submitted</code> as its first status and freezes the submitted values so later profile changes cannot rewrite billing history.</p>
      <Callout title="Use the ready-to-use form">The React <code>BillSubmissionForm</code> owns the field layout, required-field asterisks, validation, attachment selection and uploads, wire serialization, and atomic Submit action. Your server only mints its short-lived browser session.</Callout>

      <h2 id="submit">Create and submit atomically</h2>
      <p>Send the bill snapshot, routing choice, and documents in one operation. The connected React component does this directly; server-only integrations can use the Node SDK shown below. Use an idempotency key tied to the logical submission so a network retry cannot create a duplicate.</p>
      <CodeBlock code={setup} language="bash" filename="Terminal" />
      <p>First <Link href="/api-reference/claims-administrators">look up the claims administrator</Link> and select an electronic payer route from its <code>payers</code> array. In this example, <code>selectedAdministrator</code> is that directory result, <code>selectedPayer</code> is the selected payer, and <code>saveBillId</code> is your own persistence function. Replace the synthetic bill fields and PDF with reviewed sandbox data.</p>
      <CodeBlock code={submit} filename="server/submit-bill.ts" />
      <Callout title="Failure does not create a bill">Validation and other pre-submission failures create no public bill. Retry an identical request with the same idempotency key. After a confirmed validation failure, use a new key for a corrected payload. If the outcome is uncertain, retry the original request or reconcile the result before creating a new submission. Save the returned bill ID after success.</Callout>

      <h2 id="pricing">Let MindBill calculate professional fees</h2>
      <p>For a California CMS-1500 bill with <code>billingMode: &quot;professional&quot;</code>, MindBill calculates supported lines from the complete bill context. ZIP and place of service are not repeated on each ordinary service line: they come from <code>bill.serviceLocation</code>. Provider type comes from <code>bill.renderingProvider.taxonomy</code>, and a line&apos;s date defaults to <code>bill.service.date</code>.</p>
      <div className="term-list">
        <div><b><code>bill.claim.injuryState</code></b><p>Selects the governing jurisdiction. Automatic California OMFS pricing requires <code>CA</code>.</p></div>
        <div><b><code>bill.serviceLocation.address.postalCode</code></b><p>Maps the service to the applicable geographic locality when the schedule is locality-sensitive.</p></div>
        <div><b><code>bill.serviceLocation.placeOfServiceCode</code></b><p>Selects the actual setting, including facility versus non-facility treatment where the schedule distinguishes them.</p></div>
        <div><b><code>bill.renderingProvider.taxonomy</code></b><p>Identifies the rendering provider type used by provider-specific rules and percentages.</p></div>
        <div><b><code>bill.service.date</code> or <code>serviceLines[].serviceDate</code></b><p>Selects the fee source and rules effective on the actual date of service. A line date overrides the bill-level date for that line.</p></div>
        <div><b><code>serviceLines[].code</code>, <code>units</code>, and <code>modifiers</code></b><p>Identify the service, quantity, and applicable modifier rules. Include the actual modifiers; do not add one only to obtain a different price.</p></div>
        <div><b><code>serviceLines[].feeContext</code></b><p>Supplies specialty or encounter facts that cannot be derived safely from the ordinary bill fields. Explicit context wins over inferred defaults.</p></div>
      </div>
      <p>The following is deliberately only the pricing-relevant excerpt. A real submission must also contain the patient, claim, provider, payer, diagnoses, and other required fields shown in the <Link href="/api-reference/create-bill">create-bill reference</Link>.</p>
      <CodeBlock code={professionalPricing} language="json" filename="Professional bill pricing inputs and returned line" />
      <p>For supported ordinary physician and office physical-therapy lines, <code>serviceLines[].charge</code> is optional. MindBill calculates the applicable fee and uses a matching practice charge schedule when one exists; otherwise the billed charge defaults to the calculated statutory maximum. The statutory maximum itself still reflects the date, ZIP/locality, place of service, provider type, code, units, modifiers, and any required context.</p>
      <p>If you supply <code>charge</code>, it is the extended billed-charge override in dollars, not a unit price and never a caller-selected allowance. A <code>charge</code> of <code>999</code> can remain the submitted charge while <code>pricing.expectedAmount</code> stays capped at the verified schedule maximum. Quote fields explicitly ending in <code>Cents</code> use integer cents instead.</p>
      <p>Send <code>feeContext</code> when the actual service differs from the standard inferred facts or needs details that cannot be derived from the bill. Explicit context wins over defaults. Read <code>pricing.status</code>, <code>expectedAmount</code>, <code>scheduleMaximumAmount</code>, <code>reimbursementBasis</code>, sources, and warnings from each returned line. A review warning means no verified reimbursement was saved; it never turns the submitted charge into an allowance.</p>
      <Callout title="Charges and reimbursement stay separate"><code>charge_exceeds_schedule_maximum</code> preserves an above-maximum billed charge while keeping reimbursement capped. <code>fee_context_required</code> and <code>saved_fee_quote_mismatch</code> identify lines that need calculation review. Use <code>pricing.expectedAmount</code> for the estimate; the legacy <code>feeSchedule</code> field can contain a historical manual charge.</Callout>
      <p>The standalone quote API represents some of these same facts differently: <code>POST /fee-quotes/ca/claim</code> accepts <code>lines[].serviceZip</code> and <code>lines[].physicianContext.placeOfService</code>. Do not copy those quote-only field names into <code>bill.serviceLines[]</code>. For the exact quote shape, encounter-wide NCCI and unit-edit assessment, specialty inputs, calculation steps, and source citations, use the <Link href="/guides/fee-schedules#request-shapes">California fee calculator guide</Link>.</p>

      <h2 id="query">Find submitted bills from your records</h2>
      <p>Store the stable MindBill bill ID after successful submission, or find submitted bills later using your external identifiers.</p>
      <CodeBlock code={list} filename="server/find-bills.ts" />
      <p>For staff searches, use <code>q</code> to match words across patient and claims-administrator names, bill and claim IDs, external IDs, statuses, procedure codes, and dates. Every word must match somewhere in the bill; matching ignores case. Combine this with <code>dateField=service</code> or <code>dateField=submitted</code> and inclusive <code>from</code>/<code>to</code> dates in <code>YYYY-MM-DD</code> format. See <Link href="/api-reference/list-bills">all bill query parameters</Link>.</p>
      <p>Use canonical <code>patientId</code>, <code>renderingProviderId</code>, and <code>claimsAdminId</code> parameters to filter related bills. The dashboard supplies patient and administrator choices across the authorized bill inventory, independent of pagination and active filters. React 0.67.0 connects detail names to these filters by default in <code>ConnectedBillingWorkspace</code>; host callbacks can override navigation.</p>
      <p><code>ConnectedBillSearch</code> and the workspace registry provide these controls out of the box. Apply text and dates with Search or Enter; status, age, patient, rendering-provider, and claims-administrator filters apply immediately. Clear resets the search and filters. <code>BillingDashboard</code> instead filters the array supplied by your host immediately.</p>

      <h2 id="availability">Billing-mode availability</h2>
      <p>Use <code>med_legal</code> for California medical-legal bills, including QME and AME workflows.</p>
      <Callout title="Treatment billing requires organization access"><code>professional</code> billing and automatic professional fee calculation are available when treatment billing is enabled for your organization. Follow the <Link href="/learn/treatment-quickstart">treatment billing quickstart</Link> for setup and service-line examples.</Callout>
    </DocPage>
  );
}
