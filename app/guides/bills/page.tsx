import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Create and edit bills" };

const create = `import { createBillLifecycleClient } from "@mindbill/browser";

const billing = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const { billId, data } = await billing.createBill({
  externalId: "report_9f7a",
  billingMode: "med_legal",
  patient: {
    firstName: "Alex",
    lastName: "Morgan",
    address: {
      line1: "100 Main St",
      city: "Fresno",
      state: "CA",
      postalCode: "93721",
    },
  },
  claim: {
    claimNumber: "WC-44871",
    employer: "Example Foods",
  },
  service: { date: "2026-08-26" },
  serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
});`;

const update = `const billing = createBillLifecycleClient({
  billId,
  sessionEndpoint: "/api/mindbill/session",
});

await billing.saveReview({
  ...currentReview,
  claim: {
    ...currentReview.claim,
    claimNumber: "WC-44871-A",
    employer: "Example Foods, Inc.",
  },
  serviceLines: [
    { id: "line_1", code: "ML201", modifiers: ["95"], units: 1 },
    { code: "MLPRR", modifiers: [], units: 3 },
  ],
});`;

const list = `// Optional server-side reporting or reconciliation.
const page = await mindbill.listBills({
  externalId: "report_9f7a",
  patientExternalId: "patient_42",
  state: "submitted",
  limit: 25,
});`;

export default function BillsPage() {
  return (
    <DocPage
      eyebrow="Build"
      title="Create and edit bills"
      description="A bill is the primary resource. Browser components create it directly from the exact CMS-1500 snapshot and return one stable bill ID."
      toc={[
        { id: "snapshot", label: "Snapshot-first data" },
        { id: "create", label: "Create in the browser" },
        { id: "update", label: "Edit a draft" },
        { id: "query", label: "Query from the server" },
        { id: "modes", label: "Billing modes" },
      ]}
      previous={{ href: "/guides/authentication", label: "Authentication" }}
      next={{ href: "/guides/documents", label: "Documents" }}
    >
      <h2 id="snapshot">Snapshot-first data</h2>
      <p>Send patient, claim, practice, clinician, location, diagnosis, and service values on the bill. Add your IDs as <code>externalId</code> when you want to find the bill from your own case or report.</p>
      <Callout title="No synchronization contract">Profiles are optional conveniences. Updating a doctor or location later never mutates a past bill; each bill remains an auditable snapshot.</Callout>
      <h2 id="create">Create directly from the browser</h2>
      <p>The framework-neutral browser client uses the short-lived session from your server. React and Angular call this client internally.</p>
      <CodeBlock code={create} filename="billing.ts" />
      <h2 id="update">Edit a draft</h2>
      <p>Open the stable bill ID and save only after the user reviews the prefilled values. The same editor handles rejected-bill corrections before resubmission.</p>
      <CodeBlock code={update} filename="billing.ts" />
      <h2 id="query">Query from the server when useful</h2>
      <p>Server-side bill creation is optional. Use the permanent-key client for reporting, background reconciliation, or bulk workflows that do not involve an interactive user.</p>
      <CodeBlock code={list} filename="server/reporting.ts" />
      <h2 id="modes">Billing modes</h2>
      <p>Use <code>med_legal</code> for QME, AME, IME, and other evaluation work. Use <code>professional</code> for treatment billing and ordinary CMS-1500 service lines. The same bill, document, status, and lifecycle APIs apply to both.</p>
    </DocPage>
  );
}
