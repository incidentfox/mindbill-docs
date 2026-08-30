import type { Metadata } from "next";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Workers' compensation billing" };

export default function WorkersCompBillingPage() {
  return (
    <DocPage
      eyebrow="Learn the domain"
      title="Workers' comp billing for developers"
      description="You do not need to become a biller. You do need a mental model for the parties, claim data, documents, and responses that make workers' compensation different from ordinary medical billing."
      toc={[
        { id: "parties", label: "The five parties" },
        { id: "different", label: "Why it is different" },
        { id: "treatment-medlegal", label: "Treatment vs. medical-legal" },
        { id: "lifecycle", label: "The lifecycle" },
        { id: "terms", label: "Terms you will see" },
      ]}
      previous={{ href: "/", label: "Overview" }}
      next={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
    >
      <h2 id="parties">The five parties</h2>
      <div className="term-list">
        <div><dt>Injured worker</dt><dd>The patient. Their demographics appear on the claim.</dd></div>
        <div><dt>Employer</dt><dd>The employer at the time of injury. Workers&apos; comp eligibility and the claim are tied to employment.</dd></div>
        <div><dt>Claims administrator</dt><dd>The insurer, third-party administrator, or self-insured employer that receives and adjudicates the bill. People often say “payer.”</dd></div>
        <div><dt>Provider</dt><dd>The practice and clinician billing for treatment or a medical-legal evaluation.</dd></div>
        <div><dt>Clearinghouse or network</dt><dd>The transport layer that validates and delivers electronic bills and returns acknowledgements.</dd></div>
      </div>

      <h2 id="different">Why it is different from commercial billing</h2>
      <p>Commercial health claims usually identify a health plan and member. A workers&apos; comp bill identifies a work injury: claim number, employer, date of injury, claims administrator, and often adjudication-board or authorization data. The payer may require documents that would not travel with an ordinary office claim.</p>
      <div className="comparison-table">
        <div className="table-head"><b>Commercial health</b><b>Workers&apos; compensation</b></div>
        <div><span>Member and group identifiers</span><span>Claim number, employer, and date of injury</span></div>
        <div><span>Health plan network</span><span>Claims administrator and workers&apos; comp routing directory</span></div>
        <div><span>Clinical claim is usually sufficient</span><span>Reports, proof of service, and required forms may travel with the bill</span></div>
        <div><span>Plan-specific appeal process</span><span>Jurisdiction-specific review and dispute process</span></div>
      </div>

      <h2 id="treatment-medlegal">Treatment and medical-legal are related, but not identical</h2>
      <div className="comparison-table three">
        <div className="table-head"><b></b><b>Treatment</b><b>California medical-legal</b></div>
        <div><strong>Purpose</strong><span>Care for the work injury</span><span>An evaluation or report used to resolve a disputed medical fact</span></div>
        <div><strong>Typical services</strong><span>Visits, therapy, surgery, diagnostics, pharmacy</span><span>QME or AME evaluation, report, record review, testimony</span></div>
        <div><strong>Common packet</strong><span>Clinical records when required</span><span>Final report, proof of service, W-9, and applicable forms</span></div>
        <div><strong>Public API</strong><span>Planned</span><span>Available now</span></div>
      </div>
      <Callout title="QME is California-specific">A Qualified Medical Evaluator is part of California&apos;s medical-legal system. MindBill&apos;s resource model is intentionally broader, but the currently released API capability is California medical-legal billing.</Callout>

      <h2 id="lifecycle">The lifecycle starts after transmission</h2>
      <ol className="plain-steps">
        <li><b>Scrub.</b> Validate patient, claim, payer, provider, diagnoses, service lines, and required documents.</li>
        <li><b>Transmit.</b> Convert the bill to the destination format and send it through the selected route.</li>
        <li><b>Acknowledge.</b> A 999 validates the EDI envelope. A 277CA reports claim-level acceptance or rejection.</li>
        <li><b>Adjudicate.</b> The claims administrator processes the bill and returns an Explanation of Review (EOR).</li>
        <li><b>Resolve.</b> Record payment, correct a rejection, request Second Bill Review, pursue IBR when eligible, or close the bill.</li>
      </ol>
      <Callout tone="warning" title="Accepted does not mean paid">A successful 999 or 277CA means the transaction passed a transport or claim-acceptance stage. Payment comes later, after adjudication.</Callout>

      <h2 id="terms">Terms you will see</h2>
      <div className="term-list compact">
        <div><dt>CMS-1500</dt><dd>The human-readable professional claim form.</dd></div>
        <div><dt>837P</dt><dd>The X12 electronic professional-claim transaction that carries equivalent claim data.</dd></div>
        <div><dt>EDI</dt><dd>Electronic Data Interchange: structured machine-to-machine transactions such as 837P, 999, and 277CA.</dd></div>
        <div><dt>EOR</dt><dd>Explanation of Review: the payer&apos;s adjudication, payment, adjustments, and reasons.</dd></div>
        <div><dt>SBR</dt><dd>Second Bill Review: the first formal dispute step for an incorrect payment or denial.</dd></div>
        <div><dt>IBR</dt><dd>Independent Bill Review: an external review available after the required SBR process.</dd></div>
      </div>
      <p>For the underlying California rules, see the DWC&apos;s <a href="https://www.dir.ca.gov/dwc/EBilling/EBilling.html">electronic billing guide</a>, <a href="https://www.dir.ca.gov/dwc/IBR.htm">Independent Bill Review overview</a>, and <a href="https://www.dir.ca.gov/t8/9792_5_5.html">Second Bill Review regulation</a>.</p>
    </DocPage>
  );
}
