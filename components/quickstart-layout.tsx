import Link from "next/link";
import { CodeBlock } from "./code-block";
import { QuickstartTabs } from "./quickstart-tabs";
import { AuthFlowDiagram } from "./auth-flow-diagram";
import { serverRecipes } from "@/lib/integration-recipes";
import { quickstartSessionRoute } from "@/lib/quickstart-session";

export function QuickstartNav({ active }: { active: "components" | "api" | "treatment" }) {
  return <nav className="quickstart-nav" aria-label="Quickstarts">
    {[
      { id: "components", href: "/learn/quickstart", label: "Components" },
      { id: "api", href: "/learn/api-quickstart", label: "API" },
      { id: "treatment", href: "/learn/treatment-quickstart", label: "Treatment billing" },
    ].map((item) => <Link key={item.id} href={item.href} aria-current={active === item.id ? "page" : undefined}>{item.label}</Link>)}
  </nav>;
}

export function ApiKeyStep() {
  return <section id="key"><h2>1. Get an API key</h2>
    <p>Create a sandbox organization in the <a href="https://platform.mindbill.org/onboarding" target="_blank" rel="noopener noreferrer">developer console</a>, then copy its key from <a href="https://platform.mindbill.org/settings/api-keys" target="_blank" rel="noopener noreferrer">API keys</a>.</p>
    <CodeBlock language="bash" filename="Server environment · .env.local" code="MINDBILL_API_KEY=your_sandbox_key" />
    <p>For Next.js, create <code>.env.local</code> in the project root, alongside <code>package.json</code>, even if you use <code>src/app</code>. Use the exact name <code>MINDBILL_API_KEY</code> in both your environment and server code. Restart your dev server after setting it.</p>
    <p className="quickstart-note">Keep the key on your server; do not add a <code>NEXT_PUBLIC_</code> prefix or put it in Angular <code>environment.ts</code>. Use invented patient data in sandbox; sandbox submissions never reach payers.</p>
  </section>;
}

export function BackendAuthStep() {
  return <section id="auth"><h2>3. Add a session route</h2>
    <AuthFlowDiagram />
    <p>Choose your backend below. For Next.js, copy the function into <code>app/api/mindbill/session/route.ts</code>. Express, FastAPI, and other backends expose the same <code>POST /api/mindbill/session</code> contract. Each uses the server-held <code>MINDBILL_API_KEY</code> from step 1 to create a short-lived browser session.</p>
    <div className="quickstart-auth-code"><QuickstartTabs label="Backend framework" tabs={[
      { label: "Next.js", content: <><CodeBlock language="typescript" filename="app/api/mindbill/session/route.ts" code={quickstartSessionRoute} /><p className="quickstart-note">Use a sandbox key while the TODOs are unfinished. This example assumes your frontend and backend share an origin; for separate hosts, set <code>allowedOrigin</code> to your frontend’s exact origin.</p></> },
      { label: "Express", content: <><p>Connect your existing authentication and customer-key mapping, and set <code>APP_ORIGIN</code> to your frontend’s exact origin. See the <Link href="/guides/authentication#session">auth adapter recipe</Link>.</p><CodeBlock language="javascript" filename="Your Express server" code={serverRecipes.Express} /></> },
      { label: "FastAPI", content: <><p>Connect your existing authentication and customer-key mapping, and set <code>APP_ORIGIN</code> to your frontend’s exact origin. See the <Link href="/guides/authentication#session">auth adapter recipe</Link>.</p><CodeBlock language="python" filename="Your FastAPI server · requires requests" code={serverRecipes.FastAPI} /></> },
      { label: "HTTP", content: <CodeBlock language="http" filename="For other server frameworks" code={serverRecipes["Plain HTTP"]} /> },
    ]} /></div>
    <details className="quickstart-details"><summary>Troubleshoot “Billing session unavailable”</summary>
      <p>This message means your session route could not create a MindBill session. Check the server terminal: a missing key logs <code>MINDBILL_API_KEY is not configured</code>. Confirm the name matches step 1, save <code>.env.local</code>, and restart your dev server.</p>
      <p>If MindBill returns <code>401</code>, check that you copied an active API key from the developer console. For <code>403</code>, check that the key grants the permissions requested by the route. The example logs only the upstream status; keep keys, session tokens, and upstream response bodies out of logs and browser errors.</p>
    </details>
    <p className="quickstart-note">Before going live, connect your sign-in and billing permissions. For multiple customers or access to a single bill, follow the <Link href="/guides/authentication#session">authentication guide</Link>.</p>
  </section>;
}

export function FrontendCode({ label, react, angular, reactFilename = "React", angularFilename = "Angular · standalone component" }: {
  label: string; react: string; angular: string; reactFilename?: string; angularFilename?: string;
}) {
  return <QuickstartTabs shared label={label} tabs={[
    { label: "React", content: <CodeBlock language="tsx" filename={reactFilename} code={react} /> },
    { label: "Angular", content: <CodeBlock language="typescript" filename={angularFilename} code={angular} /> },
  ]} />;
}
