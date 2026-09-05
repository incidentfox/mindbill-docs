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

export default function BillsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="The bill resource"
      description="A bill is created and submitted atomically as an immutable snapshot of the claim, services, providers, and payer packet."
      toc={[
        { id: "snapshot", label: "Snapshot model" },
        { id: "submit", label: "Create and submit" },
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

      <h2 id="query">Find submitted bills from your records</h2>
      <p>Store the stable MindBill bill ID after successful submission, or find submitted bills later using your external identifiers.</p>
      <CodeBlock code={list} filename="server/find-bills.ts" />

      <h2 id="availability">Billing-mode availability</h2>
      <p>Use <code>med_legal</code> for California medical-legal bills, including QME and AME workflows.</p>
      <Callout title="Professional billing is reserved"><code>professional</code> is present in forward-compatible SDK types but is not enabled in the public Partner API yet.</Callout>
    </DocPage>
  );
}
