import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function DocPage({
  eyebrow,
  title,
  description,
  children,
  toc = [],
  previous,
  next,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  toc?: Array<{ id: string; label: string }>;
  previous?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <div className="doc-grid">
      <article className="doc-article">
        <header className="doc-header">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="doc-content">{children}</div>
        <nav className="page-pagination" aria-label="Pagination">
          {previous ? <Link href={previous.href}><ChevronLeft size={17} /><span><small>Previous</small>{previous.label}</span></Link> : <span />}
          {next ? <Link href={next.href}><span><small>Next</small>{next.label}</span><ChevronRight size={17} /></Link> : null}
        </nav>
      </article>
      {toc.length ? (
        <aside className="page-toc"><p>On this page</p>{toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</aside>
      ) : null}
    </div>
  );
}

export function Callout({ children, tone = "note", title }: { children: React.ReactNode; tone?: "note" | "warning" | "success"; title?: string }) {
  return <aside className={`callout ${tone}`}>{title ? <strong>{title}</strong> : null}<div>{children}</div></aside>;
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="steps">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return <li><h2>{title}</h2><div>{children}</div></li>;
}

