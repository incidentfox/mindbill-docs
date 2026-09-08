import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocPage } from "@/components/doc-page";
import { ApiKeyStep, BackendAuthStep, FrontendCode, QuickstartNav } from "@/components/quickstart-layout";
import { QuickstartFramework, QuickstartTabs } from "@/components/quickstart-tabs";
import { angularDashboardLoader } from "@/lib/quickstart-api-recipes";
import * as recipes from "@/lib/quickstart-recipes";
import { saveBillHandler, saveBillHandlerAngular, saveBillRoute } from "@/lib/quickstart-persistence-recipes";

export const metadata: Metadata = { title: "Components quickstart" };

export default function QuickstartPage() {
  return <DocPage eyebrow="Components quickstart" title="Add billing to your app"
    description="Get a key, connect your backend, and drop billing components into your frontend."
    toc={[{ id: "key", label: "1. API key" }, { id: "install", label: "2. Install" }, { id: "auth", label: "3. Session route" }, { id: "bill", label: "4. Single bill" }, { id: "dashboard", label: "5. Bill dashboard" }, { id: "optional", label: "6–8. Optional components" }]}
    previous={{ href: "/", label: "Overview" }} next={{ href: "/learn/api-quickstart", label: "API quickstart" }}>
    <QuickstartNav active="components" />
    <p>Choose React or Angular below, then connect the same authenticated session endpoint to your frontend.</p>
    <QuickstartFramework><div className="quickstart-content">
      <ApiKeyStep />
      <section id="install"><h2>2. Install the library</h2>
        <p>Choose your frontend. The examples below will follow your selection.</p>
        <QuickstartTabs shared label="Install framework" tabs={[
          { label: "React", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/react@latest" /><p>For Next.js, copy the examples into the files shown below, using <code>src/app</code> instead of <code>app</code> if that is your project&apos;s layout. Or <a href="https://github.com/incidentfox/mindbill-widgets/tree/main/examples/quickstart">run the starter app</a>.</p></> },
          { label: "Angular", content: <><CodeBlock language="bash" filename="Terminal" code="npm install @mindbill/angular@latest" /><p>Use an Angular 18–21 application. Put the component files below in <code>src/app</code>; step 5 includes the routes and router setup. Angular&apos;s development server does not implement API endpoints: run the backend from step 3 separately.</p><details className="quickstart-details"><summary>Connect the local frontend to your backend</summary><p>If Angular runs at <code>http://localhost:4200</code> and your backend at <code>http://localhost:3000</code>, use this proxy so the components&apos; <code>/api</code> requests reach your server. Adjust the target for your backend, set the backend&apos;s <code>APP_ORIGIN=http://localhost:4200</code>, and keep your API key in that backend&apos;s environment. For the Next.js handler, set <code>allowedOrigin</code> explicitly to <code>http://localhost:4200</code>; that sample does not read <code>APP_ORIGIN</code>.</p><CodeBlock language="json" filename="proxy.conf.json · project root" code={recipes.angularProxy} /><CodeBlock language="bash" filename="Terminal · restart after changing the proxy" code="ng serve --proxy-config proxy.conf.json" /><p>In production, route <code>/api</code> to the authenticated backend under your application&apos;s origin, and serve Angular&apos;s entry page for frontend route reloads. See <a href="https://angular.dev/tools/cli/serve#proxying-to-a-backend-server">Angular&apos;s proxy guide</a>.</p></details></> },
        ]} />
      </section>
      <BackendAuthStep />
      <section id="bill"><h2>4. Add a single bill</h2>
        <p>Copy this page or component, then open <code>/billing/new</code> and fill out the form. Angular also needs the router setup in step 5. After submission, the component displays the bill’s status, documents, payments, and actions.</p>
        <FrontendCode label="Single bill framework" react={recipes.singleBillReact} angular={recipes.singleBillAngular}
          reactFilename="app/billing/new/page.tsx" angularFilename="new-bill.component.ts" />
        <p className="quickstart-note">The empty fields are editable. The sample <code>report</code> represents a record already in your database: use its <code>id</code> as <code>externalId</code>, and save the returned <code>billId</code> in its <code>mindbillBillId</code> field. Use a report or billable work-item ID, since a case may have several bills; no separate ID-generation endpoint is needed.</p>
        <p className="quickstart-note">Saving that link is a good default for reopening the bill. Load the report before mounting and initialize from its saved ID; show loading errors separately. Until you connect the TODOs, the example’s selection resets on reload, but the bill remains saved in MindBill and is available from the dashboard.</p>
        <details id="persist-bill-id" className="quickstart-details"><summary>Save billId in your database <small>Optional</small></summary>
          <p>Once your app has authentication and a database, replace the TODO with a request to your own backend. The handler updates the screen immediately and reports a failed save without submitting the bill again.</p>
          <FrontendCode label="Save bill ID framework" react={saveBillHandler} angular={saveBillHandlerAngular}
            reactFilename="Inside NewBillPage · replace handleSubmitted" angularFilename="Inside NewBillComponent · replace handleSubmitted" />
          <p>The route below illustrates a Prisma-style database write. <code>authorizeReport</code> and <code>db</code> are your app’s integrations, not MindBill exports: adapt the imports and model fields to your existing code. The auth helper must validate sign-in, billing access, and CSRF, load the authorized report, and select that report organization’s server-held MindBill token. Return <code>null</code> when access is denied. Keep the token on the server.</p>
          <QuickstartTabs label="Save bill ID backend" tabs={[
            { label: "Next.js", content: <CodeBlock language="typescript" filename="app/api/reports/[id]/route.ts · adapt to your database" code={saveBillRoute} /> },
            { label: "Other backends", content: <p>Implement <code>PATCH /api/reports/:id</code> in the backend you chose in step 3. Authenticate the request, check CSRF and access to the report, verify the returned MindBill bill with that organization&apos;s server key, and require its <code>externalId</code> to match the report ID. Atomically save the ID only when the existing link is empty or already equal. Return a conflict if another bill is linked; do not overwrite it.</p> },
          ]} />
          <p>The server verifies both the organization and <code>externalId</code> before storing <code>mindbillBillId</code>. Repeating the save with the same ID is safe; a different existing link returns a conflict. For a failed save or a closed browser, recover the ID using the lookup below.</p>
        </details>
        <details id="save-bill-id" className="quickstart-details"><summary>Find the same bill after a reload</summary>
          <p>If the report has no saved <code>mindbillBillId</code>, your server can recover it using the report’s existing ID as <code>externalId</code>.</p>
          <QuickstartTabs shared label="Find bill framework" tabs={[
            { label: "React", content: <><p>This optional Next.js page opens the matching bill at <code>/billing/report</code>.</p><CodeBlock language="tsx" filename="app/billing/report/page.tsx · optional" code={recipes.findBillPage} /></> },
            { label: "Angular", content: <p>In your authorized report-loading endpoint, call <code>GET /partner/v2/bills?externalId=YOUR_REPORT_ID&amp;limit=2</code> using the organization&apos;s server-held key. Return the matched bill ID with the report, then initialize <code>NewBillComponent.billId</code> from it or navigate to <code>/billing/:id</code>. If more than one bill matches or <code>nextCursor</code> is present, require a choice rather than taking the first result.</p> },
          ]} />
          <p><code>externalId</code> does not enforce uniqueness or prevent duplicate submissions. Use a stable ID for each billable item. If multiple bills match, choose the intended one; a failed lookup must not be treated as “no bill.”</p>
          <p>This also works if you choose not to store <code>billId</code> locally. The <Link href="/api-reference/list-bills">lookup API</Link> finds the bill even if the browser closed before your submission callback ran.</p>
        </details>
      </section>
      <section id="dashboard"><h2>5. Add a bill dashboard</h2>
        <p>Copy this page and open <code>/billing</code> to find saved bills. The Add bill button opens the page from step 4.</p>
        <QuickstartTabs shared label="Dashboard framework" tabs={[
          { label: "React", content: <><CodeBlock language="tsx" filename="app/billing/page.tsx" code={recipes.dashboardReact} /><p className="quickstart-note">The workspace loads bills and opens their details for you. No database or extra API route is needed.</p></> },
          { label: "Angular", content: <><CodeBlock language="typescript" filename="billing.component.ts" code={recipes.dashboardAngular} /><p className="quickstart-note">Angular&apos;s dashboard displays the rows you supply. This page loads them on mount and shows loading, error, and retry states. Copy the loader below into the same directory. It uses the short-lived browser session from step 3 to fetch every page from the <Link href="/learn/api-quickstart#search">dashboard API</Link>; no permanent key enters Angular.</p><details className="quickstart-details"><summary>Required: dashboard loader</summary><CodeBlock language="typescript" filename="load-dashboard.ts" code={angularDashboardLoader} /><p>Totals cover the loaded rows. For large organizations, use a paginated view with server-provided totals instead of loading the complete registry.</p></details><AngularRoutingSetup /></> },
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
          <p>Add <code>POST /api/mindbill/settings-session</code> to the backend from step 3, using the same session creation code with permissions <code>{'["organization:manage"]'}</code>. Restrict it to administrators.</p>
          <QuickstartTabs shared label="Settings route framework" tabs={[
            { label: "React", content: <p>With a Next.js backend, place that handler in <code>app/api/mindbill/settings-session/route.ts</code>. The page above opens at <code>/billing/settings</code>.</p> },
            { label: "Angular", content: <p>Import <code>BillingSettingsComponent</code> into <code>app.routes.ts</code> and add <code>{'{ path: "billing/settings", component: BillingSettingsComponent }'}</code> before <code>billing/:id</code>. Open <code>/billing/settings</code> to edit saved settings.</p> },
          ]} />
          <p>For email alerts, use the <Link href="/guides/notifications#recipients">administrator recipient list</Link> in React, or build an Angular settings view over the same notification API. See <Link href="/components/angular#notifications">Angular notification settings</Link>.</p>
        </details>
        <details id="rfa" className="quickstart-details"><summary>8. Add RFA components <small>Optional · treatment billing</small></summary>
          <p>For treatment authorization and billing, continue with the <Link href="/learn/treatment-quickstart">treatment billing quickstart</Link>.</p>
        </details>
      </div>
      <p className="quickstart-note">Ready for real bills? Complete the <Link href="/guides/sandbox#verify">sandbox checks</Link>. For editor setup or a full implementation brief, use the <Link href="/guides/authentication#session">integration recipes</Link>.</p>
    </div></QuickstartFramework>
  </DocPage>;
}

function AngularRoutingSetup() {
  return <details className="quickstart-details"><summary>Required: bill routes and router setup</summary>
    <p>Add the detail component below, then merge these routes into your existing router. Keep named routes such as <code>billing/new</code> and <code>billing/settings</code> before <code>billing/:id</code>.</p>
    <CodeBlock language="typescript" filename="src/app/bill.component.ts" code={recipes.angularBillPage} />
    <CodeBlock language="typescript" filename="src/app/app.routes.ts" code={recipes.angularRoutes} />
    <p>Add <code>withComponentInputBinding()</code> to your existing <code>provideRouter</code> call so the URL&apos;s <code>id</code> reaches <code>BillComponent</code>. Preserve your other routes and application providers.</p>
    <CodeBlock language="typescript" filename="src/app/app.config.ts · merge with your existing configuration" code={recipes.angularRouterConfig} />
    <p>Your root component needs a <code>RouterOutlet</code>. If you already have an app shell, add the import and outlet to that shell.</p>
    <CodeBlock language="typescript" filename="src/app/app.component.ts · minimal app shell" code={recipes.angularRouterOutlet} />
    <p>Ensure the application bootstrap uses that configuration. Keep the change-detection and polyfill setup generated by your Angular version.</p>
    <CodeBlock language="typescript" filename="src/main.ts" code={recipes.angularBootstrap} />
    <p>See <a href="https://angular.dev/guide/routing/define-routes">Angular&apos;s routing guide</a> for integrating these routes into an existing application.</p>
  </details>;
}
