import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";
import { ApiKeyStep, QuickstartNav } from "@/components/quickstart-layout";
import { QuickstartTabs } from "@/components/quickstart-tabs";

export const metadata: Metadata = { title: "Treatment billing quickstart" };

const treatmentFields = `const treatmentBill = {
  ...billInput, // Patient, claim, providers, location, and diagnoses.
  billingMode: "professional" as const,
  serviceLines: [{
    code: "99213",
    units: 1,
    charge: 150, // Total line charge, not a unit rate. Synthetic example.
    serviceDate: "2026-08-25",
    diagnosisPointers: [1],
    feeContext: {
      physicianContext: {
        providerKind: "physician" as const,
        placeOfService: "11",
        standaloneService: true,
        globalPeriodApplies: false,
        hpsaBonusEligible: false,
      },
    },
  }],
};`;

const reactSubmit = `"use client";
import { BillSubmissionForm, type BillSubmissionInput } from "@mindbill/react";

export default function TreatmentBill({ treatmentBill, treatmentBilling }: {
  treatmentBill: BillSubmissionInput;
  // Supply the organization capability from your authenticated backend.
  treatmentBilling: boolean;
}) {
  return <BillSubmissionForm
    initialBill={treatmentBill}
    treatmentBilling={treatmentBilling}
    sessionEndpoint="/api/mindbill/session"
    onSubmitted={({ billId }) => {
      window.location.href = "/billing/" + encodeURIComponent(billId);
    }}
  />;
}`;

const angularSubmit = `import { Component, Input } from "@angular/core";
import {
  MindBillBillSubmissionComponent,
  type BrowserBillCreateInput,
} from "@mindbill/angular";

@Component({
  selector: "app-treatment-bill",
  standalone: true,
  imports: [MindBillBillSubmissionComponent],
  template: \`<mindbill-bill-submission
    [initialBill]="treatmentBill"
    sessionEndpoint="/api/mindbill/session"
    (submitted)="openBill($event.bill.id)"
  />\`,
})
export class TreatmentBillComponent {
  @Input({ required: true }) treatmentBill!: BrowserBillCreateInput;
  openBill(id: string) {
    window.location.href = "/billing/" + encodeURIComponent(id);
  }
}`;

const apiSubmit = `import { readFile } from "node:fs/promises";
import { mindbill } from "./mindbill"; // Client from the API quickstart.

// Build treatmentBill using step 3, then attach your synthetic report.
const report = await readFile("./synthetic-treatment-report.pdf");
const bill = await mindbill.createAndSubmitBill({
  bill: treatmentBill,
  submission: { route: "ebill" },
  documents: [{
    filename: "synthetic-treatment-report.pdf",
    documentType: "final_report",
    contentBase64: report.toString("base64"),
  }],
}, "demo-treatment-submit-001");

console.log(bill.id);`;

const rfaDashboard = `"use client";
import { RfaDashboard } from "@mindbill/react";

export default function Authorizations() {
  return <RfaDashboard
    sessionEndpoint="/api/mindbill/rfa-session"
    permissions={["create"]}
    environment="sandbox"
  />;
}
// Authenticate the user in your backend session endpoint.
// Grant an organization-wide session with rfas:read and rfas:create,
// restricted to your exact application origin, only to authorized users.`;

const rfaForm = `"use client";
import { RfaDraftForm, type RfaDraftInput } from "@mindbill/react";

export default function NewRfa({ initialDraft, saveDraft }: {
  initialDraft: RfaDraftInput;
  saveDraft: (draft: RfaDraftInput) => Promise<void>;
}) {
  return <RfaDraftForm initialDraft={initialDraft} onSave={saveDraft} />;
}`;

