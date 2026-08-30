import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { StatusPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "React components" };

const install = `npm install @mindbill/react @mindbill/node`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";

export function CaseBilling({ billId }: { billId: string }) {
  return (
    <ConnectedBillLifecycle
      billId={billId}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
      onChanged={(data) => {
        console.log(data.bill.status, data.bill.balanceDue);
      }}
    />
  );
}`;

const hook = `import { useBillLifecycle } from "@mindbill/react";

function CustomBilling({ billId }: { billId: string }) {
  const billing = useBillLifecycle({
    billId,
    sessionEndpoint: "/api/mindbill/session",
  });

  if (billing.isLoading) return <p>Loading…</p>;
  if (billing.error) return <button onClick={billing.refresh}>Try again</button>;

  return (
    <button onClick={() => billing.openEor(billing.data!.eors[0])}>
      View EOR
    </button>
  );
}`;

export default function ReactPage() {
  return (
    <DocPage eyebrow="Components" title="React" description="Native, themeable components with built-in session renewal, direct lifecycle API calls, payer search, delivery routing, documents, EORs, and state-aware actions."
      toc={[{ id: "install", label: "Install" }, { id: "lifecycle", label: "Complete lifecycle" }, { id: "playground", label: "Live playground" }, { id: "hooks", label: "Hooks" }, { id: "appearance", label: "Appearance" }]}
      previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }} next={{ href: "/components/angular", label: "Angular components" }}>
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <h2 id="lifecycle">Render the complete lifecycle</h2>
      <p>Pass the bill ID and your browser-session endpoint. The component handles the rest and renders inside your page—no iframe or MindBill navigation.</p>
      <CodeBlock code={lifecycle} filename="CaseBilling.tsx" />
      <Callout title="Included behavior">The form always keeps one keyboard-ready empty procedure line after entered lines. It also shows the actual e-bill, fax, mail, and email destinations in a review dialog before submission.</Callout>
      <h2 id="playground">Try a component</h2>
      <p>Edit this example. The preview runs the published <code>@mindbill/react</code> package, not a screenshot.</p>
      <StatusPlayground />
      <h2 id="hooks">Build a custom layout with hooks</h2>
      <p>Use <code>useBillLifecycle</code> when you want your own presentation. It exposes the same session-aware status, payer search, save, submit, document, EOR, payment, review, correction, and close methods.</p>
      <CodeBlock code={hook} filename="CustomBilling.tsx" />
      <h2 id="appearance">Match your product</h2>
      <p>Start with <code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, or <code>clinical-blue</code>, then override accent, text, surface, border, radius, shadow, font, and spacing tokens.</p>
    </DocPage>
  );
}
