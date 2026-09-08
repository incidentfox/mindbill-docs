import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";
import { ApiKeyStep, BackendAuthStep, FrontendCode, QuickstartNav } from "@/components/quickstart-layout";
import { QuickstartFramework, QuickstartTabs } from "@/components/quickstart-tabs";
import { angularDashboardLoader } from "@/lib/quickstart-api-recipes";
import * as recipes from "@/lib/quickstart-recipes";
import { saveBillHandler, saveBillRoute } from "@/lib/quickstart-persistence-recipes";

export const metadata: Metadata = { title: "Components quickstart" };

export default function QuickstartPage() {
  return <DocPage eyebrow="Components quickstart" title="Add billing to your app"
    description="Get a key, connect your backend, and drop billing components into your frontend."
    toc={[{ id: "key", label: "1. API key" }, { id: "install", label: "2. Install" }, { id: "auth", label: "3. Session route" }, { id: "bill", label: "4. Single bill" }, { id: "dashboard", label: "5. Bill dashboard" }, { id: "optional", label: "6–8. Optional components" }]}
    previous={{ href: "/", label: "Overview" }} next={{ href: "/learn/api-quickstart", label: "API quickstart" }}>
    <QuickstartNav active="components" />
    <p>Starting with Next.js? Copy the React examples into the files shown below. If your app uses <code>src/app</code>, put them there instead. Or <a href="https://github.com/incidentfox/mindbill-widgets/tree/main/examples/quickstart">run the starter app</a>.</p>
    <QuickstartFramework><div className="quickstart-content">
      <ApiKeyStep variable="MINDBILL_API_TOKEN" />
      <section id="install"><h2>2. Install the library</h2>
        <p>Choose your frontend. The examples below will follow your selection.</p>
        <QuickstartTabs shared label="Install framework" tabs={[
          { label: "React", content: <CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/react@latest" /> },
          { label: "Angular", content: <CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/angular@latest" /> },
        ]} />
      </section>
      <BackendAuthStep />
      <section id="bill"><h2>4. Add a single bill</h2>
        <p>Copy this page, open <code>/billing/new</code>, and fill out the form. After submission, it displays the bill’s status, documents, payments, and actions.</p>
        <FrontendCode label="Single bill framework" react={recipes.singleBillReact} angular={recipes.singleBillAngular}
          reactFilename="app/billing/new/page.tsx" angularFilename="new-bill.component.ts" />
        <p className="quickstart-note">The empty fields are editable. The sample <code>report</code> represents a record already in your database: use its <code>id</code> as <code>externalId</code>, and save the returned <code>billId</code> in its <code>mindbillBillId</code> field. Use a report or billable work-item ID, since a case may have several bills; no separate ID-generation endpoint is needed.</p>
        <p className="quickstart-note">Saving that link is a good default for reopening the bill. Load the report before mounting and initialize from its saved ID; show loading errors separately. Until you connect the TODOs, the example’s selection resets on reload, but the bill remains saved in MindBill and is available from the dashboard.</p>
        <details id="persist-bill-id" className="quickstart-details"><summary>Save billId in your database <small>Optional</small></summary>
          <p>Once your app has authentication and a database, replace the TODO with a request to your own backend. This React handler updates the screen immediately and reports a failed save without submitting the bill again.</p>
          <CodeBlock language="typescript" filename="Inside NewBillPage · replace handleSubmitted" code={saveBillHandler} />
          <p>The route below illustrates a Prisma-style database write. <code>authorizeReport</code> and <code>db</code> are your app’s integrations, not MindBill exports: adapt the imports and model fields to your existing code. The auth helper must validate sign-in, billing access, and CSRF, load the authorized report, and select that report organization’s server-held MindBill token. Return <code>null</code> when access is denied. Keep the token on the server.</p>
          <CodeBlock language="typescript" filename="app/api/reports/[id]/route.ts · adapt to your database" code={saveBillRoute} />
          <p>The server verifies both the organization and <code>externalId</code> before storing <code>mindbillBillId</code>. Repeating the save with the same ID is safe; a different existing link returns a conflict. For a failed save or a closed browser, recover the ID using the lookup below.</p>
        </details>
        <details id="save-bill-id" className="quickstart-details"><summary>Find the same bill after a reload</summary>
          <p>If the report has no saved <code>mindbillBillId</code>, your server can recover it using the report’s existing ID as <code>externalId</code>. This optional Next.js page opens that bill at <code>/billing/report</code>.</p>
          <CodeBlock language="tsx" filename="app/billing/report/page.tsx · optional" code={recipes.findBillPage} />
          <p><code>externalId</code> does not enforce uniqueness or prevent duplicate submissions. Use a stable ID for each billable item. If multiple bills match, choose the intended one; a failed lookup must not be treated as “no bill.”</p>
          <p>This also works if you choose not to store <code>billId</code> locally. The <Link href="/api-reference/list-bills">lookup API</Link> finds the bill even if the browser closed before your submission callback ran.</p>
        </details>
      </section>
      <section id="dashboard"><h2>5. Add a bill dashboard</h2>
        <p>Copy this page and open <code>/billing</code> to find saved bills. The Add bill button opens the page from step 4.</p>
        <QuickstartTabs shared label="Dashboard framework" tabs={[
          { label: "React", content: <><CodeBlock language="tsx" filename="app/billing/page.tsx" code={recipes.dashboardReact} /><p className="quickstart-note">The workspace loads bills and opens their details for you. No database or extra API route is needed.</p></> },
          { label: "Angular", content: <><CodeBlock language="typescript" filename="billing.component.ts" code={recipes.dashboardAngular} /><p className="quickstart-note">Angular’s dashboard displays the <code>bills</code> you supply. Load authorized rows from your backend using the <Link href="/learn/api-quickstart#search">dashboard API</Link>, map them to <code>MindBillDashboardBill</code>, and pass them in. Its totals cover only the supplied rows; load every relevant page for a complete summary. Add your <code>/billing/:id</code> and <code>/billing/new</code> routes.</p><details className="quickstart-details"><summary>Load and map dashboard rows</summary><p>Call <code>loadDashboardBills()</code> in your host page, handle loading and errors, and pass the result as <code>bills</code>. For large datasets, build a paginated view with the API’s totals.</p><CodeBlock language="typescript" filename="load-dashboard.ts" code={angularDashboardLoader} /></details></> },
        ]} />
      </section>
      <div id="optional" className="quickstart-optionals"><h2>Add more when you need it</h2>
        <details id="prefill" className="quickstart-details"><summary>6. Pre-fill the create-bill form <small>Optional</small></summary>
          <p>In step 4, replace the empty fields in <code>initialBill</code> with values you already have. For example:</p>
          <CodeBlock language="typescript" filename="initialBill · edit the object in step 4" code={recipes.prefillBill} />
          <p>For Angular, fill the matching fields in the existing <code>initialBill</code> object and keep its other required fields. Users can edit the values and attach PDFs before submitting. See the <Link href="/guides/bills#submit">field reference</Link> for more options.</p>
        </details>
        <details id="settings" className="quickstart-details"><summary>7. Add billing settings <small>Optional</small></summary>
          <p>Let administrators save their practice, billing providers, locations, and W-9 for future bills.</p>
          <FrontendCode label="Settings framework" react={recipes.settingsReact} angular={recipes.settingsAngular}
            reactFilename="app/billing/settings/page.tsx" angularFilename="billing-settings.component.ts" />
          <p>Copy the session route from step 3 to <code>app/api/mindbill/settings-session/route.ts</code> and replace its permissions array with <code>{'["organization:manage"]'}</code>. Before production, restrict that route to administrators. Then open <code>/billing/settings</code>; MindBill saves the settings.</p>
          <p>For email alerts, add the <Link href="/guides/notifications#recipients">administrator recipient list</Link>.</p>
        </details>
        <details id="rfa" className="quickstart-details"><summary>8. Add RFA components <small>Optional · treatment billing</small></summary>
          <p>For treatment authorization and billing, continue with the <Link href="/learn/treatment-quickstart">treatment billing quickstart</Link>.</p>
        </details>
      </div>
      <p className="quickstart-note">Ready for real bills? Complete the <Link href="/guides/sandbox#verify">sandbox checks</Link>. For editor setup or a full implementation brief, use the <Link href="/guides/authentication#session">integration recipes</Link>.</p>
    </div></QuickstartFramework>
  </DocPage>;
}
