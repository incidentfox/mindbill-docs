import type { Metadata } from "next";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Workers' compensation billing" };

export default function WorkersCompBillingPage() {
  return (
    <DocPage
      eyebrow="Learn"
      title="Workers' comp billing in five minutes"
      description="The domain model a developer needs before creating the first bill."
      toc={[
        { id: "model", label: "The 30-second model" },
        { id: "different", label: "What is different" },
        { id: "modes", label: "Two billing modes" },
        { id: "lifecycle", label: "Lifecycle" },
        { id: "terms", label: "Six terms" },
      ]}
      previous={{ href: "/", label: "Overview" }}
      next={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
    >
      <h2 id="model">The 30-second model</h2>
      <p>A workers&apos; comp bill combines professional claim data with supporting PDFs, sends both to the employer&apos;s claims administrator, and remains active until payment or a final resolution.</p>
      <p>MindBill validates CMS-1500 data, generates 837P transactions, routes through Carisk, Jopari, or Data Dimensions, falls back to fax, mail, or email when needed, and normalizes the responses behind one API.</p>

      <h2 id="different">What is different from commercial medical billing</h2>
      <div className="term-list compact">
        <div><b>Identify a claim, not a member</b><p>Use the claim number, employer, date of injury, and claims administrator—not a health-plan member ID.</p></div>
        <div><b>Routing is part of the problem</b><p>The same carrier may use different administrators or destinations. MindBill resolves the electronic payer ID or an explicit fallback destination.</p></div>
        <div><b>Accepted is not paid</b><p>A 999 or 277CA can accept the transmission. The payer later returns an EOR with payment, adjustments, or denial reasons.</p></div>
      </div>

      <h2 id="modes">Two billing modes, one resource</h2>
      <div className="comparison-table">
        <div className="table-head"><b><code>professional</code></b><b><code>med_legal</code></b></div>
        <div><span>Treatment, IME, malpractice, hourly, or activity-based services.</span><span>California QME and AME evaluations, reports, record review, and related fee-schedule services.</span></div>
      </div>
      <p>Both modes use the same bill, document, submission, status, EOR, payment, and dispute APIs. The service lines and required packet differ.</p>

      <h2 id="lifecycle">The lifecycle</h2>
      <ol className="plain-steps">
        <li><b>Draft:</b> create the bill, edit fields, and attach the payer packet.</li>
        <li><b>Submit:</b> choose the resolved e-bill, fax, mail, or email route.</li>
        <li><b>Accepted or rejected:</b> correct and resubmit transport or claim-level rejections.</li>
        <li><b>Processed:</b> read the EOR, post payment, or inspect denial and adjustment reasons.</li>
        <li><b>Resolve:</b> close the bill or pursue Second Bill Review and, when eligible, IBR.</li>
      </ol>
      <Callout tone="warning" title="Submitted bills are snapshots">Edit an incomplete or rejected bill. For a submitted bill, create a correction or review so its audit history remains intact.</Callout>

      <h2 id="terms">Six terms you will see</h2>
      <div className="term-list compact">
        <div><dt>CMS-1500</dt><dd>The human-readable professional claim form.</dd></div>
        <div><dt>837P</dt><dd>The X12 electronic transaction carrying the same professional claim data.</dd></div>
        <div><dt>999</dt><dd>An acknowledgement that the EDI envelope is syntactically valid.</dd></div>
        <div><dt>277CA</dt><dd>Claim-level acceptance or rejection from the electronic pipeline.</dd></div>
        <div><dt>EOR</dt><dd>The payer&apos;s Explanation of Review: payment, adjustments, and reasons.</dd></div>
        <div><dt>SBR / IBR</dt><dd>Second Bill Review, followed when eligible by Independent Bill Review.</dd></div>
      </div>
      <p>California details: <a href="https://www.dir.ca.gov/dwc/EBilling/EBilling.html">electronic billing</a>, <a href="https://www.dir.ca.gov/dwc/IBR.htm">IBR</a>, and <a href="https://www.dir.ca.gov/t8/9792_5_5.html">SBR timing and requirements</a>.</p>
    </DocPage>
  );
}
