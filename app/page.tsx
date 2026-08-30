import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Workers' compensation billing API" };

export default function HomePage() {
  return (
    <DocPage
      eyebrow="Workers' compensation billing infrastructure"
      title="Submit workers' comp bills through one API."
      description="Send the bill data and supporting documents you already have. MindBill validates the claim, routes it through the appropriate workers' compensation network, and gives your product one normalized lifecycle to track."
      toc={[
        { id: "what", label: "What MindBill does" },
        { id: "why", label: "Why this API exists" },
        { id: "lifecycle", label: "One bill lifecycle" },
        { id: "availability", label: "Current availability" },
      ]}
      next={{ href: "/learn/workers-comp-billing", label: "Workers' comp billing" }}
    >
      <div className="action-row">
        <Link className="button-link primary" href="/learn/quickstart">Submit a sandbox bill</Link>
        <Link className="button-link" href="/learn/workers-comp-billing">Learn the domain</Link>
      </div>

      <h2 id="what">What MindBill does</h2>
      <p>MindBill is a developer-first API for the full workers&apos; compensation billing lifecycle. You integrate once instead of building separate connections to clearinghouses, payer portals, fax vendors, and mail workflows.</p>
      <div className="concept-grid">
        <section className="concept-card"><b>Create</b><p>Represent the CMS-1500 claim as structured JSON, using stable IDs from your own system.</p></section>
        <section className="concept-card"><b>Attach</b><p>Add the report, proof of service, W-9, or other documents the payer should receive.</p></section>
        <section className="concept-card"><b>Submit</b><p>MindBill validates the bill and routes it electronically or through an approved fallback.</p></section>
        <section className="concept-card"><b>Track and act</b><p>Read acknowledgements, EORs, payments, denials, reviews, corrections, and closure through one model.</p></section>
      </div>

      <div className="flow" aria-label="Bill routing flow">
        <div className="flow-node"><small>Your product</small><strong>Bill + documents</strong></div>
        <span className="flow-arrow">→</span>
        <div className="flow-node accent"><small>MindBill</small><strong>Validate + route</strong></div>
        <span className="flow-arrow">→</span>
        <div className="flow-node"><small>Payer networks</small><strong>Carisk · Jopari · Data Dimensions</strong></div>
        <span className="flow-arrow">→</span>
        <div className="flow-node"><small>Destination</small><strong>Claims administrator</strong></div>
      </div>
      <p className="flow-return">Acknowledgements, EORs, payment data, and denial information return through the same API.</p>

      <h2 id="why">Why this API exists</h2>
      <p>Workers&apos; compensation is not ordinary commercial health insurance billing. A bill is addressed to a claims administrator, tied to an employer and work injury, and often accompanied by legal or clinical documents. The accepted electronic transaction is an X12 837P file—not the JSON your application wants to work with—and routing varies by payer.</p>
      <p>MindBill turns that network and EDI complexity into ordinary resources and actions. Your application creates a bill, stores its <code>billId</code>, and responds to lifecycle events. MindBill owns transmission, acknowledgements, remittance, denials, reviews, and resubmission.</p>

      <h2 id="lifecycle">One bill lifecycle</h2>
      <div className="lifecycle-flow">
        <span>Draft</span><i>→</i><span>Submitted</span><i>→</i><span>Accepted</span><i>→</i><span>Processed</span><i>→</i><span>Paid, denied, or disputed</span>
      </div>
      <p>The lifecycle is not always linear. A clearinghouse rejection can require a corrected replacement. An underpayment or denial can require Second Bill Review and, when eligible, Independent Bill Review. The API exposes the valid next actions without making every partner rebuild that rules engine.</p>

      <h2 id="availability">Current availability</h2>
      <Callout title="California medical-legal billing is live">
        The public API currently supports California medical-legal bills, including QME and AME workflows. Professional treatment billing is planned but is not yet available through the public API. Requests with <code>billingMode: &quot;professional&quot;</code> return a capability error rather than silently creating an unsupported bill.
      </Callout>
      <p>Start with the <Link href="/learn/quickstart">REST quickstart</Link>. React and Angular components are optional UI for reviewing and managing a bill after your server creates it.</p>
    </DocPage>
  );
}
