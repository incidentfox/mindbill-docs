import { type Backend, type Frontend } from "./integration-recipes";

// Only public, closed-enum setup instructions go into native application URLs.
// Never accept host URLs, repository paths, API keys or customer data here.
export function editorLinks(frontend: Frontend, backend: Backend) {
  const brief = new URL("https://docs.mindbill.org/learn/integration.prompt.md");
  brief.searchParams.set("frontend", frontend);
  brief.searchParams.set("backend", backend);
  const prompt = `Integrate MindBill into the current project (${frontend}${frontend === "API only" ? "" : ` / ${backend}`}). Read this public implementation brief first: ${brief}. Inspect existing authentication, billing integration and project instructions before editing. Preserve existing work. Keep API keys on the server; use synthetic data. Avoid database migrations unless necessary and explain them before proceeding. Verify the implementation and report any missing host authorization adapters. Do not deploy or submit live bills.`;
  return {
    brief: brief.toString(),
    cursor: `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(prompt)}`,
    vscode: `vscode:chat-prompt/install?url=${encodeURIComponent(brief.toString())}`,
    conductor: `conductor://prompt=${encodeURIComponent(prompt)}`,
  };
}
