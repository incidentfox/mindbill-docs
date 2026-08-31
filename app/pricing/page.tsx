import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/doc-page";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <DocPage
      eyebrow="Pricing"
      title="Pay per submitted bill"
      description="MindBill is usage-based infrastructure. Integrate once, then pay for the workers’ compensation bills you submit."
      toc={[
        { id: "model", label: "Pricing model" },
        { id: "included", label: "What is included" },
        { id: "volume", label: "Volume pricing" },
      ]}
      previous={{ href: "/api-reference", label: "REST API" }}
    >
      <h2 id="model">A simple usage model</h2>
      <p>Pricing is based on submitted bills rather than seats, providers, locations, or component usage. Editable values stay in your product until the user submits; that one atomic operation creates the immutable bill and payer packet in MindBill.</p>

      <div className="pricing-card">
        <span>Usage unit</span>
        <strong>One submitted bill</strong>
        <p>Contact us for the current per-bill rate and volume terms.</p>
      </div>

      <h2 id="included">What the integration includes</h2>
      <div className="concept-grid">
        <section className="concept-card"><b>One bill API</b><p>Create the CMS-1500 data, attach the payer packet, submit, and keep one stable bill ID.</p></section>
        <section className="concept-card"><b>Multi-network routing</b><p>Reach payer destinations through MindBill&apos;s Carisk, Jopari, and Data Dimensions integrations.</p></section>
        <section className="concept-card"><b>Lifecycle normalization</b><p>Read acknowledgements, EORs, payments, denials, reviews, corrections, and closure through one model.</p></section>
        <section className="concept-card"><b>Optional native UI</b><p>Use React or Angular components when you want the billing workflow embedded in your product.</p></section>
      </div>

      <h2 id="volume">Volume pricing</h2>
      <p>Higher-volume partners can use committed or tiered pricing. The API and component model remain the same.</p>
      <div className="action-row">
        <Link className="button-link primary" href="mailto:hello@mindbill.org?subject=MindBill%20API%20pricing">Discuss pricing</Link>
        <Link className="button-link" href="/learn/quickstart">Build in the sandbox</Link>
      </div>
    </DocPage>
  );
}
