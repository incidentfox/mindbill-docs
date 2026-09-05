import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Documents and payer packets" };

const serverSubmission = `const report = await fetch(reportDownloadUrl);
if (!report.ok) throw new Error("Unable to load final report");
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
  attachments={selectedBillingDocuments}
  sessionEndpoint="/api/mindbill/submission-session"
  onSubmitted={({ billId }) => saveBillId(billId)}
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
        { id: "w9-settings", label: "Practice W-9 settings" },
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
      <p>The React <code>BillSubmissionForm</code> lets users review prefilled fields and PDFs, add or remove supporting documents, and submit the complete packet. Pass only the source documents chosen for billing: every supplied attachment is included unless removed, even if it has <code>selected: false</code>.</p>
      <CodeBlock code={component} filename="CaseBilling.tsx" />

      <h2 id="submit">Send documents with the immutable snapshot</h2>
      <p>The connected component resolves selected source attachments and new uploads, encodes their PDF bytes, and includes them in the same atomic request as the bill data. For API-only integrations, perform the equivalent operation on your server. Store the returned bill ID only after success.</p>
      <CodeBlock code={serverSubmission} filename="server/submit-with-documents.ts" />
      <Callout title="No partially assembled bill">The public API does not expose initial document upload, removal, or separate submit mutations. If validation or packet preparation fails before submission, MindBill creates no public bill.</Callout>

      <h2 id="w9-settings">Choose one owner for practice W-9 settings</h2>
      <p>If you want MindBill to store the practice profile and W-9, embed <code>BillingSettings</code> or <code>OrganizationOnboarding</code> with a separate, admin-authorized <code>organization:manage</code> session. Reuse the saved profile when prefilling future bills.</p>
      <p>If your app already uploads, stores, and extracts W-9s, keep that source of truth. React 0.50.0&apos;s <code>W9Upload</code> provides the common UI through host callbacks; it does not upload to MindBill or run a parser itself. Reuse your existing server upload and extraction workflow, then reload the persisted document and extraction state:</p>
      <CodeBlock filename="PracticeW9.tsx" code={`import { W9Upload } from "@mindbill/react";

<W9Upload
  document={profile.w9} // { filename, addedAt? } or undefined
  extractionStatus={profile.w9ExtractionStatus}
  onUpload={async (file) => {
    await uploadPracticeW9(file); // YOUR authenticated host-server adapter
    await reloadPracticeProfile();
  }}
  onView={() => openAuthorizedW9()}
  onRetryExtraction={async () => {
    await retryPracticeW9Extraction();
    await reloadPracticeProfile();
  }}
  appearance={{ preset: "mindbill" }}
/>`} />
      <p>Extraction statuses are <code>idle</code>, <code>queued</code>, <code>processing</code>, <code>complete</code>, <code>not_found</code>, and <code>failed</code>. Pass the real server state; upload success does not mean extraction succeeded. Continue your existing polling or refresh until extraction finishes, and let an authorized user review extracted billing details before using them.</p>
      <p><code>onView</code> and <code>onRetryExtraction</code> are optional. The adapter also accepts <code>maxSizeBytes</code>, <code>disabled</code>, <code>className</code>, <code>style</code>, and the shared <code>appearance</code> tokens. Ensure the upload limit matches your host server.</p>
      <Callout tone="warning" title="The server still owns authorization and sensitive data">Protect upload, retry, and download routes with practice-admin authorization and CSRF controls. Validate actual PDF bytes and size on your server, not just client MIME types or filenames. Use your existing secure tax-ID storage; never expose plaintext SSNs in widget state, logs, analytics, browser storage, or agent prompts. Do not duplicate a host-owned W-9 in MindBill settings solely to use the UI.</Callout>

      <h2 id="limits">Size limits</h2>
      <p>Documents travel base64-encoded inside the JSON body, and base64 adds about 33% to every file. Budget against the decoded PDF bytes:</p>
      <div className="term-list compact">
        <div><code>25 MB</code><p>Largest single PDF, measured before encoding. A larger document returns <code>415 invalid_pdf</code>.</p></div>
        <div><code>45 MB</code><p>Largest total across all documents on one submission. Exceeding it returns <code>413 submission_too_large</code>.</p></div>
        <div><code>25</code><p>Most documents on one submission. More returns <code>422 validation_error</code>.</p></div>
        <div><code>64 MB</code><p>Largest HTTP request body, documents plus bill JSON. Exceeding it returns <code>413 request_too_large</code>.</p></div>
      </div>
      <p>Only PDFs are accepted; MindBill verifies the leading bytes of every document and rejects anything else with <code>415 invalid_pdf</code>.</p>
      <Callout title="Sizing a large packet">The 45 MB document budget is the one to plan against. It sits below the 64 MB body limit precisely so a full-size packet still fits once encoding and the surrounding bill JSON are added. If a packet approaches it, compress the PDFs or remove documents that do not belong in the packet. Splitting one PDF into several does not reduce the total byte count.</Callout>

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
