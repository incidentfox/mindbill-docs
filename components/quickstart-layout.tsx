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

export function ApiKeyStep({ variable = "MINDBILL_API_KEY" }: { variable?: string }) {
  return <section id="key"><h2>1. Get an API key</h2>
    <p>Create a sandbox organization in the <a href="https://platform.mindbill.org/onboarding">developer console</a>, then copy its key from <a href="https://platform.mindbill.org/settings/api-keys">API keys</a>.</p>
    <CodeBlock language="bash" filename="Server environment · .env.local" code={`${variable}=your_sandbox_key`} />
    <p className="quickstart-note">Keep the key on your server. Use invented patient data in sandbox; sandbox submissions never reach payers.</p>
  </section>;
}

export function BackendAuthStep() {
  return <section id="auth"><h2>3. Add a session route</h2>
    <AuthFlowDiagram />
    <p>Copy this function into <code>app/api/mindbill/session/route.ts</code>. It uses the <code>MINDBILL_API_TOKEN</code> from step 1 to create a short-lived browser session.</p>
    <div className="quickstart-auth-code"><QuickstartTabs label="Backend framework" tabs={[
      { label: "Next.js", content: <><CodeBlock language="typescript" filename="app/api/mindbill/session/route.ts" code={quickstartSessionRoute} /><p className="quickstart-note">Use a sandbox key while the TODOs are unfinished. This example assumes your frontend and backend share an origin; for separate hosts, set <code>allowedOrigin</code> to your frontend’s exact origin.</p></> },
      { label: "Express", content: <><p>Connect your existing authentication and customer-key mapping, and set <code>APP_ORIGIN</code> to your frontend’s exact origin. See the <Link href="/guides/authentication#session">auth adapter recipe</Link>.</p><CodeBlock language="javascript" filename="Your Express server" code={serverRecipes.Express} /></> },
      { label: "FastAPI", content: <><p>Connect your existing authentication and customer-key mapping, and set <code>APP_ORIGIN</code> to your frontend’s exact origin. See the <Link href="/guides/authentication#session">auth adapter recipe</Link>.</p><CodeBlock language="python" filename="Your FastAPI server · requires requests" code={serverRecipes.FastAPI} /></> },
      { label: "HTTP", content: <CodeBlock language="http" filename="For other server frameworks" code={serverRecipes["Plain HTTP"]} /> },
    ]} /></div>
    <p className="quickstart-note">Before going live, connect your sign-in and billing permissions. For multiple customers or access to a single bill, follow the <Link href="/guides/authentication#session">authentication guide</Link>.</p>
  </section>;
}

export function FrontendCode({ label, react, angular }: { label: string; react: string; angular: string }) {
  return <QuickstartTabs shared label={label} tabs={[
    { label: "React", content: <CodeBlock language="tsx" filename="React" code={react} /> },
    { label: "Angular", content: <CodeBlock language="typescript" filename="Angular · standalone component" code={angular} /> },
  ]} />;
}
