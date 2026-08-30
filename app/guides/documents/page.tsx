import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Documents" };

const upload = `const file = new Blob([pdfBytes], { type: "application/pdf" });

const document = await mindbill.uploadBillDocument(
  billId,
  {
    file,
    filename: "final-report.pdf",
    documentType: "final_report",
    externalId: "document_883",
    description: "Signed final report",
  },
  "attach-document-883",
);`;

export default function DocumentsPage() {
  return (
    <DocPage eyebrow="Build" title="Build the payer packet" description="Documents are explicit bill resources. Upload the sensible billing packet by default, show it for review, and let the user intentionally add or remove support before submission."
      toc={[{ id: "defaults", label: "Safe defaults" }, { id: "upload", label: "Upload a PDF" }, { id: "types", label: "Document types" }]}
      previous={{ href: "/guides/bills", label: "Create and edit bills" }} next={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}>
      <h2 id="defaults">Safe defaults</h2>
      <ul>
        <li>Default the final report, proof of service, required billing forms, and current W-9 when present.</li>
        <li>Never silently attach medical records.</li>
        <li>Keep the attorney report-service packet separate from the payer billing packet.</li>
        <li>Allow arbitrary supporting PDFs to be added intentionally.</li>
      </ul>
      <Callout tone="warning" title="Review before send">The React and Angular lifecycle components list every payer document and allow removal before submission.</Callout>
      <h2 id="upload">Upload a PDF</h2>
      <CodeBlock code={upload} filename="server/attach-document.ts" />
      <h2 id="types">Document types</h2>
      <p>Use one of <code>final_report</code>, <code>proof_of_service</code>, <code>letter_of_attestation</code>, <code>form_122</code>, <code>return_to_work_voucher</code>, <code>w9</code>, <code>medical_records</code>, <code>appeal</code>, or <code>other</code>.</p>
    </DocPage>
  );
}

