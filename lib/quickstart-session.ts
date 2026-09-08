export const quickstartSessionRoute = `// app/api/mindbill/session/route.ts
export async function POST(request: Request) {
  // TODO: Authenticate the user and check billing access.
  // TODO: Validate the request origin before production.

  const apiKey = process.env.MINDBILL_API_KEY;
  if (!apiKey) {
    console.error("MINDBILL_API_KEY is not configured");
    return Response.json(
      { error: "Billing session unavailable" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      "https://app.mindbill.org/partner/v2/browser-sessions",
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${apiKey}\`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "demo-user", // TODO: Use the authenticated user's ID.
          allowedOrigin: new URL(request.url).origin,
          // TODO: Restrict permissions to what the user needs.
          permissions: [
            "bills:create",
            "bills:read",
            "bills:act",
            "documents:read",
            "payers:read",
            "eors:read",
          ],
          expiresIn: 900,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      // Log the status only, never keys, session tokens, or response bodies.
      console.error("MindBill session creation failed", response.status);
      throw new Error("Session creation failed");
    }

    return Response.json(await response.json(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Billing session unavailable" },
      { status: 503 },
    );
  }
}`;
