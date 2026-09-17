import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Optional report autofill" };

const connected = `import { BillSubmissionForm } from "@mindbill/react";

<BillSubmissionForm
  initialBill={draft}
  getSession={getBillSession}
  reportAutofill={{ getSession: getReportSession }}
/>`;
const standalone = `import { ReportAutofill, applyReportAutofill } from "@mindbill/react";

<ReportAutofill
  getSession={getReportSession}
  onApply={(suggestions) => setDraft((current) =>
    applyReportAutofill(current, suggestions, profileOptions))}
/>`;
const browser = `import { createReportAutofillClient } from "@mindbill/browser";

const client = createReportAutofillClient({ getSession: getReportSession });
const suggestions = await client.analyze(file);
// Show fields, source excerpts, confidence, matches, and warnings for review.
// Apply only after the user confirms. Never submit a bill automatically.`;

export default function ReportAutofillPage() {
  return <DocPage eyebrow="Build" title="Optional report autofill" description="Review suggestions from a report PDF and apply them to empty bill fields."
    toc={[{ id: "access", label: "Enable access" }, { id: "component", label: "Add the component" }, { id: "review", label: "Review and preserve data" }, { id: "api", label: "Extraction API" }, { id: "verify", label: "Verify your integration" }]}
    previous={{ href: "/guides/bills", label: "Create and submit bills" }} next={{ href: "/guides/documents", label: "Documents and attachments" }}>
    <h2 id="access">Enable access for the organization</h2>
    <p>Report autofill is an optional feature available by written agreement and operator provisioning. MindBill must enable the organization&apos;s <code>reportAutofill</code> capability. The component is hidden unless your host opts in; mounting it does not enable the capability.</p>
    <p>From your authenticated server, mint a dedicated organization-wide browser session with <code>autofill:run</code>, backed by an approved operator server credential with <code>embed:write</code> and <code>autofill:write</code>. Check the current user&apos;s authorization before minting it. Keep this separate from bill-scoped sessions. Customer- and bill-scoped credentials cannot use report autofill. The developer console does not mint this permission.</p>
    <p>Follow the <Link href="/guides/authentication#session">browser-session security contract</Link>. Never put an API key in a component or browser storage.</p>
    <h2 id="component">Add the review component</h2>
    <p>React 0.67.0 adds the optional <code>reportAutofill</code> connection to <code>BillSubmissionForm</code>. Keep your existing billing session and pass a separately authorized report session.</p>
    <CodeBlock code={connected} filename="ReportBill.tsx" language="tsx" />
    <p>For a custom form, use <code>ReportAutofill</code>. It calls <code>onApply</code> only after the user reviews the result and explicitly chooses to apply it. Use <code>applyReportAutofill</code> to preserve existing values.</p>
    <CodeBlock code={standalone} filename="ReportSuggestions.tsx" language="tsx" />
    <p>A native or custom authenticated application may instead pass <code>analyzeReport(file: File): Promise&lt;ReportAutofillResult&gt;</code>. This replaces browser-session extraction; return the unwrapped result from your authorized server endpoint. The endpoint must enforce access and the organization&apos;s capability. File validation and explicit review still apply.</p>
    <h2 id="review">Review suggestions and preserve existing data</h2>
    <p>Upload one non-empty, unencrypted PDF of 1–100 pages, no larger than 25 MiB. Review each value, its source excerpt and confidence, saved-record matches, and warnings. Extraction uses <code>gpt-5.6-luna</code>; every result requires human review.</p>
    <p><strong>Apply to empty bill fields</strong> preserves populated fields and all service lines. Already selected or partially entered provider identity groups stay together. A unique saved-profile match can fill an empty group; ambiguous matches require manual selection. Dates must be valid calendar dates. Patient addresses and service-facility addresses remain separate.</p>
    <Callout title="Review clinical and billing choices">Suggestions do not create procedures, infer charges, assign diagnosis pointers, or submit a bill. Review diagnoses and their service-line assignments yourself. A claims-administrator name from a report is not a verified payer ID; select the administrator from the directory.</Callout>
    <p>Extraction does not save or attach the PDF to a bill. Add it separately through your <Link href="/guides/documents">attachment workflow</Link> when required. Hosts that store the report themselves may set <code>attachmentHelpText</code> to describe that behavior; this text does not change storage or upload behavior.</p>
    <h2 id="api">Use the extraction API directly</h2>
    <CodeBlock code={browser} filename="report-autofill.ts" language="ts" />
    <p>Browser 0.42.0 calls <code>POST /partner/v2/report-autofill</code> with multipart field <code>report</code>. Server integrations require an approved operator credential with <code>autofill:write</code> and the same organization capability. The HTTP response wraps the result in <code>data</code>; the browser client returns the unwrapped result.</p>
    <ul>
      <li><code>model</code> and <code>requiresReview: true</code> identify the extraction and required review.</li>
      <li><code>fields</code> contains <code>key</code>, <code>value</code>, <code>sourceText</code>, and <code>confidence</code> (<code>high</code> or <code>medium</code>).</li>
      <li><code>matches</code> contains patient, billing-provider, rendering-provider, and service-location matches. Each has a <code>matched</code>, <code>ambiguous</code>, or <code>none</code> status and candidate IDs/names. Only a unique match has <code>selectedId</code>.</li>
      <li><code>warnings</code> contains issues to present during review.</li>
    </ul>
    <p>See the <Link href="/api-reference/report-autofill">complete extraction endpoint reference</Link>. A <code>403</code> response can indicate missing permission or an organization capability that has not been enabled. Display the server error and correct access through the trusted server; the component does not provision access.</p>
    <h2 id="verify">Verify with a synthetic PDF</h2>
    <p>Test an empty form, a partially completed form, ambiguous profile matches, an invalid PDF, and a denied session. Confirm users can review source excerpts, populated values and service lines remain unchanged, and no extraction or apply action submits a bill. Keep report contents and extracted personal data out of logs.</p>
  </DocPage>;
}
