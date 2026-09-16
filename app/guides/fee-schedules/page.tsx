import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "California fee calculator" };

const calculator = `"use client";
import { useMemo } from "react";
import { createBillReferenceClient } from "@mindbill/browser";
import { FeeScheduleCalculator } from "@mindbill/react";
import "@mindbill/react/styles.css";

export default function CaliforniaFees() {
  const client = useMemo(() => createBillReferenceClient({
    getSession: async () => {
      // Your backend authenticates the signed-in user and creates an
      // origin-bound browser session with bills:read permission.
      const response = await fetch("/api/mindbill/session", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Could not start a billing session");
      return response.json(); // { token, expiresAt, ... }
    },
  }), []);

  return <FeeScheduleCalculator client={client} />;
}`;

const request = `const response = await fetch(
  "https://app.mindbill.org/partner/v2/fee-quotes/ca/claim",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.MINDBILL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // True only when lines include all services for this patient,
      // provider/group, and each submitted date. Derive from your records.
      completeDateOfServiceContext: true,
      lines: [{
        id: "office-visit",
        code: "99213",
        dateOfService: "2026-08-25",
        units: 1,
        chargeCents: 15000,
        modifiers: [],
        serviceZip: "90012",
        physicianContext: {
          providerKind: "physician",
          placeOfService: "11",
          standaloneService: true,
          globalPeriodApplies: false,
          hpsaBonusEligible: false,
        },
      }],
    }),
  },
);
if (!response.ok) throw new Error("Fee quote request failed");
const { data: quote } = await response.json();

// A successful HTTP request can still need coding/source review.
if (quote.status === "requires_review") {
  showReview(quote.lines, quote.claimEdits, quote.limitations);
} else {
  showEstimate(quote.totals.estimatedPayableCents);
}`;

