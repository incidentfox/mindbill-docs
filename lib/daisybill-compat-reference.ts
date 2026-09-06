import type { ApiField, HttpMethod } from "./api-reference";
import resourceData from "./daisybill-compat-resources.json";

export const compatBaseUrl = "https://app.mindbill.org/partner/compat/daisybill/v1";
export const compatDocsPath = "/compatibility/daisybill";

type Resource = {
  key: string;
  singular: string;
  plural: string;
  label: string;
  collectionPath: string;
  itemPath?: string;
  scopeRead: string;
  scopeWrite?: string;
  requestFields: ApiField[];
  responseFields: ApiField[];
  createExample?: Record<string, unknown>;
  patchExample?: Record<string, unknown>;
  responseExample: Record<string, unknown>;
  notes: string[];
  errors?: { status: number; description: string }[];
};

export type CompatEndpoint = {
  slug: string;
  title: string;
  summary: string;
  method: HttpMethod;
  path: string;
  resource: Resource;
  scope: string;
  list: boolean;
  pathFields: ApiField[];
  queryFields: ApiField[];
  requestFields: ApiField[];
  requestExample?: Record<string, unknown>;
  responseFields: ApiField[];
  responseExample?: Record<string, unknown>;
  responseStatus: string;
  notes: string[];
};

export const compatResources = resourceData as Resource[];
const paging: ApiField[] = [
  { name: "page", type: "integer", description: "Page number. Defaults to 1. Omit when using offset.", constraint: "1–1,000,000" },
  { name: "per_page", type: "integer", description: "Maximum records per page. Defaults to 25.", constraint: "1–100" },
  { name: "offset", type: "integer", description: "Number of records to skip instead of page-based pagination.", constraint: "0–100,000,000; cannot be combined with page" },
];
const injuryFilters: ApiField[] = [
  { name: "claim_number", type: "string", description: "Exact claim-number match.", constraint: "1–255 characters" },
  { name: "created_at", type: "string", description: "Match the UTC calendar date of compatibility creation.", constraint: "Valid YYYY-MM-DD date; not a timestamp or date range" },
  { name: "updated_at", type: "string", description: "Match the UTC calendar date of the last compatibility update.", constraint: "Valid YYYY-MM-DD date; not a timestamp or date range" },
];

