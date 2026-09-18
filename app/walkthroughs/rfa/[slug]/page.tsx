import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Callout, DocPage } from "@/components/doc-page";
import { Screenshot } from "@/components/walkthroughs/screenshot";
import { walkthroughs, screenshots } from "@/lib/walkthroughs/rfa";

export function generateStaticParams() { return walkthroughs.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = walkthroughs.find(item => item.slug === slug);
  return article ? { title: article.title, description: article.description, alternates: { canonical: `/walkthroughs/rfa/${slug}` } } : {};
}

export default async function WalkthroughPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = walkthroughs.findIndex(item => item.slug === slug);
  if (index < 0) notFound();
  const article = walkthroughs[index];
  const next = walkthroughs[index + 1];
  return <DocPage eyebrow="RFA walkthroughs" title={article.title} description={article.description}
    toc={[{ id: "before", label: "Before you start" }, ...article.steps.map((step, i) => ({ id: `step-${i + 1}`, label: `${i + 1}. ${step.title}` })), { id: "verification", label: "Verification scope" }]}
    previous={{ href: "/walkthroughs/rfa", label: "All RFA walkthroughs" }}
    next={next ? { href: `/walkthroughs/rfa/${next.slug}`, label: next.title } : { href: "/guides/rfas", label: "RFA integration guide" }}>
    <p className="walkthrough-meta">Captured September 18, 2026 · React 0.75.0 · Synthetic demonstration records</p>
    <h2 id="before">Before you start</h2>
    <ul>{article.before.map(text => <li key={text}>{text}</li>)}</ul>
    <p>Numbered red outlines identify the controls used in each step. Select any screenshot to enlarge it.</p>
    {article.steps.map((step, i) => {
      const shot = screenshots[step.image];
      return <section className="walkthrough-step" key={step.title} aria-labelledby={`step-${i + 1}`}>
        <h2 id={`step-${i + 1}`}><span className="walkthrough-step-number">{i + 1}</span>{step.title}</h2>
        <p>{step.instruction}</p>
        <Screenshot {...shot} alt={step.alt} caption={step.caption} />
        <div className="walkthrough-expected"><strong>What you should see</strong><p>{step.expected}</p></div>
      </section>;
    })}
    <h2 id="verification">What these screenshots verify</h2>
    <Callout title="Real components, synthetic records">These screenshots come from the published React components running in a local production build with simulated API responses. They demonstrate the controls and visible outcomes exercised in the walkthrough. They do not prove a live payer transaction or an inbound fax roundtrip. {article.limitations}</Callout>
    <p><Link href="/walkthroughs/rfa#verification">Read the verification record</Link> for capture details and checks. Your application may use different colors, permissions, or enabled features.</p>
    <h3>Developer reference</h3>
    <ul>{article.related.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
  </DocPage>;
}
