import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Documents" };

const upload = `const billing = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const { billId } = await billing.createBill(bill);

for (const document of sourceDocuments) {
  await billing.addAttachment(
    document.file,
    document.type,
    document.description,
  );
}

linkBillToCase(billId);`;

const component = `<ConnectedBillLifecycle
  billId={billId}
  sessionEndpoint="/api/mindbill/session"
/>`;

export default function DocumentsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Build the payer packet"
      description="Documents are explicit bill resources. Show the proposed payer packet, then let the user intentionally add or remove support before submission."
      toc={[
        { id: "defaults", label: "Safe defaults" },
        { id: "components", label: "Use the components" },
        { id: "upload", label: "Upload a PDF" },
        { id: "types", label: "Document types" },
      ]}
      previous={{ href: "/guides/bills", label: "Create and edit bills" }}
      next={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
    >
      <h2 id="defaults">Safe defaults</h2>
      <ul>
        <li>Default the final report, proof of service, required billing forms, and current W-9 when present.</li>
        <li>Never silently attach medical records.</li>
        <li>Keep the attorney report-service packet separate from the payer billing packet.</li>
        <li>Allow arbitrary supporting PDFs to be added intentionally.</li>
      </ul>
      <h2 id="components">Let the component manage review</h2>
      <p>The React and Angular lifecycle components list every payer document, provide preview and removal controls, and accept additional PDFs. Once you have attached your defaults, render the same bill and let the user confirm the final packet.</p>
      <CodeBlock code={component} filename="CaseBilling.tsx" />
      <Callout tone="warning" title="No hidden packet changes">The user sees exactly what will be sent. Medical records and editable working drafts are never selected automatically.</Callout>
      <h2 id="upload">Create and upload with the browser client</h2>
      <p>Attachment selection stays explicit. Create the private draft in the browser, upload only the source documents you intend to include, then store the returned bill ID.</p>
      <CodeBlock code={upload} filename="billing.ts" />
      <h2 id="types">Document types</h2>
      <p>Use one of <code>final_report</code>, <code>proof_of_service</code>, <code>letter_of_attestation</code>, <code>form_122</code>, <code>return_to_work_voucher</code>, <code>w9</code>, <code>medical_records</code>, <code>appeal</code>, or <code>other</code>.</p>
    </DocPage>
  );
}
