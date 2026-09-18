import { operationText } from "@/lib/operation-text";

export async function GET(
  _request: Request,
  context: { params: Promise<{ operationId: string }> },
) {
  const { operationId } = await context.params;
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  };
  try {
    const text = await operationText(operationId);
    if (!text) return new Response("Unknown API operation.\n", {
      status: 404,
      headers: { ...headers, "Cache-Control": "no-store" },
    });
    return new Response(text, {
      headers: { ...headers, "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch {
    return new Response("API reference temporarily unavailable. Please retry.\n", {
      status: 503,
      headers: { ...headers, "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
}
