import Link from "next/link";
import type { ApiEndpoint, ApiField } from "@/lib/api-reference";

export function MethodPath({ method, path }: Pick<ApiEndpoint, "method" | "path">) {
  return (
    <div className="api-method-path" aria-label={`${method} ${path}`}>
      <span className={`method ${method.toLowerCase()}`}>{method}</span>
      <code>https://app.mindbill.org/partner/v2{path}</code>
    </div>
  );
}

export function EndpointList({ endpoints }: { endpoints: ApiEndpoint[] }) {
  return (
    <div className="api-endpoint-list">
      {endpoints.map((endpoint) => (
        <Link className="api-endpoint-card" href={`/api-reference/${endpoint.slug}`} key={endpoint.slug}>
          <div>
            <span className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
            <code>{endpoint.path}</code>
          </div>
          <strong>{endpoint.title}</strong>
          <p>{endpoint.summary}</p>
        </Link>
      ))}
    </div>
  );
}

export function SchemaTable({ fields }: { fields: ApiField[] }) {
  return (
    <div className="api-schema">
      <div className="api-schema-head">
        <span>Field</span><span>Type</span><span>Description</span>
      </div>
      {fields.map((field) => (
        <div className="api-schema-row" key={field.name}>
          <div>
            <code>{field.name}</code>
            {field.required ? <span className="api-required">Required</span> : null}
          </div>
          <code>{field.type}</code>
          <div>
            <p>{field.description}</p>
            {field.constraint ? <small>{field.constraint}</small> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EndpointMeta({ endpoint }: { endpoint: ApiEndpoint }) {
  const supportsBrowserSession = endpoint.permissions?.some((permission) => permission.startsWith("Browser:"));

  return (
    <div className="api-meta-grid">
      <div><small>Authentication</small><strong>{supportsBrowserSession ? "Bearer API key or browser session" : "Bearer API key"}</strong></div>
      <div><small>Authorization</small><strong>{endpoint.permissions?.join(" · ") ?? "Server API key"}</strong></div>
      <div><small>Idempotency</small><strong>{endpoint.idempotent ? "Required for safe retries" : "Not required"}</strong></div>
    </div>
  );
}
