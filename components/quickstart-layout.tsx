import Link from "next/link";
import { CodeBlock } from "./code-block";
import { QuickstartTabs } from "./quickstart-tabs";
import { AuthFlowDiagram } from "./auth-flow-diagram";
import { serverRecipes, hostContract } from "@/lib/integration-recipes";

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
    <p>Create a sandbox organization in the <a href="https://platform.mindbill.org/onboarding">developer console</a>, then copy its key from <a href="https://platform.mindbill.org/settings/api-keys">API keys</a>.</p>
    <CodeBlock language="bash" filename="Server environment · .env.local" code={'MINDBILL_API_KEY=your_sandbox_key'} />
    <p className="quickstart-note">Keep the key on your server. Use invented patient data in sandbox; sandbox submissions never reach payers.</p>
  </section>;
}

export function BackendAuthStep() {
  return <section id="auth"><h2>3. Add an auth route to your backend</h2>
    <AuthFlowDiagram />
    <p>Choose your backend and copy the session route.</p>
    <div className="quickstart-auth-code"><QuickstartTabs label="Backend framework" tabs={[
      { label: "Next.js", content: <CodeBlock language="javascript" filename="app/api/mindbill/session/route.js" code={serverRecipes["Next.js"]} /> },
      { label: "Express", content: <CodeBlock language="javascript" filename="Your Express server" code={serverRecipes.Express} /> },
      { label: "FastAPI", content: <CodeBlock language="python" filename="Your FastAPI server · requires requests" code={serverRecipes.FastAPI} /> },
      { label: "HTTP", content: <CodeBlock language="http" filename="For other server frameworks" code={serverRecipes["Plain HTTP"]} /> },
    ]} /></div>
    <p className="quickstart-note"><strong>Connect your existing sign-in:</strong> replace the authorization placeholder with your user, role, and customer checks. Return the customer’s server-held API key, user ID, and allowed permissions. Set <code>APP_ORIGIN</code> to your frontend’s exact origin, such as <code>http://localhost:3000</code>. The route denies access until this is wired.</p>
    <details className="quickstart-details"><summary>Auth adapter and permissions</summary>
      <p>The session covers one customer organization. Users can access all its bills; use a bill-scoped session if a user should only access one case.</p>
      <CodeBlock language="text" filename="Required host adapter" code={hostContract} />
      <p>See the <Link href="/guides/authentication">authentication guide</Link> for customer isolation, case-scoped sessions, and separate frontend/backend origins.</p>
    </details>
  </section>;
}

export function FrontendCode({ label, react, angular }: { label: string; react: string; angular: string }) {
  return <QuickstartTabs shared label={label} tabs={[
    { label: "React", content: <CodeBlock language="tsx" filename="React" code={react} /> },
    { label: "Angular", content: <CodeBlock language="typescript" filename="Angular · standalone component" code={angular} /> },
  ]} />;
}
