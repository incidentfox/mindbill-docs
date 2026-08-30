import type { Metadata } from "next";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Anatomy of a bill" };

export default function AnatomyPage() {
  return (
    <DocPage
      eyebrow="Learn the data model"
      title="Anatomy of a workers' comp bill"
      description="A MindBill bill is a frozen claim snapshot plus an explicit payer packet. It contains the information needed to render a CMS-1500 and transmit its electronic equivalent."
      toc={[
        { id: "snapshot", label: "One immutable snapshot" },
        { id: "fields", label: "What goes on the bill" },
        { id: "formats", label: "CMS-1500 and 837P" },
        { id: "packet", label: "The payer packet" },
      ]}
      previous={{ href: "/learn/workers-comp-billing", label: "Workers' comp billing" }}
      next={{ href: "/learn/quickstart", label: "Quickstart" }}
    >
      <h2 id="snapshot">One immutable business snapshot</h2>
      <p>Create the bill with the values that should print on that claim: patient, injury, claims administrator, provider, location, diagnoses, and service lines. You may reference your own records with <code>externalId</code>, but you do not need to synchronize a provider or location database into MindBill.</p>
      <Callout title="Why snapshots matter">Changing a doctor&apos;s address in your product tomorrow must not rewrite a bill submitted yesterday. Each bill retains the values used for that transaction.</Callout>

      <h2 id="fields">What goes on the bill</h2>
      <div className="data-table">
        <div className="table-head"><b>Group</b><b>Examples</b><b>Why it matters</b></div>
        <div><strong>Patient</strong><span>Name, date of birth, address</span><span>Identifies the injured worker</span></div>
        <div><strong>Claim</strong><span>Claim number, employer, date of injury, claims administrator</span><span>Identifies the workers&apos; comp case and destination</span></div>
        <div><strong>Service</strong><span>Date of service, diagnoses, procedure codes, modifiers, units</span><span>Describes what is being billed</span></div>
        <div><strong>Billing provider</strong><span>Legal name, TIN, billing NPI, phone, remittance address</span><span>Identifies the payee and tax entity</span></div>
        <div><strong>Rendering provider</strong><span>Clinician, NPI, taxonomy, license, QME or AME role</span><span>Identifies who performed the service</span></div>
        <div><strong>Service location</strong><span>Facility address and place-of-service code</span><span>Identifies where the service occurred</span></div>
      </div>

      <h2 id="formats">CMS-1500 and 837P are two views of the same claim</h2>
      <p>The CMS-1500 is the familiar paper form. The 837P is the X12 electronic transaction used to send professional claims. It is a hierarchical EDI document with loops, segments, qualifiers, control numbers, and implementation-guide constraints.</p>
      <div className="format-pair">
        <div><span>Developer input</span><strong>Typed JSON</strong><code>claim.claimNumber</code><code>serviceLines[0].code</code></div>
        <i>→</i>
        <div><span>Human view</span><strong>CMS-1500</strong><code>Box 11b / 11c</code><code>Box 24D</code></div>
        <i>+</i>
        <div><span>Electronic view</span><strong>837P</strong><code>2300 / 2010BB</code><code>2400 SV1</code></div>
      </div>
      <p>MindBill performs that translation and validates the destination requirements. Your integration stays on the typed bill resource.</p>

      <h2 id="packet">The payer packet is explicit</h2>
      <p>Documents are separate resources attached to the bill. For a California medical-legal claim, a typical packet may include the final report, proof of service, W-9, letter of attestation, Form 122, or another required form.</p>
      <Callout tone="warning" title="Medical records are never silently attached">A report-service packet sent to attorneys is not the same as the payer billing packet. Attach medical records or other supporting documents only when you deliberately want the claims administrator to receive them.</Callout>
    </DocPage>
  );
}
