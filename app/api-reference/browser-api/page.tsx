import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocPage } from "@/components/doc-page";
import { browserApiInventory } from "@/lib/browser-api-inventory";

export const metadata: Metadata = { title: "Component API inventory" };

const references: Record<string, string> = {
  "/claims-administrators": "claims-administrators",
  "/claims-administrators/{id}": "claims-administrator",
  "/diagnosis-codes": "diagnosis-codes",
  "/postal-codes": "postal-codes",
  "/delivery-preview": "delivery-preview",
  "/bills": "list-bills",
  "/bills/{billId}/actions": "bill-actions",
  "/organization": "organization-profile",
  "/organization/billing-profile": "organization-profile",
  "/organization/locations": "organization-profile",
  "/organization/w9": "organization-profile",
};
const groups = [
  { id: "lookups", title: "Directories and delivery preview", match: (path: string) => /^\/(claims-administrators|diagnosis-codes|postal-codes|delivery-preview)/.test(path) },
  { id: "organization", title: "Organization settings", match: (path: string) => path.startsWith("/organization") },
  { id: "bills", title: "Bills, documents, and reports", match: (path: string) => path.startsWith("/bill") || path.startsWith("/reports") },
];

export default function BrowserApiPage() {
  return (
    <DocPage eyebrow="API reference" title="Component API inventory"
      description={`${new Set(browserApiInventory.map((entry) => entry.path)).size} distinct browser routes called by @mindbill/browser and the connected React components, including lookups available before a bill exists.`}
      toc={[{ id: "authentication", label: "Authentication and scope" }, ...groups.map(({ id, title }) => ({ id, label: title }))]}
      previous={{ href: "/api-reference", label: "REST API" }} next={{ href: "/api-reference/claims-administrators", label: "Search claims administrators" }}>
      <p>Use this inventory to see which APIs power the components when building your own UI. The routes below use the base URL <code>https://app.mindbill.org</code>. SDK methods can unwrap or normalize responses; their return values are not always identical to raw HTTP JSON.</p>
      <h2 id="authentication">Authentication and scope</h2>
      <p>Your backend creates a <Link href="/api-reference/browser-sessions">browser session</Link> with the permissions required for the current user. Requests send <code>Authorization: Bearer &lt;session token&gt;</code> and the exact <code>Origin</code> authorized for that session. Keep the long-lived server API key on your backend.</p>
      <Callout title="Separate server and browser routes">A server route such as <code>/partner/v2/bills</code> and a browser route such as <code>/partner/v2/browser/bills</code> have different authentication. The claims-administrator directory is currently exposed on the browser surface with <code>payers:read</code>. There is no documented server-key directory route.</Callout>
      <p>Use an organization-wide session for bill entry, bill lists, task dashboards, reports, and organization settings. For an existing-bill workflow, a bill-restricted session limits access to its allowed bill IDs. Grant only the permissions that the workflow needs; <code>organization:manage</code> allows settings writes, while the bill-entry profile read uses <code>bills:create</code>.</p>
      {groups.map((group) => (
        <section key={group.id}>
          <h2 id={group.id}>{group.title}</h2>
          <div className="api-endpoint-list">
            {browserApiInventory.filter((entry) => group.match(entry.path.replace("/partner/v2/browser", ""))).map((entry) => {
              const suffix = entry.path.replace("/partner/v2/browser", "");
              const reference = entry.method === "POST" && suffix === "/bills" ? "create-bill" : references[suffix];
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
