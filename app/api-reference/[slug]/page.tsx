import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { EndpointMeta, MethodPath, SchemaTable } from "@/components/api-reference";
import { Callout, DocPage } from "@/components/doc-page";
import { apiEndpoints, endpointBySlug } from "@/lib/api-reference";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return apiEndpoints.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const endpoint = endpointBySlug((await params).slug);
  return { title: endpoint?.title ?? "API reference" };
}

export default async function EndpointPage({ params }: PageProps) {
  const endpoint = endpointBySlug((await params).slug);
  if (!endpoint) notFound();
  const index = apiEndpoints.findIndex(({ slug }) => slug === endpoint.slug);
  const previous = apiEndpoints[index - 1];
  const next = apiEndpoints[index + 1];
  const toc = [
    ...(endpoint.pathFields?.length ? [{ id: "path-parameters", label: "Path parameters" }] : []),
    ...(endpoint.queryFields?.length ? [{ id: "query-parameters", label: "Query parameters" }] : []),
    ...(endpoint.requestFields?.length ? [{ id: "request-body", label: "Request body" }] : []),
    { id: "examples", label: "Examples" },
    { id: "response", label: "Response" },
  ];

  return (
    <DocPage
      eyebrow={`${endpoint.group} API`}
      title={endpoint.title}
      description={endpoint.summary}
      toc={toc}
      previous={previous ? { href: `/api-reference/${previous.slug}`, label: previous.title } : { href: "/api-reference", label: "REST API" }}
      next={next ? { href: `/api-reference/${next.slug}`, label: next.title } : undefined}
    >
      <MethodPath method={endpoint.method} path={endpoint.path} />
      <p>{endpoint.useWhen}</p>
      <EndpointMeta endpoint={endpoint} />
      <p>{endpoint.authentication === "api-key-or-browser-session" ? <>Use this URL with a server API key or a <Link href="/api-reference/browser-sessions">browser session</Link> and its exact allowed Origin. Both credentials use the same request and response contract.</> : endpoint.authentication === "browser-session" ? <>Authorize this route with a <Link href="/api-reference/browser-sessions">browser session</Link>.</> : <>This endpoint requires a server API key and is unavailable to browser sessions.</>} See the <Link href="/api-reference/browser-api">component API inventory</Link> for exact paths and SDK methods.</p>
      {endpoint.notes?.map((note) => <Callout key={note.title} title={note.title}>{note.body}</Callout>)}

      {endpoint.pathFields?.length ? <><h2 id="path-parameters">Path parameters</h2><SchemaTable fields={endpoint.pathFields} /></> : null}
      {endpoint.queryFields?.length ? <><h2 id="query-parameters">Query parameters</h2><SchemaTable fields={endpoint.queryFields} /></> : null}
      {endpoint.requestFields?.length ? <><h2 id="request-body">Request body</h2><SchemaTable fields={endpoint.requestFields} /></> : null}

      <h2 id="examples">Examples</h2>
      {endpoint.examples.map((example) => <CodeBlock code={example.code} filename={example.filename} language={example.language} key={example.label} />)}

      <h2 id="response">Response</h2>
      <p><span className="api-status">{endpoint.responseStatus ?? "200 OK"}</span></p>
      <CodeBlock code={endpoint.responseExample} language={endpoint.responseLanguage ?? "json"} filename="Response" />
      {endpoint.responseFields.length ? <SchemaTable fields={endpoint.responseFields} /> : null}
    </DocPage>
  );
}
