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
    charge: 150, // Synthetic example; use your practice's fee schedule.
    serviceDate: "2026-08-25",
    diagnosisPointers: [1],
  }],
};`;

const reactSubmit = `"use client";
import { BillSubmissionForm, type BillSubmissionInput } from "@mindbill/react";
import "@mindbill/react/styles.css";

export default function TreatmentBill({ treatmentBill }: {
  treatmentBill: BillSubmissionInput;
}) {
  return <BillSubmissionForm
    initialBill={treatmentBill}
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

const rfaForm = `"use client";
import { RfaDraftForm, type RfaDraftInput } from "@mindbill/react";
import "@mindbill/react/styles.css";

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
      <p><strong>Treatment billing must be enabled for your organization.</strong> Contact <a href="mailto:hello@mindbill.org">partner support</a> to enable it. An organization without access receives <code>treatment_billing_not_enabled</code>.</p>
      <section id="setup"><h2>2. Choose your setup</h2>
        <p>Use the same libraries and authentication as med-legal billing. Complete the setup once, then return here.</p>
        <QuickstartTabs label="Treatment setup" tabs={[
          { label: "React", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/react@latest" /><p>Add the <Link href="/learn/quickstart#auth">backend auth route</Link> for your signed-in users.</p></> },
          { label: "Angular", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/angular@latest" /><p>Add the <Link href="/learn/quickstart#auth">backend auth route</Link> for your signed-in users.</p></> },
          { label: "API", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/node@latest" /><p>Initialize the server client from <Link href="/learn/api-quickstart#install">API quickstart step 2</Link>.</p></> },
        ]} />
      </section>
      <section id="fields"><h2>3. Add treatment service lines</h2>
        <p>Start with the patient, claim, provider, location, and diagnosis fields from the <Link href="/learn/api-quickstart#create">example bill</Link> as <code>billInput</code>. Set the billing mode and replace the med-legal lines with professional services.</p>
        <CodeBlock code={treatmentFields} filename="Treatment bill fields" />
        <p className="quickstart-note">Every professional line needs an explicit charge from your practice’s fee schedule. The values above are synthetic examples. If a service relates to an RFA item, also include that item’s <code>rfaItemId</code> on its bill line.</p>
      </section>
      <section id="submit"><h2>4. Submit and track the bill</h2>
        <p>Pass <code>treatmentBill</code> to the entry form for review and document upload, or submit it from your server.</p>
        <QuickstartTabs label="Treatment submission" tabs={[
          { label: "React", content: <CodeBlock language="tsx" filename="TreatmentBill.tsx" code={reactSubmit} /> },
          { label: "Angular", content: <CodeBlock code={angularSubmit} filename="treatment-bill.component.ts" /> },
          { label: "API", content: <CodeBlock code={apiSubmit} filename="Server submission" /> },
        ]} />
        <p>Use the returned bill ID with the <Link href="/learn/quickstart#bill">single-bill component</Link> or <Link href="/learn/api-quickstart#status">status API</Link>. Treatment bills use the same dashboard and lifecycle actions; show the actions available for each bill.</p>
      </section>
      <details id="rfa" className="quickstart-details"><summary>5. Add a Request for Authorization <small>Optional</small></summary>
        <p>Request authorization for planned treatment separately from billing for services. React provides a draft form; Angular and other interfaces can use the RFA API.</p>
        <CodeBlock language="tsx" filename="NewRfa.tsx · React" code={rfaForm} />
        <CodeBlock code={rfaInput} filename="Starting draft · replace IDs from your organization" />
        <p>The claim and its matching patient must already be saved under your partner organization, along with the rendering provider. Implement <code>saveDraft</code> in your host application: authorize the current user and create an unsigned draft with <code>POST /partner/v2/rfas</code>, the draft as the JSON body, and a stable <code>Idempotency-Key</code>.</p>
        <p>Server requests require <code>rfas:write</code>. A browser integration needs an organization session with <code>rfas:create</code>, the authorized origin, and treatment access. The response returns the new RFA in <code>data</code>. Persist its ID so later edits update that draft rather than create duplicates.</p>
        <p><strong>Saving this form does not sign or send the RFA.</strong> Keep review, signing, and transmission as separate explicit steps. See the <a href="https://app.mindbill.org/partner-openapi.yaml">RFA API contract</a> for the full workflow.</p>
      </details>
      <p className="quickstart-note">Verify the workflow with synthetic data in sandbox before requesting <Link href="/guides/sandbox">live access</Link>.</p>
    </div>
  </DocPage>;
}
