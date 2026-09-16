export const quickstartSessionRoute = `// app/api/mindbill/session/route.ts
export async function POST(request: Request) {
  const allowedOrigin = process.env.APP_ORIGIN;
  if (!allowedOrigin || request.headers.get("origin") !== allowedOrigin) {
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  }

  try {
    const access = await authorizeBillingSession(request);
    if (!access) return Response.json({ error: "Not authorized" }, { status: 403 });
    const response = await fetch(
      "https://app.mindbill.org/partner/v2/browser-sessions",
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${access.apiKey}\`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: access.subject,
          allowedOrigin,
          permissions: access.permissions,
          ...(access.resource ? { resource: access.resource } : {}),
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
}

// YOUR host adapter, not an SDK export. Connect existing sign-in, CSRF,
// billing roles, and server-owned customer -> MindBill credential mapping.
// Use MINDBILL_API_KEY only for a single authorized organization.
// Return null for denied access. Never accept these values from browser input.
async function authorizeBillingSession(_request: Request): Promise<{
  subject: string;
  apiKey: string;
  permissions: string[];
  resource?: { billId: string };
} | null> {
  throw new Error("Connect existing authentication and customer-key mapping first");
}
`;
