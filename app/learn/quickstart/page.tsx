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
        <p>Pass a submitted bill’s ID to show its status, documents, payments, and available actions.</p>
        <FrontendCode label="Single bill framework" react={recipes.singleBillReact} angular={recipes.singleBillAngular} />
        <p className="quickstart-note">Use the ID returned when a bill is submitted. To create the first bill from your app, add the entry form in step 6, or use the <Link href="/learn/api-quickstart#create">API quickstart</Link>.</p>
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
          <p>Mount this on your new-bill page. Pass your case’s patient, claim, provider, and service fields as <code>initialBill</code>. Users can review the fields and attach PDFs before submitting.</p>
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
