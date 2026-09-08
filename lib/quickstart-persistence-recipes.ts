export const saveBillHandler = `// Replace handleSubmitted in the React example above.
async function handleSubmitted({ billId }: { billId: string }) {
  setBillId(billId); // The bill is already submitted, even if saving the link fails.
  try {
    const response = await fetch(\`/api/reports/\${encodeURIComponent(report.id)}\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // TODO: Include your app's CSRF token if required.
      body: JSON.stringify({ mindbillBillId: billId }),
    });
    if (!response.ok) throw new Error("Could not save bill link");
  } catch {
    window.alert("Bill submitted, but saving its link failed. Recover it using externalId; do not submit again.");
  }
}`;

export const saveBillRoute = `// Uses YOUR auth helper and database client; adapt these imports/model names.
import { authorizeReport } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request, context: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await context.params;
    // Authenticates, checks billing access + CSRF, and loads the report.
    // Returns { id, organizationId, apiToken } from server-owned data, or null.
    const report = await authorizeReport(request, id);
    if (!report) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json().catch(() => null);
    const billId = body?.mindbillBillId;
    if (typeof billId !== "string" || !billId.trim()) {
      return Response.json({ error: "Bill ID required" }, { status: 400 });
    }
    // This token belongs to the report's organization, selected by your server.
    const response = await fetch(
      \`https://app.mindbill.org/partner/v2/bills/\${encodeURIComponent(billId)}\`,
      {
        headers: { Authorization: \`Bearer \${report.apiToken}\` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error("Could not verify bill");
    const bill = await response.json();
    if (bill.id !== billId || bill.externalId !== report.id) {
      return Response.json({ error: "Bill does not match report" }, { status: 409 });
    }

    // Prisma-style example: atomically set an empty link or accept the same ID.
    const saved = await db.report.updateMany({
      where: {
        id: report.id, organizationId: report.organizationId,
        OR: [{ mindbillBillId: null }, { mindbillBillId: billId }],
      },
      data: { mindbillBillId: billId },
    });
    if (saved.count !== 1) {
      return Response.json({ error: "Report link changed; reload it" }, { status: 409 });
    }
    return Response.json({ mindbillBillId: billId }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "Could not save bill link" }, { status: 503 });
  }
}`;
