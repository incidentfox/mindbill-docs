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
  onSubmit={async ({ bill, sourceAttachmentIds, uploads }) => {
    const submitted = await submitBill({
      bill,
      sourceAttachmentIds,
      uploads,
    });
    setBillId(submitted.id);
  }}
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
      <p>Resolve selected source attachments and new uploads on your server, encode their bytes, and include them in the same atomic <code>createAndSubmitBill</code> request as the bill data. Store the returned bill ID only after success.</p>
      <CodeBlock code={serverSubmission} filename="server/submit-with-documents.ts" />
      <Callout title="No partially assembled bill">The public API does not expose initial document upload, removal, or separate submit mutations. If validation or packet preparation fails before submission, MindBill creates no public bill.</Callout>

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
