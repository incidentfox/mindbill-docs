import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";
import { ApiKeyStep, BackendAuthStep, FrontendCode, QuickstartNav } from "@/components/quickstart-layout";
import { QuickstartFramework, QuickstartTabs } from "@/components/quickstart-tabs";
import { angularDashboardLoader } from "@/lib/quickstart-api-recipes";
import * as recipes from "@/lib/quickstart-recipes";

export const metadata: Metadata = { title: "Components quickstart" };

export default function QuickstartPage() {
  return <DocPage eyebrow="Components quickstart" title="Add billing to your app"
    description="Get a key, connect your backend, and drop billing components into your frontend."
    toc={[{ id: "key", label: "1. API key" }, { id: "install", label: "2. Install" }, { id: "auth", label: "3. Backend auth" }, { id: "bill", label: "4. Single bill" }, { id: "dashboard", label: "5. Bill dashboard" }, { id: "optional", label: "6–8. Optional components" }]}
    previous={{ href: "/", label: "Overview" }} next={{ href: "/learn/api-quickstart", label: "API quickstart" }}>
    <QuickstartNav active="components" />
    <QuickstartFramework><div className="quickstart-content">
      <ApiKeyStep />
      <section id="install"><h2>2. Install the library</h2>
        <p>Choose your frontend. The examples below will follow your selection.</p>
        <QuickstartTabs shared label="Install framework" tabs={[
          { label: "React", content: <CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/react@latest" /> },
          { label: "Angular", content: <CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/angular@latest" /> },
        ]} />
      </section>
      <BackendAuthStep />
      <section id="bill"><h2>4. Add a single bill</h2>
        <p>Your app chooses what to show: no bill yet → create form; submitted bill → status, documents, payments, and actions. <code>ConnectedBillLifecycle</code> needs an existing <code>billId</code>; it does not turn a null ID into a create form.</p>
        <p>Load the saved bill ID from your backend first. Pass <code>null</code> only when the lookup succeeds and there is no bill. The submission callback returns the new ID and switches the view immediately.</p>
        <FrontendCode label="Single bill framework" react={recipes.singleBillReact} angular={recipes.singleBillAngular} />
        <p className="quickstart-note">Use your stable report or billable work-item ID as <code>externalId</code>. A case can have several bills. Supply <code>initialBill</code> using the <Link href="/guides/bills#submit">bill field structure</Link>; leave unknown form fields blank. Step 6 adds pre-filled values. Mount after loading completes, show lookup errors separately, and remount when switching work items (React: <code>key={"{workItemId}"}</code>).</p>
        <details id="save-bill-id" className="quickstart-details"><summary>Save the bill ID and recover it after a reload</summary>
          <p>Yes—save the MindBill bill ID alongside the report or work item in your existing database. MindBill stores the bill itself. The callback updates the current screen; it is not a durable delivery guarantee if the browser closes.</p>
          <p>The helper below asks your backend to find the bill using <code>externalId</code> and save the association. It never trusts a bill ID supplied by the browser. If saving fails after submission, retry saving the link, not submitting the bill.</p>
          <CodeBlock language="typescript" filename="sync-bill-link.ts · frontend" code={recipes.syncBillLink} />
          <p>Implement these three adapters using your existing login, organization mapping, and database. Install <code>@mindbill/node</code> on your backend for <code>MindBillClient</code>. Keep the API key on the server.</p>
          <CodeBlock language="typescript" filename="lib/resolve-bill-link.ts · backend" code={recipes.resolveBillLink} />
          <CodeBlock language="typescript" filename="app/api/work-items/[id]/mindbill/route.ts" code={recipes.billLinkRoute} />
          <p>On every page load, call <code>resolveBillLink(request, workItemId)</code> in your authenticated backend loader and pass its result into the component. In a client-loaded app, call the same route before mounting. This recovers a submitted bill even when the callback never ran. A failed lookup must show an error, not the create form.</p>
          <p><code>externalId</code> is a correlation field, not a uniqueness or idempotency guarantee. Do not create bills on mount or automatically resubmit after an uncertain result. If several bills match (including a replacement bill), resolve the intended bill explicitly instead of choosing the first.</p>
          <p>For synchronization even when nobody reopens the page, consume <Link href="/api-reference/events">events</Link> or <Link href="/guides/lifecycle#events">verified webhooks</Link> on your backend, process them idempotently, and update the saved association when a replacement bill is created. See <Link href="/api-reference/list-bills">bill lookup filters</Link>.</p>
        </details>
      </section>
      <section id="dashboard"><h2>5. Add a bill dashboard</h2>
        <p>Give your billing team a place to find bills and open their details.</p>
        <QuickstartTabs shared label="Dashboard framework" tabs={[
          { label: "React", content: <><CodeBlock language="tsx" filename="app/billing/page.tsx" code={recipes.dashboardReact} /><p className="quickstart-note">The workspace loads bills, filters results, and opens bill details. Point <code>/billing/new</code> to your create-bill page.</p></> },
          { label: "Angular", content: <><CodeBlock language="typescript" filename="billing.component.ts" code={recipes.dashboardAngular} /><p className="quickstart-note">Angular’s dashboard displays the <code>bills</code> you supply. Load authorized rows from your backend using the <Link href="/learn/api-quickstart#search">dashboard API</Link>, map them to <code>MindBillDashboardBill</code>, and pass them in. Its totals cover only the supplied rows; load every relevant page for a complete summary. Add your <code>/billing/:id</code> and <code>/billing/new</code> routes.</p><details className="quickstart-details"><summary>Load and map dashboard rows</summary><p>Call <code>loadDashboardBills()</code> in your host page, handle loading and errors, and pass the result as <code>bills</code>. For large datasets, build a paginated view with the API’s totals.</p><CodeBlock language="typescript" filename="load-dashboard.ts" code={angularDashboardLoader} /></details></> },
        ]} />
      </section>
      <div id="optional" className="quickstart-optionals"><h2>Add more when you need it</h2>
        <details id="prefill" className="quickstart-details"><summary>6. Pre-fill the create-bill form <small>Optional</small></summary>
          <p>Use the same create form from step 4, now with your case’s patient, claim, provider, and service fields as <code>initialBill</code>. Users can review the fields and attach PDFs before submitting. Keep step 4’s save-and-recovery flow when using the standalone examples below.</p>
          <FrontendCode label="Create bill framework" react={recipes.prefillReact} angular={recipes.prefillAngular} />
          <p>Use the <Link href="/guides/bills#submit">bill snapshot example</Link> for the field structure (the inner <code>bill</code> object). Only pre-fill facts you have; leave unknown fields for the biller. See the <Link href="/components/react#form">prefill and attachment guide</Link> for loading existing documents.</p>
        </details>
        <details id="settings" className="quickstart-details"><summary>7. Add billing settings <small>Optional</small></summary>
          <p>Let administrators save their practice, billing providers, locations, and W-9 for future bills.</p>
          <FrontendCode label="Settings framework" react={recipes.settingsReact} angular={recipes.settingsAngular} />
          <p>Implement <code>/api/mindbill/settings-session</code> using the auth route from step 3. Restrict it to your organization’s administrators and grant <code>organization:manage</code>. Keep that permission out of ordinary bill sessions.</p>
          <p>For email alerts, add the <Link href="/guides/notifications#recipients">administrator recipient list</Link>.</p>
        </details>
        <details id="rfa" className="quickstart-details"><summary>8. Add RFA components <small>Optional · treatment billing</small></summary>
          <p>For treatment workflows, add a Request for Authorization (RFA) draft form. The current draft component is available in React; Angular integrations use the RFA API.</p>
          <p>Continue with the <Link href="/learn/treatment-quickstart">treatment billing quickstart</Link> for access requirements, the draft form, and treatment submission.</p>
        </details>
      </div>
      <p className="quickstart-note">Ready for real bills? Complete the <Link href="/guides/sandbox#verify">sandbox checks</Link>. For editor setup or a full implementation brief, use the <Link href="/guides/authentication#session">integration recipes</Link>.</p>
    </div></QuickstartFramework>
  </DocPage>;
}
