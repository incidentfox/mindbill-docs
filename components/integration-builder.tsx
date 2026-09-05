"use client";

import { useState } from "react";
import Link from "next/link";
import { apiOnlyRecipe, backends, frontends, integrationPacket, serverRecipes, type Backend, type Frontend } from "@/lib/integration-recipes";

export function IntegrationBuilder() {
  const [frontend, setFrontend] = useState<Frontend>("React");
  const [backend, setBackend] = useState<Backend>("Next.js");
  const [status, setStatus] = useState("");
  const packet = integrationPacket(frontend, backend);
  return <section className="integration-builder" aria-label="Integration recipe builder">
    <div className="integration-controls">
      <label>Frontend<select value={frontend} onChange={(event) => { setFrontend(event.target.value as Frontend); setStatus(""); }}>{frontends.map((value) => <option key={value}>{value}</option>)}</select></label>
      {frontend !== "API only" && <label>Backend<select value={backend} onChange={(event) => { setBackend(event.target.value as Backend); setStatus(""); }}>{backends.map((value) => <option key={value}>{value}</option>)}</select></label>}
      <button type="button" className="copy-button" onClick={async () => {
        try { await navigator.clipboard.writeText(packet); setStatus("Full implementation brief copied"); } catch { setStatus("Open the full brief below and select the text to copy."); }
      }}>Copy integration brief</button>
    </div>
    <p role="status">{status}</p>
    <p>{frontend === "API only" ? "API-only integrations call bill endpoints server-to-server; no browser session or frontend package is required. Start with the directory request, then submit your reviewed bill." : "This route is intentionally fail-closed. Connect the required host authorization adapter below; copying code alone is not a completed integration."}</p>
    <pre tabIndex={0} aria-label={frontend === "API only" ? "Server API recipe" : `${backend} session recipe`}><code>{frontend === "API only" ? apiOnlyRecipe : serverRecipes[backend]}</code></pre>
    <details><summary>Full brief for Cursor, Codex, or Claude Code</summary><pre tabIndex={0} className="integration-brief"><code>{packet}</code></pre></details>
    {frontend === "Angular" && <p><Link href="/components/angular">Follow the Angular component guide →</Link></p>}
    {frontend === "API only" && <p><Link href="/api-reference/create-bill">Follow the backend-only bill API guide →</Link></p>}
  </section>;
}
