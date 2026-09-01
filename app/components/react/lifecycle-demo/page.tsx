import type { Metadata } from "next";
import { Callout, DocPage } from "@/components/doc-page";
import { FullLifecyclePlayground, StatusGalleryPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "Full bill lifecycle demo" };

export default function LifecycleDemoPage() {
  return (
    <DocPage
      eyebrow="Components"
      title="Full bill lifecycle demo"
      description="See the same public React components your application installs, from a submitted bill through payer acceptance, EOR processing, payment, and closure."
      toc={[
        { id: "journey", label: "Complete journey" },
        { id: "states", label: "Every status" },
        { id: "sandbox", label: "Connect the sandbox" },
      ]}
      previous={{ href: "/components/react", label: "React components" }}
      next={{ href: "/components/angular", label: "Angular components" }}
    >
      <h2 id="journey">Submission to payment and closure</h2>
      <p>Use the controls above the preview to move a single synthetic bill through the happy path. The preview is local and deterministic; it makes no network requests and contains no real patient data.</p>
      <FullLifecyclePlayground />

      <h2 id="states">Every lifecycle status</h2>
      <p>These presentational status surfaces cover the happy path and the action states your product needs to handle. “Sent” is the user-facing label for the API&apos;s immutable <code>submitted</code> state.</p>
      <StatusGalleryPlayground />

      <h2 id="sandbox">Connect the real sandbox</h2>
      <p>Pass only the submitted <code>billId</code> and a short-lived browser session through <code>getSession</code> or <code>sessionEndpoint</code>. <code>ConnectedBillLifecycle</code> fetches the immutable bill snapshot, EOR, payments, actions, and history directly from MindBill. In the sandbox it also exposes controls for acceptance, processing, rejection, denial, and payment testing.</p>
      <Callout tone="success" title="The production surface is unchanged">Simulation is accepted only for sandbox organizations. Live bills always follow clearinghouse and payer events.</Callout>
    </DocPage>
  );
}
