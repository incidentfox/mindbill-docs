import type { Metadata } from "next";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Routing and EDI" };

export default function RoutingPage() {
  return (
    <DocPage
      eyebrow="Under the hood"
      title="Routing and EDI"
      description="MindBill converts one bill resource into the format and route its claims administrator accepts, then normalizes the responses back into a lifecycle your application can use."
      toc={[
        { id: "resolve", label: "Resolve the destination" },
        { id: "networks", label: "Connected networks" },
        { id: "edi", label: "837P and acknowledgements" },
        { id: "fallbacks", label: "Fallback routes" },
      ]}
      previous={{ href: "/learn/quickstart", label: "Quickstart" }}
      next={{ href: "/guides/bills", label: "The bill resource" }}
    >
      <h2 id="resolve">Resolve the claims administrator</h2>
      <p>Workers&apos; comp routing starts with the claims administrator, not a patient&apos;s health plan. MindBill uses payer-directory records, claim-number patterns, and the name supplied by your application to suggest a destination. A user can review or override the match before submission.</p>
      <Callout title="The payer choice is part of the bill">A carrier name in a report may not identify the third-party administrator actually handling the claim. Keep the selected claims administrator on the bill snapshot.</Callout>

      <h2 id="networks">Connected networks</h2>
      <p>MindBill maintains routing integrations with the major workers&apos; compensation networks used by its payer directory. Your product does not need to implement each network&apos;s enrollment, transport, acknowledgement, or destination logic.</p>
      <div className="data-table networks">
        <div className="table-head"><b>Network</b><b>MindBill abstracts</b></div>
        <div><strong>Carisk</strong><span>Electronic payer destinations and transaction delivery</span></div>
        <div><strong>Jopari</strong><span>Workers&apos; comp e-billing routes and acknowledgements</span></div>
        <div><strong>Data Dimensions</strong><span>Electronic bill routing and payer-specific destinations</span></div>
      </div>
      <p>Coverage depends on the specific claims administrator and route available at submission time. The API returns resolved delivery choices rather than promising that every payer supports every route.</p>

      <h2 id="edi">From JSON to 837P—and back</h2>
      <p>For an electronic professional bill, MindBill emits the X12 837P transaction using the 005010X222A1 implementation. The network responses arrive in stages:</p>
      <div className="lifecycle-flow">
        <span>837P sent</span><i>→</i><span>999 syntax acknowledgement</span><i>→</i><span>277CA claim acknowledgement</span><i>→</i><span>EOR / payment</span>
      </div>
      <div className="term-list compact">
        <div><dt>999 accepted</dt><dd>The EDI interchange and transaction structure passed syntax checks.</dd></div>
        <div><dt>277CA accepted</dt><dd>The claim passed the receiver&apos;s claim-level intake checks.</dd></div>
        <div><dt>EOR</dt><dd>The claims administrator adjudicated the bill and reported payment, adjustments, or denial reasons.</dd></div>
      </div>
      <Callout tone="warning" title="Transport success is not adjudication">A bill can be accepted electronically and later denied or underpaid. Build your UI around the normalized bill state, not a single “sent” boolean.</Callout>

      <h2 id="fallbacks">Fallback routes</h2>
      <p>When an electronic destination is unavailable or a workflow requires an override, MindBill can represent fax, physical mail, or email delivery. The review UI shows the actual destination before the user submits. The selected route is recorded with the bill history.</p>
    </DocPage>
  );
}
