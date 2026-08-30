import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Documents and payer packets" };

const upload = `const response = await fetch(report.downloadUrl);
const file = await response.blob();

await mindbill.uploadBillDocument(bill.id, {
  file,
  filename: "final-report.pdf",
  documentType: "final_report",
  externalId: "document_88",
  description: "Final medical-legal report",
}, "attach-document-88");

const { data: documents } = await mindbill.listBillDocuments(bill.id);`;

const remove = `await mindbill.deleteBillDocument(
  bill.id,
  documentId,
  "remove-document-88",
);`;

const browserUpload = `import { createBillLifecycleClient } from "@mindbill/browser";

const billing = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const { billId } = await billing.createBill(knownBillValues);

for (const document of defaultPayerDocuments) {
  await billing.addAttachment(
    document.file,
    document.type,
    document.description,
  );
}

// Persist billId in your product, then open the same bill in the component.
setBillId(billId);`;

const component = `<ConnectedBillLifecycle
  billId={billId}
  sessionEndpoint="/api/mindbill/session"
/>`;

export default function DocumentsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Build the payer packet"
      description="A workers’ comp bill is often more than claim data. Attach the reports and forms the payer needs, while keeping unrelated medical records out of the packet."
      toc={[
        { id: "packet", label: "What belongs in the packet" },
        { id: "upload", label: "Upload documents" },
        { id: "review", label: "Let the user review" },
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

      <h2 id="upload">Upload documents</h2>
      <p>The structured create request and document bytes are separate calls. In a browser-first integration, create the private draft and immediately attach the intended payer documents with the same short-lived session:</p>
      <CodeBlock code={browserUpload} filename="create-bill-with-documents.ts" />
      <p>If your files must stay on the server, the Node SDK provides the same document operations. Use an idempotency key so a retry cannot create duplicate attachments.</p>
      <CodeBlock code={upload} filename="server/attach-report.ts" />
      <p>Remove a document while the draft is still being reviewed:</p>
      <CodeBlock code={remove} filename="server/remove-document.ts" />

      <h2 id="review">Let the user review the packet</h2>
      <p>The React and Angular lifecycle components list every attached document, provide preview and removal controls, and accept additional PDFs. After creating and attaching defaults, pass the returned <code>billId</code> to open that draft for review.</p>
      <CodeBlock code={component} filename="CaseBilling.tsx" />
      <Callout title="Creation and upload are sequential today">The bill ID is returned before documents are uploaded. Keep that ID even if a later upload fails, then retry only the missing document. The lifecycle component will show the resulting packet.</Callout>

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
