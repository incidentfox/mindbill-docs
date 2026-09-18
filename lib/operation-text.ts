const catalogUrl = "https://app.mindbill.org/partner-api-docs.json";
const cacheDurationMs = 5 * 60 * 1000;

type Catalog = { version: string; baseUrl: string; operations: Map<string, string> };
let cached: { value: Catalog; expiresAt: number } | undefined;
let pending: Promise<Catalog> | undefined;

async function loadCatalog(): Promise<Catalog> {
  // This generated public artifact exceeds Next's 2 MB fetch cache limit.
  // Share one in-flight request and retain only operation text in each instance.
  const response = await fetch(catalogUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Operation catalog unavailable");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("operations" in body)
    || !Array.isArray(body.operations) || !("version" in body)
    || typeof body.version !== "string" || !("baseUrl" in body)
    || typeof body.baseUrl !== "string") {
    throw new Error("Invalid operation catalog");
  }
  const operations = new Map<string, string>();
  for (const operation of body.operations) {
    if (!operation || typeof operation.operationId !== "string"
      || typeof operation.markdown !== "string" || !operation.markdown.trim()
      || operations.has(operation.operationId)) {
      throw new Error("Invalid operation catalog entry");
    }
    operations.set(operation.operationId, operation.markdown);
  }
  if (!operations.size) throw new Error("Empty operation catalog");
  return { version: body.version, baseUrl: body.baseUrl, operations };
}

export async function operationText(operationId: string): Promise<string | null> {
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(operationId)) return null;
  if (!cached || cached.expiresAt <= Date.now()) {
    pending ??= loadCatalog().then((value) => {
      cached = { value, expiresAt: Date.now() + cacheDurationMs };
      return value;
    }).finally(() => { pending = undefined; });
    await pending;
  }
  const catalog = cached!.value;
  const markdown = catalog.operations.get(operationId);
  if (!markdown) return null;
  return `# MindBill Partner API\n\nVersion: ${catalog.version}\nBase URL: ${catalog.baseUrl}\nOpenAPI: https://docs.mindbill.org/partner-openapi.yaml\n\n${markdown}\n`;
}