function endpoint(resource: Resource, action: "list" | "get" | "create" | "update" | "delete" | "search", alternatePath?: string): CompatEndpoint {
  const method: HttpMethod = action === "create" ? "POST" : action === "update" ? "PATCH" : action === "delete" ? "DELETE" : "GET";
  const list = action === "list" || action === "search";
  const path = alternatePath ?? (list || action === "create" ? resource.collectionPath : resource.itemPath!);
  const suffix = alternatePath && action !== "search" ? "-by-billing-provider" : "";
  const actionLabel = action === "list" ? "List" : action === "get" ? "Get" : action === "create" ? resource.key === "attachment" ? "Upload" : resource.key === "bill_submission" ? "Submit" : "Create" : action === "update" ? "Update" : action === "search" ? "Search" : "Delete";
  const labels: Record<string, [string, string]> = {
    billing_provider: ["billing provider", "billing providers"],
    place_of_service: ["location", "locations"], rendering_provider: ["rendering provider", "rendering providers"],
    patient: ["patient", "patients"], injury: ["injury", "injuries"], bill: ["bill", "bills"],
    claims_administrator: ["claims administrator", "claims administrators"], attachment: ["PDF attachment", "PDF attachments"],
  };
  const title = `${actionLabel} ${resource.key === "bill_submission" ? "a bill" : list ? labels[resource.key][1] : `${resource.key === "injury" ? "an" : "a"} ${labels[resource.key][0]}`}${suffix ? " by billing provider" : ""}`;
  const envelope = resource.key !== "bill_submission";
  const requestFields = method === "POST" || method === "PATCH" ? [
    ...(envelope ? [{ name: resource.singular, type: "object", required: true, description: "Resource envelope. Unknown fields are rejected." }] : []),
    ...resource.requestFields.map(field => ({ ...field, name: envelope ? `${resource.singular}.${field.name}` : field.name, required: method === "PATCH" && !field.name.includes("[].") ? false : field.required })),
  ] : [];
  const queryFields = list ? [...paging,
    ...(resource.key === "injury" ? injuryFilters : []),
    ...(resource.key === "claims_administrator" ? [{ name: "search", type: "string", description: "Search the MindBill claims-administrator directory by name.", constraint: "Maximum 255 characters" }] : []),
    ...(action === "search" ? [
      { name: "first_name", type: "string", description: "Case-insensitive exact first-name match." },
      { name: "last_name", type: "string", description: "Case-insensitive exact last-name match." },
      { name: "ssn", type: "string", description: "Exact SSN match, ignoring dashes." },
      { name: "date_of_birth", type: "string", description: "Exact birth-date match. Use YYYY-MM-DD." },
      { name: "practice_internal_id", type: "string", description: "Exact practice identifier match. This field is not unique." },
    ].map(field => ({ ...field, constraint: "Maximum 255 characters; supplied filters combine with AND" })) : []),
  ] : [];
  const noContent = method === "DELETE" && resource.key === "bill";
  const savedExample = structuredClone(resource.responseExample);
  if (action === "update" && resource.patchExample) {
    const changes = resource.patchExample[resource.singular] as Record<string, unknown>;
    for (const [key, value] of Object.entries(changes)) {
      if (key === "address_attributes") Object.assign(savedExample.address as object, value);
      else if (key in savedExample) savedExample[key] = value;
    }
  }
  if (resource.key === "rendering_provider" && !list && action !== "create") savedExample.links = [];
  if (method === "DELETE" && ["place_of_service", "rendering_provider"].includes(resource.key)) savedExample.active = false;
  const responseExample = noContent ? undefined : list ? { [resource.plural]: [savedExample] } : savedExample;
  return {
    slug: `${action}-${resource.key.replaceAll("_", "-")}${suffix}`,
    title, summary: `${list ? "Returns a paginated collection." : method === "POST" ? "Returns the saved resource immediately." : method === "PATCH" ? "Updates supplied fields and returns the saved resource." : method === "DELETE" ? noContent ? "Deletes a mutable draft bill and returns no body." : ["place_of_service", "rendering_provider"].includes(resource.key) ? "Archives shared configuration and returns it with active: false." : "Deletes an unlinked resource and returns its previous representation." : "Returns the current resource."}`,
    method, path, resource, scope: method === "GET" ? resource.scopeRead : resource.scopeWrite!, list,
    pathFields: [...path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => ({ name, type: "integer", required: true, description: "Numeric ID returned by this compatibility API for your partner, organization, and environment. Core MindBill IDs and daisyBill IDs are not interchangeable.", constraint: "Positive int32: 1–2,147,483,647" })),
    queryFields, requestFields,
    requestExample: method === "POST" ? resource.createExample : method === "PATCH" ? resource.patchExample : undefined,
    responseFields: noContent ? [] : list ? [
      { name: resource.plural, type: "object[]", required: true, description: "Matching resources on this page. An empty result is an empty array." },
      ...resource.responseFields.map(field => ({ ...field, name: `${resource.plural}[].${field.name}` })),
    ] : resource.responseFields,
    responseExample, responseStatus: noContent ? "204 No Content" : method === "POST" ? "201 Created" : "200 OK",
    notes: [
      ...(action === "update" ? ["PATCH preserves omitted fields. Required-on-create fields cannot be cleared; only fields marked nullable accept null. Supply the resource envelope even for a partial update."] : []),
      ...(action === "search" ? ["Search filters combine with AND. No filters returns the paginated patient collection. Search is explicit; creation does not automatically deduplicate patients."] : []),
      ...resource.notes,
    ],
  };
}

export const compatEndpoints: CompatEndpoint[] = compatResources.flatMap(resource => {
  if (["attachment", "bill_submission"].includes(resource.key)) return [endpoint(resource, "create")];
  const endpoints = [endpoint(resource, "list")];
  if (resource.key === "patient") endpoints.push(endpoint(resource, "search", `${resource.collectionPath}/search`));
  if (["injury", "bill"].includes(resource.key)) endpoints.push(endpoint(resource, "list", `/billing_providers/{billing_provider_id}/${resource.plural}`));
  endpoints.push(endpoint(resource, "get"));
  if (resource.createExample) endpoints.push(endpoint(resource, "create"), endpoint(resource, "update"), endpoint(resource, "delete"));
  return endpoints;
});

export function compatEndpointBySlug(slug: string) {
  return compatEndpoints.find(endpoint => endpoint.slug === slug);
}

export function compatCurl(endpoint: CompatEndpoint) {
  const path = endpoint.path.replace(/\{[^}]+\}/g, "123");
  const query = endpoint.list ? "?page=1&per_page=25" : "";
  const lines = [
    `curl --fail-with-body -X ${endpoint.method} \\`,
    `  '${compatBaseUrl}${path}${query}' \\`,
    '  -H "Authorization: Bearer $MINDBILL_API_KEY"',
  ];
  if (endpoint.method !== "GET") lines.push('  -H "Idempotency-Key: $IDEMPOTENCY_KEY"');
  if (endpoint.requestExample) {
    lines.push("  -H 'Content-Type: application/json'");
    lines.push(`  --data-binary @- <<'JSON'\n${JSON.stringify(endpoint.requestExample, null, 2)}\nJSON`);
  }
  // The first two lines already include continuations.
  return lines.slice(0, 2).join("\n") + "\n" + lines.slice(2).join(" \\\n");
}