const rfaInput = `const initialDraft = {
  claimId: "YOUR_SAVED_CLAIM_ID",
  patientId: "YOUR_MATCHING_PATIENT_ID",
  renderingProviderId: "YOUR_SAVED_RENDERING_PROVIDER_ID",
  employeeName: "Taylor Example",
  providerName: "Avery Example, MD",
  items: [{
    diagnosisCode: "M25.512",
    serviceDescription: "Requested treatment for the left shoulder",
  }],
};`;

export default function TreatmentQuickstartPage() {
  return <DocPage eyebrow="Treatment billing quickstart" title="Add treatment billing"
    description="Submit professional service lines and add Requests for Authorization when your workflow needs them."
    toc={[{ id: "key", label: "1. API key and access" }, { id: "setup", label: "2. Choose your setup" }, { id: "fields", label: "3. Treatment fields" }, { id: "submit", label: "4. Submit and track" }, { id: "rfa", label: "5. RFA (optional)" }]}
    previous={{ href: "/learn/api-quickstart", label: "API quickstart" }} next={{ href: "/guides/sandbox", label: "Sandbox and live access" }}>
    <QuickstartNav active="treatment" />
    <div className="quickstart-content">
      <ApiKeyStep />
      <p><strong>Treatment billing must be enabled for your organization</strong> through the <code>treatmentBilling</code> capability. Contact <a href="mailto:hello@mindbill.org">partner support</a> to enable it. An organization without access receives <code>treatment_billing_not_enabled</code>.</p>
      <section id="setup"><h2>2. Choose your setup</h2>
        <p>Use the same libraries and authentication as med-legal billing. Complete the setup once, then return here.</p>
        <QuickstartTabs label="Treatment setup" tabs={[
          { label: "React", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/react@0.73.0" /><p>Add the <Link href="/learn/quickstart#auth">backend auth route</Link> for your signed-in users.</p></> },
          { label: "Angular", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/angular@latest" /><p>Add the <Link href="/learn/quickstart#auth">backend auth route</Link> for your signed-in users.</p></> },
          { label: "API", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/node@latest" /><p>Initialize the server client from <Link href="/learn/api-quickstart#install">API quickstart step 2</Link>.</p></> },
        ]} />
      </section>
      <section id="fields"><h2>3. Add treatment service lines</h2>
        <p>Start with the patient, claim, provider, location, and diagnosis fields from the <Link href="/learn/api-quickstart#create">example bill</Link> as <code>billInput</code>. Set the billing mode and replace the med-legal lines with professional services.</p>
        <p><strong>Choose the mode explicitly:</strong> <code>med_legal</code> is the default medical-legal evaluation workflow with shared bill diagnoses. <code>professional</code> is treatment billing, where each procedure line selects its applicable diagnoses using one-based <code>diagnosisPointers</code>. Professional bills allow up to 12 diagnoses and up to four pointers per line. Review those selections instead of automatically copying every diagnosis to every procedure.</p>
        <CodeBlock code={treatmentFields} filename="Treatment bill fields" />
        <p className="quickstart-note">Every professional line needs an explicit total charge, not a unit rate. Schedule coverage depends on the service and date. The example assumes a California claim and one physician office visit with no related same-day services or global surgical package. Replace these facts with the actual encounter. Quote the complete encounter using the <Link href="/guides/fee-schedules">California fee calculator</Link> before submission. Bill charges use dollars; fee quotes use cents. The server rechecks lines with <code>feeContext</code> and rejects unresolved pricing with <code>bill_fee_requires_review</code>. An explicitly entered manual charge without fee context is not a verified statutory allowance. If a service relates to an RFA item, also include that item’s <code>rfaItemId</code> on its bill line.</p>
      </section>
      <section id="submit"><h2>4. Submit and track the bill</h2>
        <p>Pass <code>treatmentBill</code> to the entry form for review and document upload, or submit it from your server. Reuse <Link href="/guides/practice-settings">saved providers, service locations, and W-9 settings</Link>; attach optional <Link href="/guides/documents#authorization">authorization or network records</Link> when appropriate.</p>
        <QuickstartTabs label="Treatment submission" tabs={[
          { label: "React", content: <CodeBlock language="tsx" filename="TreatmentBill.tsx" code={reactSubmit} /> },
          { label: "Angular", content: <CodeBlock code={angularSubmit} filename="treatment-bill.component.ts" /> },
          { label: "API", content: <CodeBlock code={apiSubmit} filename="Server submission" /> },
        ]} />
        <p>For 97110, React 0.69.4 collects the actual therapy service facts before requesting an estimate. Preserve supplied context, include all same-day services, and keep unsupported cases in review. See <Link href="/guides/fee-schedules#therapy">therapy fields and calculation limits</Link>.</p>
        <p>Pass the authorized organization capability as <code>treatmentBilling</code>; the prop does not grant server access. React 0.69.2 collects documented personal-performance, medical-direction, and monitored-care facts for anesthesia lines. Keep anesthesia service quantity at one and supply elapsed minutes separately. See <Link href="/guides/fee-schedules#anesthesia">anesthesia fields and server review</Link>.</p>
        <p>Use the returned bill ID with the <Link href="/learn/quickstart#bill">single-bill component</Link> or <Link href="/learn/api-quickstart#status">status API</Link>. Treatment bills use the same dashboard and lifecycle actions; show the actions available for each bill.</p>
      </section>
      <details id="rfa" className="quickstart-details"><summary>5. Add a Request for Authorization <small>Optional</small></summary>
        <p>Request authorization for planned treatment separately from billing for services. React provides <code>RfaDashboard</code> for tracking, draft creation with supporting PDFs, authorized signing, packet review, explicit fax sending, and a task board for no-response follow-up and incoming utilization review responses, plus <code>RfaDraftForm</code> for a custom layout. Start with the <Link href="/guides/rfas">RFA dashboard and complete workflow guide</Link>. Angular and other interfaces can use the RFA API.</p>
        <CodeBlock language="tsx" filename="Authorizations.tsx · React 0.73.0 or later" code={rfaDashboard} />
        <p>Click “New authorization request,” search for a saved patient claim and rendering physician, then review the treatment details and save. The dashboard loads the saved choices and saves the unsigned draft; no <code>initialDraft</code> or custom save handler is required. Users can return to the patient and physician selection without losing treatment edits.</p>
        <p>The picker uses patient claims and rendering providers saved under your partner organization. To let authorized users add a patient and injury directly from this flow, enable <code>canCreateClaim</code>; the picker then offers “New patient and injury.” The default uses existing claims. Add rendering providers in <Link href="/guides/practice-settings">billing settings</Link>. This workflow needs treatment access and an organization-wide browser session with <code>rfas:read</code>, <code>rfas:create</code>, and the exact authorized origin. Match the component&apos;s <code>create</code> permission to the user&apos;s actual access.</p>
        <p>For a custom layout, <code>RfaDraftForm</code> remains available. Supply saved, authorized record IDs in <code>initialDraft</code> and implement <code>saveDraft</code> with <code>POST /partner/v2/rfas</code>, using the draft as the JSON body and a stable <code>Idempotency-Key</code>. Server requests need <code>rfas:write</code>; browser requests need <code>rfas:create</code>. Persist the returned <code>data.id</code> for subsequent updates.</p>
        <CodeBlock language="tsx" filename="Optional custom editor · NewRfa.tsx" code={rfaForm} />
        <CodeBlock code={rfaInput} filename="Custom editor starting draft · replace IDs from your organization" />
        <p><strong>Saving this form does not sign or send the RFA.</strong> Keep review, signing, and transmission as separate explicit steps. See the <a href="https://app.mindbill.org/partner-openapi.yaml">RFA API contract</a> for the full workflow.</p>
      </details>
      <p className="quickstart-note">Verify the workflow with synthetic data in sandbox before requesting <Link href="/guides/sandbox">live access</Link>.</p>
    </div>
  </DocPage>;
}
