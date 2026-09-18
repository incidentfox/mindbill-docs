import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DocPage } from "@/components/doc-page";
import { walkthroughs } from "@/lib/walkthroughs/rfa";

export const metadata: Metadata = {
  title: "RFA visual walkthroughs", description: "Follow real RFA screens from creation through follow-up, with highlighted controls and expected results.",
  alternates: { canonical: "/walkthroughs/rfa" },
};

export default function RfaWalkthroughsPage() {
  return <DocPage eyebrow="Visual walkthroughs" title="RFA, step by step" description="See where to click, what happens next, and what to check. Each walkthrough uses real components with clearly marked demonstration records."
    toc={[{ id: "walkthroughs", label: "Choose a workflow" }, { id: "verification", label: "Verification record" }]}
    previous={{ href: "/guides/rfas", label: "RFA integration guide" }}>
    <p className="walkthrough-meta">Captured September 18, 2026 · React 0.75.0</p>
    <h2 id="walkthroughs">Choose a workflow</h2>
    <div className="walkthrough-cards">{walkthroughs.map((article, i) => <Link className="walkthrough-card" key={article.slug} href={`/walkthroughs/rfa/${article.slug}`}>
      <span className="walkthrough-card-number">{String(i + 1).padStart(2, "0")}</span>
      <span><strong>{article.title}</strong><span>{article.description}</span><small>{article.steps.length} illustrated steps →</small></span>
    </Link>)}</div>
    <h2 id="verification">A visual record you can audit</h2>
    <p>The red outlines and numbered markers were placed over actual browser controls during capture. Every image has a full-size view and an unmarked original. The instructions name the action and describe its expected result, so you can compare your own integration with each screen.</p>
    <Callout title="What was exercised">The published React 0.75.0 components ran in local production builds against synthetic API fixtures. Browser checks exercised the interactions shown here. These are UI workflow demonstrations, not screenshots of customer data or evidence of live fax delivery.</Callout>
    <ul>
      <li><strong>Captured:</strong> September 18, 2026. All patient, claim, provider, and recipient records are fictional.</li>
      <li><strong>Audit files:</strong> <a href="/walkthroughs/rfa/evidence.json">capture and interaction checks</a>, plus original images linked beneath each step.</li>
      <li><strong>Still requires a live test:</strong> an outbound fax received by a real recipient and its returning response arriving, matching, and being reviewed in the correct organization.</li>
      <li><strong>Integration details:</strong> permissions, endpoint contracts, and setup belong in the <Link href="/guides/rfas">RFA developer guide</Link>.</li>
    </ul>
    <p>Dashboard aging and utilization review deadlines answer different questions. Aging shows how long a request has been sent; the review deadline comes from the server&apos;s receipt and review evidence. Neither an old request nor a delivered fax establishes treatment approval.</p>
  </DocPage>;
}
