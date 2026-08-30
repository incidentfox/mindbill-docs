import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Create and edit bills" };

const update = `const bill = await mindbill.updateBill(
  billId,
  {
    claim: {
      claimNumber: "WC-44871-A",
      employer: "Example Foods, Inc.",
      claimsAdministrator: { name: "Example Claims" },
    },
    serviceLines: [
      { id: "line_1", code: "ML201", modifiers: ["95"], units: 1 },
      { code: "MLPRR", units: 3 },
    ],
  },
  "correct-report-9f7a-v2",
);`;

const list = `const page = await mindbill.listBills({
  externalId: "report_9f7a",
  patientExternalId: "patient_42",
  state: "submitted",
  limit: 25,
});`;

export default function BillsPage() {
  return (
    <DocPage eyebrow="Build" title="Create and edit bills" description="A bill is the primary resource. It contains the exact CMS-1500 snapshot, references back to your data, service lines, and its payer packet."
      toc={[{ id: "snapshot", label: "Snapshot-first data" }, { id: "update", label: "Update a draft" }, { id: "query", label: "Query bills" }, { id: "modes", label: "Billing modes" }]}
      previous={{ href: "/guides/authentication", label: "Authentication" }} next={{ href: "/guides/documents", label: "Documents" }}>
      <h2 id="snapshot">Snapshot-first data</h2>
      <p>Send patient, claim, practice, clinician, location, diagnosis, and service values on the bill. Add your IDs as <code>externalId</code> when you want to find the bill from your own case or report.</p>
      <Callout title="No synchronization contract">Profiles are optional conveniences. Updating a doctor or location later never mutates a past bill; each bill remains an auditable snapshot.</Callout>
      <h2 id="update">Update a draft</h2>
      <p>Patch only the fields that changed. The same operation supports a corrected or rejected bill before resubmission.</p>
      <CodeBlock code={update} filename="server/update-bill.ts" />
      <h2 id="query">Query bills</h2>
      <p>List bills by your external references or by lifecycle state. Results are cursor-paginated.</p>
      <CodeBlock code={list} filename="server/list-bills.ts" />
      <h2 id="modes">Billing modes</h2>
      <p>Use <code>med_legal</code> for QME, AME, IME, and other evaluation work. Use <code>professional</code> for treatment billing and ordinary CMS-1500 service lines. The same bill, document, status, and lifecycle APIs apply to both.</p>
    </DocPage>
  );
}

