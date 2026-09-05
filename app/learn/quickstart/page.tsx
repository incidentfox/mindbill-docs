import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Quickstart" };

const request = `curl --fail-with-body \\
  'https://app.mindbill.org/partner/v2/claims-administrators?limit=1' \\
  --header "Authorization: Bearer $MINDBILL_API_KEY"`;

export default function QuickstartPage() {
  return <DocPage eyebrow="Get started" title="Make your first API request"
    description="Create a sandbox key, read the claims-administrator directory, and choose how to add billing to your product."
    toc={[{ id: "key", label: "Get a sandbox key" }, { id: "request", label: "Make a request" }, { id: "next", label: "Add your billing workflow" }]}
    previous={{ href: "/", label: "Overview" }} next={{ href: "/guides/bills", label: "Submit a bill" }}>
    <h2 id="key">1. Get a sandbox key</h2>
    <p><a href="https://platform.mindbill.org/onboarding">Create a developer account</a> and a sandbox organization. Save its API key as <code>MINDBILL_API_KEY</code> in your server environment or local terminal. The key needs <code>payers:read</code>, included with new self-serve accounts.</p>
    <Callout title="Keep your API key on the server">Never put it in browser code or a public environment variable. Use invented patients and documents in sandbox; sandbox submissions never reach payers.</Callout>
    <h2 id="request">2. Read the claims-administrator directory</h2>
    <CodeBlock code={request} language="bash" filename="Terminal" />
    <p>A successful request returns <code>200 OK</code> with a top-level <code>results</code> array and <code>total</code>. Each result includes an administrator <code>id</code>, <code>name</code>, and payer choices. You have authenticated against the same directory used by our components.</p>
    <p>Use <code>q</code> to search by name and <code>offset</code> to page through results. See the <Link href="/api-reference/claims-administrators">directory reference</Link> for the response fields.</p>
    <details><summary>If the request fails</summary><p><code>400 org_required</code>: an account-scoped key needs <code>X-MindBill-Org-Id</code> set to an organization ID from your console. The default sandbox organization key does not need this header.</p><p><code>401</code>: check that the key is present and valid. <code>403</code>: check for the <code>payers:read</code> scope; an older key may need replacement in <a href="https://platform.mindbill.org/settings/api-keys">API key settings</a>. See <Link href="/guides/authentication">authentication</Link> for credential and permission details.</p></details>
    <h2 id="next">3. Add your billing workflow</h2>
    <div className="term-list compact">
      <div><b>Your own UI</b><p><Link href="/guides/bills">Submit a bill from your backend</Link>. Send the reviewed bill and PDFs together, then save the returned bill ID.</p></div>
      <div><b>React or Angular</b><p>Add <Link href="/components/react">React components</Link> or <Link href="/components/angular">Angular components</Link>. Your server issues a short-lived browser session using the <Link href="/guides/authentication#session">framework recipes</Link>.</p></div>
    </div>
    <p>Both paths use the same <Link href="/api-reference">API endpoints</Link>. Before going live, complete the <Link href="/guides/sandbox#verify">sandbox checks</Link>.</p>
  </DocPage>;
}
