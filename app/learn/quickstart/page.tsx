import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/node`;

const client = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});`;

const create = `const bill = await mindbill.createBill(
  {
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
    billingProvider: {
      name: "Northstar Medical Evaluators",
      taxId: "123456789",
      npi: "1234567893",
      address: {
        line1: "200 Office Ave",
        city: "Fresno",
        state: "CA",
        postalCode: "93721",
      },
    },
    renderingProvider: {
      name: "Morgan Chen, MD",
      npi: "1234567893",
      licenseNumber: "A12345",
      licenseState: "CA",
      isQme: true,
    },
    serviceLocation: {
      name: "Fresno Exam Office",
      placeOfServiceCode: "11",
      address: {
        line1: "200 Office Ave",
        city: "Fresno",
        state: "CA",
        postalCode: "93721",
      },
    },
    diagnoses: ["M25.512"],
    serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
  },
  "create-report_9f7a"
);

await saveMindBillId("report_9f7a", bill.id);`;

const attach = `const response = await fetch("https://example.test/final-report.pdf");
const report = await response.blob();

await mindbill.uploadBillDocument(
  bill.id,
  {
    file: report,
    filename: "final-report.pdf",
    documentType: "final_report",
    externalId: "document_88",
  },
  "attach-document_88"
);`;

const submit = `const submission = await mindbill.submitBill(
  bill.id,
  { route: "ebill" },
  "submit-report_9f7a"
);

// Sandbox: synthetic 999 and 277CA acknowledgements.
console.log(submission);`;

const status = `const { data: status } = await mindbill.getBillStatus(bill.id);

console.log(status.state);       // submitted, accepted, processed, paid, ...
console.log(status.balanceDue);  // normalized across delivery networks`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Submit your first sandbox bill"
      description="Create one California medical-legal bill, attach its report, submit it electronically, and read its normalized status. Sandbox submissions do not reach a payer."
      toc={[
        { id: "install", label: "Install and authenticate" },
        { id: "create", label: "Create a bill" },
        { id: "attach", label: "Attach the payer packet" },
        { id: "submit", label: "Submit" },
        { id: "status", label: "Read status" },
      ]}
      previous={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
      next={{ href: "/learn/routing", label: "Routing and EDI" }}
    >
      <Callout title="The integration contract">Your server sends structured bill data and explicit documents. MindBill returns a stable <code>billId</code> that represents submission, acknowledgements, EORs, payments, disputes, corrections, and closure.</Callout>
      <Steps>
        <Step title="Install and authenticate">
          <span id="install" />
          <p>Use a sandbox API key on your server. API keys are organization-scoped credentials and must never be sent to a browser.</p>
          <CodeBlock code={install} language="bash" filename="Terminal" />
          <CodeBlock code={client} filename="billing.ts" />
        </Step>
        <Step title="Create the bill">
          <span id="create" />
          <p>Send the snapshot that should appear on the CMS-1500. Use <code>externalId</code> for your report, patient, or claim IDs; store the returned MindBill <code>bill.id</code>.</p>
          <CodeBlock code={create} filename="create-bill.ts" />
          <Callout tone="warning" title="Current capability">The public API currently accepts <code>billingMode: &quot;med_legal&quot;</code>. Professional treatment billing is not yet released.</Callout>
        </Step>
        <Step title="Attach the payer packet">
          <span id="attach" />
          <p>Upload each document intentionally. A typical medical-legal packet includes the final report, proof of service, and W-9. Do not silently attach medical records.</p>
          <CodeBlock code={attach} filename="attach-report.ts" />
        </Step>
        <Step title="Submit the bill">
          <span id="submit" />
          <p>Submission runs the final scrub, resolves the requested route, records an immutable attempt, and starts the lifecycle. Reuse an idempotency key only when retrying the same logical write.</p>
          <CodeBlock code={submit} filename="submit-bill.ts" />
        </Step>
        <Step title="Read status">
          <span id="status" />
          <p>Poll status for an immediate screen, or consume ordered events and signed webhooks for durable synchronization.</p>
          <CodeBlock code={status} filename="read-status.ts" />
        </Step>
      </Steps>
      <h2 id="ui">Optional: embed the review UI</h2>
      <p>If users should review the claim inside your product, create the bill on your server first, then render the React or Angular lifecycle component with its <code>billId</code>. The component handles payer search, documents, delivery choices, submission, EORs, and valid next actions.</p>
    </DocPage>
  );
}
