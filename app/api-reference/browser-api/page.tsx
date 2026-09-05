import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocPage } from "@/components/doc-page";
import { apiEndpoints } from "@/lib/api-reference";
import { browserApiInventory } from "@/lib/browser-api-inventory";

export const metadata: Metadata = { title: "Component API inventory" };

const normalizePath = (path: string) => path.replace(/\{[^}]+\}/g, "{}");
const groups = [
  { id: "lookups", title: "Directories and delivery preview", match: (path: string) => /^\/(claims-administrators|diagnosis-codes|postal-codes|delivery-preview)/.test(path) },
  { id: "organization", title: "Organization settings", match: (path: string) => path.startsWith("/organization") },
  { id: "bills", title: "Bills, documents, and reports", match: (path: string) => path.startsWith("/bill") || path.startsWith("/reports") || path.startsWith("/sandbox") },
];

export default function BrowserApiPage() {
  return (
    <DocPage eyebrow="API reference" title="Component API inventory"
      description="The shared business routes called by @mindbill/browser and the connected React components, including lookups available before a bill exists."
      toc={[{ id: "authentication", label: "Authentication and scope" }, ...groups.map(({ id, title }) => ({ id, label: title }))]}
      previous={{ href: "/api-reference", label: "REST API" }} next={{ href: "/api-reference/claims-administrators", label: "Search claims administrators" }}>
      <p>Use this inventory to see which APIs power the components when building your own UI. The routes below use the base URL <code>https://app.mindbill.org</code>. SDK methods can unwrap or normalize responses; their return values are not always identical to raw HTTP JSON.</p>
      <h2 id="authentication">Authentication and scope</h2>
      <p>Your backend creates a <Link href="/api-reference/browser-sessions">browser session</Link> with the permissions required for the current user. Browser requests send <code>Authorization: Bearer &lt;session token&gt;</code> and the exact <code>Origin</code> authorized for that session. Keep the long-lived server API key on your backend.</p>
      <Callout title="One API, two credentials">Every business route below accepts either a server API key or a browser session. Both use the same URL and response contract. Browser sessions also require the exact authorized Origin and remain limited by their permissions and allowed resources. Session issuance, management sessions, events, and webhook-delivery administration require server keys.</Callout>
      <p>The components use <Link href="/api-reference/bill-dashboard">GET /partner/v2/bill-dashboard</Link> for page-based lists, filters, and totals. <Link href="/api-reference/list-bills">GET /partner/v2/bills</Link> retains its cursor-based synchronization contract. Both endpoints accept either credential.</p>
      <p>Use an organization-wide session for bill entry, bill lists, task dashboards, reports, and organization settings. For an existing-bill workflow, a bill-restricted session limits access to its allowed bill IDs. Grant only the permissions that the workflow needs; <code>organization:manage</code> allows settings writes, while the bill-entry profile read uses <code>bills:create</code>.</p>
      {groups.map((group) => (
        <section key={group.id}>
          <h2 id={group.id}>{group.title}</h2>
          <div className="api-endpoint-list">
            {browserApiInventory.filter((entry) => group.match(entry.path.replace("/partner/v2", ""))).map((entry) => {
              const suffix = entry.path.replace("/partner/v2", "");
              const reference = apiEndpoints.find((endpoint) => endpoint.method === entry.method && normalizePath(endpoint.path) === normalizePath(suffix))?.slug;
              return (
                <article className="api-endpoint-card browser-api-card" key={`${entry.method} ${entry.path}`}>
                  <div><span className={`method ${entry.method.toLowerCase()}`}>{entry.method}</span><code>{entry.path}</code></div>
                  <p>{entry.purpose}</p>
                  <p><b>Session permission:</b> <code>{entry.permission}</code></p>
                  <p><b>SDK methods:</b> <code>{entry.sdkMethod}</code></p>
                  {reference ? <Link href={`/api-reference/${reference}`}>{group.id === "lookups" ? "Endpoint contract and examples" : "Related resource contract"} →</Link> : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <Callout title="Organization updates are upserts">The settings endpoints save providers and locations by id or externalId. Omitting a saved record does not delete it. These endpoints are not a full CRUD synchronization API for patients, injuries, or claims; bill creation carries those records in the submitted snapshot.</Callout>
    </DocPage>
  );
}