export default function FeeSchedulesPage() {
  return <DocPage eyebrow="Treatment billing" title="California fee calculator"
    description="Calculate an encounter using its service dates, location, provider, codes, modifiers, and applicable fee rules."
    toc={[{ id: "access", label: "Access" }, { id: "component", label: "Embed the calculator" }, { id: "api", label: "Quote through the API" }, { id: "results", label: "Read the result" }, { id: "dates", label: "Dates and sources" }, { id: "submission", label: "Submit a treatment bill" }]}
    previous={{ href: "/learn/treatment-quickstart", label: "Treatment quickstart" }} next={{ href: "/api-reference/ca-claim-fee-quote", label: "Claim quote reference" }}>
    <h2 id="access">Access</h2>
    <p>The organization must have <code>treatmentBilling</code> enabled. Quote requests accept a server API key with <code>bills:read</code>, or an origin-bound browser session with <code>bills:read</code>. Credentials select the sandbox or live environment; the request body cannot override it.</p>
    <p>Use a quote before creating a bill. It does not submit anything to a payer. Follow the <Link href="/guides/authentication">authentication guide</Link> to keep your API key on your server.</p>
    <h2 id="component">Embed the calculator</h2>
    <CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/react@^0.63.0 @mindbill/browser@^0.39.0" />
    <CodeBlock language="tsx" filename="CaliforniaFees.tsx" code={calculator} />
    <p><code>FeeScheduleCalculator</code> accepts multiple service lines, units, modifiers, service dates, and location/provider information. It displays the calculation details, regulatory links, coding findings, and review reasons returned by the same claim quote API.</p>
    <p>Optional props are <code>initialLines</code> (typed as <code>CaClaimFeeQuoteInput[&quot;lines&quot;]</code>), <code>onQuote</code>, <code>appearance</code>, <code>className</code>, and <code>style</code>. The form provides professional-service and physical-therapy context fields. Supply other specialty context through <code>initialLines</code> when your workflow already collects it; the form does not provide every specialty input. Use <code>onQuote</code> to receive the complete <code>CaClaimFeeQuoteResult</code>; inspect its status before using any amount.</p>
    <h2 id="api">Quote the complete encounter</h2>
    <p><Link href="/api-reference/ca-claim-fee-quote"><code>POST /partner/v2/fee-quotes/ca/claim</code></Link> accepts up to 100 lines for one patient and one provider or group. Each line has a unique ID and its own date of service. Include all related services for the submitted dates so the engine can assess procedure-to-procedure edits, unit limits, and implemented multiple-procedure rules.</p>
    <CodeBlock filename="Server-side quote · synthetic office visit" code={request} />
    <p>The example describes one physician office visit with no related same-day services or global surgical package. Supply actual encounter facts. Multiple lines, telehealth, therapy, supplies, and drugs can require different context. Consult the <a href="https://app.mindbill.org/partner-openapi.yaml">OpenAPI input schemas</a> for those fields.</p>
    <p>The API&apos;s <code>completeDateOfServiceContext</code> describes the completeness of your data. Derive it from the encounter workflow; it does not require an extra user checkbox. Do not set clinical or coding facts to true merely to obtain a price.</p>
    <h2 id="results">Read the result before using an amount</h2>
    <div className="term-list">
      <div><b>priced</b><p>The submitted context and implemented checks produced an estimate. Use the claim-level <code>totals.estimatedPayableCents</code>, and retain its supporting line assessments and citations.</p></div>
      <div><b>requires_review</b><p>A source, rule, or encounter detail could not be resolved. The complete payable total is <code>null</code>. Show the affected line findings and claim-edit reasons. <code>pricedSubtotalCents</code> covers resolved lines only and is not the allowance for the entire claim.</p></div>
      <div><b>not_separately_payable</b><p>The result identifies an applicable rule under which the service has no separate payment. This is distinct from missing data or an unsupported calculation.</p></div>
    </div>
    <p>A line&apos;s base <code>quote.status</code> can be <code>priced</code> while its final <code>assessment</code> requires review after same-day edits. Read the final assessment and any <code>paymentAdjustment</code>. National Correct Coding Initiative (NCCI) procedure edits and Medically Unlikely Edits (MUE) operate on the encounter; adding modifier 59 or 25 does not automatically establish an exception.</p>
    <p><code>claimEdits</code> groups the screening by service date. <code>source_unavailable</code> means a required edition could not be verified. <code>not_applicable</code> means the lines are outside that implemented screening scope; it is not a statement that no coding edits apply.</p>
    <Callout title="Submitted charge and schedule maximum are different">
      <p>Quote amounts are integer cents. <code>chargeCents</code> is the submitted line charge; <code>scheduleMaximumCents</code> is the calculated schedule ceiling. A priced <code>amountCents</code> cannot exceed the submitted charge. Entering $999 does not make $999 the statutory allowance. By-report services need an actual charge and supporting review; the charge alone does not establish payment.</p>
    </Callout>
    <h2 id="dates">Effective dates and source evidence</h2>
    <p>The server selects adopted source editions using the actual service date, including effective dates within a calendar quarter. For a priced physician calculation, <code>calculation</code> can expose the relative value units, geographic factors, California conversion factor, setting, provider percentage, CMS indicators, and rounding. Other supported categories can return their own <code>feeBreakdown</code>.</p>
    <p>Display <code>provenance</code> alongside the result. Downloaded source records include their effective interval and may include a SHA-256 content hash; regulatory citations can be undated. Claim-edit provenance records the selected adoptions and source editions separately. Do not substitute today&apos;s rates for an unavailable historical edition.</p>
    <p>Source monitoring detects government changes. A detected update must pass the relevant parsing, adoption-date, and validation checks before it can price services. Newly published regulations or files do not imply immediate coverage of every rule.</p>
    <Callout title="Coverage is explicit">
      <p>Coverage varies by category, date, modifier, and clinical context. Historical and specialty coverage is not complete. Unsupported cases remain review results; do not turn them into zero-dollar lines or use the submitted charge as a fallback allowance.</p>
    </Callout>
    <h2 id="submission">Carry the context into the bill</h2>
    <p>The claim calculator estimates statutory fees and does not accept practice or payer identity overrides. For a single-line practice-aware quote, use <Link href="/api-reference/treatment-fee-quote"><code>POST /partner/v2/fee-quotes</code></Link> with authorized provider/payer IDs.</p>
    <p>When creating a professional bill, include the applicable <code>serviceLines[].feeContext</code>. The server takes code, units, modifiers, dates, charge, provider/payer identity, and service location from the bill and verifies the fee again. Unresolved verification returns <code>422 bill_fee_requires_review</code>. A calculator result is not an authorization token or a caller-controlled allowance.</p>
    <p>Explicit manual charges remain supported for some professional services without <code>feeContext</code>. Those charges are not verified statutory allowances. See the <Link href="/learn/treatment-quickstart#fields">treatment bill example</Link> for the context fields and dollar-based bill charges.</p>
  </DocPage>;
}
