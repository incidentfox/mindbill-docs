import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Documents and payer packets" };

const serverSubmission = `const report = await fetch(reportDownloadUrl);
const contentBase64 = Buffer.from(await report.arrayBuffer()).toString("base64");

const bill = await mindbill.createAndSubmitBill({
  bill: billingSnapshot,
  submission: { route: "ebill" },
  documents: [{
    filename: "final-report.pdf",
    documentType: "final_report",
    contentBase64,
    externalId: "document_88",
    description: "Final medical-legal report",
  }],
}, "submit-report-9f7a");`;

const component = `<BillSubmissionForm
  initialBill={billingSnapshot}
  attachments={availableCaseDocuments}
  sessionEndpoint="/api/mindbill/submission-session"
  onSubmitted={({ billId }) => setBillId(billId)}
/>`;

export default function DocumentsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Build the payer packet"
      description="Review claim data and payer documents together, then create and submit one immutable bill snapshot."
      toc={[
        { id: "packet", label: "What belongs in the packet" },
        { id: "review", label: "Review in the component" },
        { id: "submit", label: "Submit atomically" },
        { id: "limits", label: "Size limits" },
        { id: "types", label: "Document types" },
      ]}
      previous={{ href: "/guides/bills", label: "The bill resource" }}
      next={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
    >
      <h2 id="packet">Choose the billing packet explicitly</h2>
      <p>For a California medical-legal bill, the payer packet commonly includes the final report, proof of service, required DWC forms, and the current W-9. The exact packet depends on the service and dispute.</p>
      <ul>
        <li>Preselect the final report, proof of service, required billing forms, and W-9 when your product already has them.</li>
        <li>Never silently attach medical records. Add them only when a user intentionally chooses them.</li>
        <li>Keep documents served on attorneys distinct from documents sent with the payer bill.</li>
        <li>Show the full packet before submission and let the user add or remove support.</li>
      </ul>
      <Callout tone="warning" title="Billing packet is not report service">Serving a report on case parties and submitting a bill to a claims administrator are separate workflows. A document may belong in one packet, both packets, or neither.</Callout>

      <h2 id="review">Review fields and attachments in one component</h2>
      <p>The React <code>BillSubmissionForm</code> renders the complete bill table, marks required fields with a red asterisk, validates values, lists prefilled case documents, accepts additional uploads, and owns the Submit button. There is no draft bill to create or maintain.</p>
      <CodeBlock code={component} filename="CaseBilling.tsx" />

      <h2 id="submit">Send documents with the immutable snapshot</h2>
      <p>The connected component resolves selected source attachments and new uploads, encodes their PDF bytes, and includes them in the same atomic request as the bill data. For API-only integrations, perform the equivalent operation on your server. Store the returned bill ID only after success.</p>
      <CodeBlock code={serverSubmission} filename="server/submit-with-documents.ts" />
      <Callout title="No partially assembled bill">The public API does not expose initial document upload, removal, or separate submit mutations. If validation or packet preparation fails before submission, MindBill creates no public bill.</Callout>

      <h2 id="limits">Size limits</h2>
      <p>Documents travel base64-encoded inside the JSON body, and base64 adds about 33% to every file. Budget against the decoded PDF bytes:</p>
      <div className="term-list compact">
        <div><code>25 MB</code><p>Largest single PDF, measured before encoding. A larger document returns <code>415 invalid_pdf</code>.</p></div>
        <div><code>45 MB</code><p>Largest total across all documents on one submission. Exceeding it returns <code>413 submission_too_large</code>.</p></div>
        <div><code>25</code><p>Most documents on one submission. More returns <code>422 validation_error</code>.</p></div>
        <div><code>64 MB</code><p>Largest HTTP request body, documents plus bill JSON. Exceeding it returns <code>413 request_too_large</code>.</p></div>
      </div>
      <p>Only PDFs are accepted; MindBill verifies the leading bytes of every document and rejects anything else with <code>415 invalid_pdf</code>.</p>
      <Callout title="Sizing a large packet">The 45 MB document budget is the one to plan against. It sits below the 64 MB body limit precisely so a full-size packet still fits once encoding and the surrounding bill JSON are added. If a packet approaches it, split the supporting records rather than the report itself.</Callout>

      <h2 id="types">Document types</h2>
      <div className="term-list compact">
        <div><code>final_report</code><p>The signed report supporting the billed evaluation.</p></div>
        <div><code>proof_of_service</code><p>Evidence that the report or required notice was served.</p></div>
        <div><code>letter_of_attestation</code><p>A declaration or attestation required for the service.</p></div>
        <div><code>form_122</code><p>California DWC Form 122 when applicable.</p></div>
        <div><code>return_to_work_voucher</code><p>A return-to-work voucher intentionally included with the bill.</p></div>
        <div><code>w9</code><p>The billing provider&apos;s current tax form.</p></div>
        <div><code>medical_records</code><p>Supporting records selected intentionally, never by default.</p></div>
        <div><code>appeal</code> / <code>other</code><p>Second-review support or another payer-facing PDF.</p></div>
      </div>
    </DocPage>
  );
}
