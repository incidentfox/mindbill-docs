import { backends, frontends, integrationPacket, type Backend, type Frontend } from "@/lib/integration-recipes";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const frontend = params.get("frontend") ?? "React";
  const backend = params.get("backend") ?? "Next.js";
  if (!frontends.includes(frontend as Frontend) || !backends.includes(backend as Backend)
    || [...params.keys()].some(key => !["frontend", "backend"].includes(key))
    || params.getAll("frontend").length > 1 || params.getAll("backend").length > 1) {
    return new Response("Choose a supported frontend and backend.", { status: 400 });
  }
  const content = "---\ndescription: Integrate MindBill billing into the current project\n---\n\n"
    + integrationPacket(frontend as Frontend, backend as Backend);
  return new Response(content, { headers: {
    "Content-Type": "text/markdown; charset=utf-8",
    "Content-Disposition": 'inline; filename="mindbill-integration.prompt.md"',
    "X-Content-Type-Options": "nosniff",
  } });
}
