"use client";

import { useState } from "react";
import Link from "next/link";
import { editorLinks } from "@/lib/editor-launch";
import { apiOnlyRecipe, backends, frontends, integrationPacket, serverRecipes, type Backend, type Frontend } from "@/lib/integration-recipes";

export function IntegrationBuilder() {
  const [frontend, setFrontend] = useState<Frontend>("React");
  const [backend, setBackend] = useState<Backend>("Next.js");
  const [status, setStatus] = useState("");
  const packet = integrationPacket(frontend, backend);
  const links = editorLinks(frontend, backend);
  return <section className="integration-builder" aria-label="Integration recipe builder">
    <div className="integration-controls">
      <label>Frontend<select value={frontend} onChange={(event) => { setFrontend(event.target.value as Frontend); setStatus(""); }}>{frontends.map((value) => <option key={value}>{value}</option>)}</select></label>
      {frontend !== "API only" && <label>Backend<select value={backend} onChange={(event) => { setBackend(event.target.value as Backend); setStatus(""); }}>{backends.map((value) => <option key={value}>{value}</option>)}</select></label>}
      <button type="button" className="copy-button" onClick={async () => {
        try { await navigator.clipboard.writeText(packet); setStatus("Full implementation brief copied"); } catch { setStatus("Open the full brief below and select the text to copy."); }
      }}>Copy integration brief</button>
      <button type="button" className="copy-button" onClick={() => {
        const url = URL.createObjectURL(new Blob([packet], { type: "text/markdown;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "mindbill-implementation-brief.md";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus("Implementation brief downloaded");
      }}>Download brief (.md)</button>
    </div>
    <div className="editor-launch">
      <strong>Continue in your coding editor</strong>
      <p>Uses the stack selected above. Open your project first; review the instructions before running your agent.</p>
      <div className="editor-launch-actions">
        <a href={links.cursor} onClick={() => setStatus("Cursor launch requested. If nothing opens, copy or download the brief.")}>Open in Cursor ↗</a>
        <a href={links.vscode} onClick={() => setStatus("VS Code import requested. Choose a destination, review the prompt file, then run it in Chat.")}>Add prompt to VS Code ↗</a>
        <a href={links.conductor} onClick={() => setStatus("Conductor launch requested. Check its selected repository before starting; copy the brief if nothing opens.")}>Create Conductor workspace ↗</a>
      </div>
      <p className="editor-launch-note">Conductor creates a workspace in its first available repository. VS Code asks where to save a reusable prompt. These links require the desktop app; on mobile, copy or download the brief for later.</p>
      <details><summary>Codex, Flowcode, Claude Code, or another editor</summary><p>Use <b>Copy integration brief</b> or <b>Download brief</b> above, open your project in your editor, and paste the brief into its coding agent. Use this portable option when a supported direct launcher is not available.</p><p>Supported launch formats: <a href="https://cursor.com/docs/reference/deeplinks">Cursor</a>, <a href="https://code.visualstudio.com/updates/v1_102#_import-modes-prompts-and-instructions-via-a-vscode-link">VS Code</a>, <a href="https://www.conductor.build/docs/reference/deep-links">Conductor</a>. Links contain only public setup instructions—never keys, patient information, or your repository path.</p></details>
    </div>
    <p role="status">{status}</p>
    <p>{frontend === "API only" ? "API-only integrations call bill endpoints server-to-server; no browser session or frontend package is required. Start with the directory request, then submit your reviewed bill." : "This route is intentionally fail-closed. Connect the required host authorization adapter below; copying code alone is not a completed integration."}</p>
    <pre tabIndex={0} aria-label={frontend === "API only" ? "Server API recipe" : `${backend} session recipe`}><code>{frontend === "API only" ? apiOnlyRecipe : serverRecipes[backend]}</code></pre>
    <details><summary>Full brief for Cursor, Codex, or Claude Code</summary><pre tabIndex={0} className="integration-brief"><code>{packet}</code></pre></details>
    {frontend === "Angular" && <p><Link href="/components/angular">Follow the Angular component guide →</Link></p>}
    {frontend === "API only" && <p><Link href="/api-reference/create-bill">Follow the backend-only bill API guide →</Link></p>}
  </section>;
}
