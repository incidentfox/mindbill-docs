import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";
import { ApiKeyStep, QuickstartNav } from "@/components/quickstart-layout";
import { QuickstartTabs } from "@/components/quickstart-tabs";
import * as recipes from "@/lib/quickstart-api-recipes";

export const metadata: Metadata = { title: "API quickstart" };

export default function ApiQuickstartPage() {
  return <DocPage eyebrow="API quickstart" title="Create and manage bills with the API"
    description="Submit your first sandbox bill, check its status, and build your own billing workflow."
    toc={[{ id: "key", label: "1. API key" }, { id: "install", label: "2. Install SDK" }, { id: "create", label: "3. Create a bill" }, { id: "status", label: "4. Get status" }, { id: "actions", label: "5. Bill actions" }, { id: "search", label: "6. Search and filter" }, { id: "saved-data", label: "7. Saved data (optional)" }]}
    previous={{ href: "/learn/quickstart", label: "Components quickstart" }} next={{ href: "/learn/treatment-quickstart", label: "Treatment billing quickstart" }}>
    <QuickstartNav active="api" />
    <div className="quickstart-content">
      <ApiKeyStep />
      <section id="install"><h2>2. Install the SDK</h2>
        <CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/node@latest" />
        <p>Create the client on your server, with <code>MINDBILL_API_KEY</code> loaded in its environment. The examples use Node.js with TypeScript.</p>
        <CodeBlock code={recipes.apiInit} filename="mindbill.ts" />
        <details className="quickstart-details"><summary>Shared helper for direct API requests</summary>
          <p>Save this beside your client. The directory, search, and some action examples use <code>api()</code> for endpoints the SDK does not yet wrap.</p>
          <CodeBlock code={recipes.apiHelper} filename="mindbill-api.ts" />
        </details>
        <p className="quickstart-note">These examples use a key for one organization. Multi-organization partners also set the SDK’s <code>organizationId</code> and the API’s <code>x-mindbill-org-id</code> header.</p>
      </section>
      <section id="create"><h2>3. Create a bill</h2>
        <p>Download the <a href="/examples/bill.json" download="bill.json">example bill.json</a>, replace its administrator placeholders with a directory entry for your test claim, and put a synthetic PDF beside it as <code>synthetic-final-report.pdf</code>.</p>
        <details className="quickstart-details"><summary>Find a supported claims administrator</summary>
          <p>Use this when you do not already have a directory ID. Search by name, review the matching entry and its payer options, and copy its ID and name into your bill. Use <code>offset</code> to page through the results.</p>
          <CodeBlock code={recipes.apiDirectory} filename="Directory lookup · uses the helper from step 2" />
          <p>The response has a top-level <code>results</code> array and <code>total</code>. See the <Link href="/api-reference/claims-administrators">directory reference</Link> for routing fields.</p>
        </details>
        <details className="quickstart-details"><summary>See the example bill fields</summary>
          <CodeBlock language="json" filename="bill.json · synthetic data" code={recipes.exampleBill} />
        </details>
        <details className="quickstart-details"><summary>Optional: check EAMS before submitting</summary>
          <p>For a claim with an ADJ number, save a partner-linked claim first, then request an EAMS check. Run this after loading <code>billInput</code> and before submitting it; import <code>api</code> from the helper in step 2.</p>
          <CodeBlock code={recipes.apiEams} filename="Before createAndSubmitBill" />
          <p>EAMS returns candidate administrators for review, not a verified current adjuster. Sandbox returns <code>not_performed</code>. Review the candidates and update your bill’s administrator before submission.</p>
        </details>
        <CodeBlock code={recipes.apiCreate} filename="quickstart.ts · run on your server" />
        <p className="quickstart-note">This creates <strong>and submits</strong> the bill; it does not save a draft. Keep <code>bill.id</code> for the steps below. Reuse the idempotency key only when retrying this exact submission; use a new key for a new operation. Sandbox submissions never reach payers.</p>
      </section>
      <section id="status"><h2>4. Get the bill’s status</h2>
        <CodeBlock code={recipes.apiStatus} filename="Continue in quickstart.ts" />
        <p>Use status for a summary and lifecycle for the bill’s history and available actions. For automatic updates, add <Link href="/api-reference/webhook-deliveries">webhooks</Link>.</p>
      </section>
      <section id="actions"><h2>5. Perform an action</h2>
        <p>Choose an action allowed by the current lifecycle. These are separate examples for eligible bills.</p>
        <QuickstartTabs label="Bill action" tabs={[
          { label: "Resubmit", content: <><p>Correct a rejected bill by sending the complete corrected bill snapshot.</p><CodeBlock code={recipes.apiResubmit} filename="Correct and resubmit" /></> },
          { label: "Second review", content: <><p>Dispute denied or underpaid lines. Replace the line-item ID with the disputed line from this bill; MindBill resolves the payer claim control number from the bill’s evidence.</p><CodeBlock code={recipes.apiSecondReview} filename="Request second review" /></> },
          { label: "Close", content: <CodeBlock code={recipes.apiClose} filename="Close a bill" /> },
          { label: "Reopen", content: <CodeBlock code={recipes.apiReopen} filename="Reopen a bill" /> },
          { label: "Add a note", content: <CodeBlock code={recipes.apiNote} filename="Record a note" /> },
        ]} />
        <p className="quickstart-note">Direct request examples use <code>api()</code> from step 2. See <Link href="/api-reference/bill-actions">bill actions</Link> for the full action list, required evidence, and eligibility rules.</p>
      </section>
      <section id="search"><h2>6. Search and filter bills</h2>
        <p>Use the dashboard endpoint for lists, reports, and totals across matching bills.</p>
        <CodeBlock code={recipes.apiSearch} filename="Search denied and rejected bills" />
        <p>Filter by status, age, administrator, or provider; sort and paginate the results. <code>data.total</code> and <code>data.balanceTotal</code> cover all matching bills, including those beyond the current page.</p>
        <details className="quickstart-details"><summary>List bills for synchronization</summary>
          <CodeBlock code={recipes.apiList} filename="Cursor-based listing" />
          <p><code>listBills</code> also filters by state and your external bill, patient, or claim IDs. Continue until <code>nextCursor</code> is empty.</p>
        </details>
      </section>
      <details id="saved-data" className="quickstart-details"><summary>7. Save organization and provider data <small>Optional</small></summary>
        <p>Save your practice profile once, then use <code>savedProviderId</code> in later bills. The profile write requires <code>orgs:write</code>; reading it requires <code>orgs:read</code>.</p>
        <CodeBlock code={recipes.apiProfile} filename="Save and reference a billing provider" />
        <p>Updates match providers by ID or external ID and do not delete existing entries. Continue sending rendering-provider and service-location fields in each bill snapshot. See <Link href="/api-reference/organization-profile">the API reference</Link> for organization provisioning and saved profiles.</p>
      </details>
      <p className="quickstart-note">Before using a live key, complete the <Link href="/guides/sandbox#verify">sandbox checks</Link>. For treatment services, follow the <Link href="/learn/treatment-quickstart">treatment billing quickstart</Link>.</p>
    </div>
  </DocPage>;
}
