import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "The bill resource" };

const create = `const created = await mindbill.createBill({
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
    claimsAdministrator: { name: "Example Claims Administrator" },
  },
  service: { date: "2026-08-26" },
  billingProvider: {
    name: "Northstar Evaluations",
    taxId: "123456789",
    npi: "1234567890",
    address: { line1: "200 Market St", city: "Fresno", state: "CA", postalCode: "93721" },
  },
  renderingProvider: {
    name: "Morgan Chen, MD",
    npi: "1098765432",
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
}, "create-report-9f7a");

const billId = created.id;`;

const update = `await mindbill.updateBill(billId, {
  claim: {
    claimNumber: "WC-44871-A",
    employer: "Example Foods, Inc.",
  },
  serviceLines: [
    { code: "ML201", modifiers: ["95"], units: 1 },
    { code: "MLPRR", modifiers: [], units: 3 },
  ],
}, "update-report-9f7a-v2");`;

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
      description="A bill is an immutable-at-submission snapshot of the people, claim, services, diagnoses, providers, and locations that must appear on the claim."
      toc={[
        { id: "snapshot", label: "Snapshot model" },
        { id: "create", label: "Create a draft" },
        { id: "update", label: "Edit a draft" },
        { id: "query", label: "Find bills" },
        { id: "availability", label: "Availability" },
      ]}
      previous={{ href: "/guides/authentication", label: "Authentication" }}
      next={{ href: "/guides/documents", label: "Documents" }}
    >
      <h2 id="snapshot">Send the exact billing snapshot</h2>
      <p>Workers&apos; compensation bills carry more claim context than an ordinary patient invoice. Send the patient, injury, claims administrator, employer, billing and rendering providers, place of service, diagnoses, and service lines that should print on the CMS-1500 and travel in the 837P.</p>
      <p>Reusable provider or location records are optional. Each submitted bill freezes its own values so later profile changes cannot rewrite billing history.</p>
      <Callout title="Keep your relationships with external IDs">Add your report, case, patient, and injury IDs. You can later query MindBill using those identifiers without duplicating your entire application database.</Callout>

      <h2 id="create">Create a private draft</h2>
      <p>This example uses the server SDK for a headless workflow. The React, Angular, and framework-neutral browser clients can create the same resource directly with a short-lived session. Use an idempotency key tied to the logical operation so a network retry cannot create a duplicate.</p>
      <CodeBlock code={create} filename="server/create-bill.ts" />

      <h2 id="update">Correct a draft before submission</h2>
      <p>Patch the bill while it is editable. The connected React and Angular components perform this call themselves and let a user correct prefilled values before sending.</p>
      <CodeBlock code={update} filename="server/update-bill.ts" />

      <h2 id="query">Find bills from your own records</h2>
      <p>Store the stable MindBill bill ID when convenient, or find bills later using your external identifiers.</p>
      <CodeBlock code={list} filename="server/find-bills.ts" />

      <h2 id="availability">Billing-mode availability</h2>
      <p><code>med_legal</code> is available for California medical-legal billing. The <code>professional</code> treatment-billing mode is reserved in the API but is not yet generally available.</p>
      <Callout tone="warning" title="Do not send treatment bills yet">A request with <code>billingMode: &quot;professional&quot;</code> currently returns a capability error instead of silently producing an unsupported claim.</Callout>
    </DocPage>
  );
}
