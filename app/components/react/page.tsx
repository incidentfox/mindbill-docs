import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage } from "@/components/doc-page";
import { StatusPlayground } from "@/components/playground";

export const metadata: Metadata = { title: "React components" };

const install = `npm install @mindbill/react @mindbill/node`;

const lifecycle = `import { ConnectedBillLifecycle } from "@mindbill/react";

export function CaseBilling({ caseData }: { caseData: BillSnapshot }) {
  return (
    <ConnectedBillLifecycle
      create={caseData}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "orange-bright" }}
      onBillCreated={(billId) => linkBillToCase(billId)}
    />
  );
}`;

const existing = `export function ExistingBill({ billId }: { billId: string }) {
  return (
    <ConnectedBillLifecycle
      billId={billId}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "clinical-blue" }}
    />
  );
}`;

const hook = `import { useBillLifecycle } from "@mindbill/react";

function CustomBilling({ bill }: { bill: BillSnapshot }) {
  const billing = useBillLifecycle({
    create: bill,
    sessionEndpoint: "/api/mindbill/session",
    onBillCreated: (billId) => linkBillToCase(billId),
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
    <DocPage
      eyebrow="Components"
      title="React"
      description="Native, themeable components with bill creation, session renewal, payer search, delivery routing, documents, EORs, and state-aware actions built in."
      toc={[
        { id: "install", label: "Install" },
        { id: "lifecycle", label: "Create and render" },
        { id: "existing", label: "Open an existing bill" },
        { id: "playground", label: "Live playground" },
        { id: "hooks", label: "Hooks" },
        { id: "appearance", label: "Appearance" },
      ]}
      previous={{ href: "/guides/lifecycle", label: "Lifecycle and actions" }}
      next={{ href: "/components/angular", label: "Angular components" }}
    >
      <h2 id="install">Install</h2>
      <CodeBlock code={install} language="bash" filename="Terminal" />
      <h2 id="lifecycle">Create and render the complete lifecycle</h2>
      <p>Pass the bill snapshot you already have. The component creates the bill directly, stores the returned ID internally, and immediately opens the prefilled review form—there is no server-side create step and no iframe.</p>
      <CodeBlock code={lifecycle} filename="CaseBilling.tsx" />
      <Callout title="Included behavior">The form keeps one keyboard-ready empty procedure line after entered lines, suggests payers from name and claim-number signals, and shows the actual e-bill, fax, mail, and email destination before submission.</Callout>
      <h2 id="existing">Open an existing bill</h2>
      <p>After creation, render the same component with the stable bill ID anywhere in your product.</p>
      <CodeBlock code={existing} filename="ExistingBill.tsx" />
      <h2 id="playground">Try a component</h2>
      <p>Edit the code and interact with the rendered result. This is the published component, not a screenshot.</p>
      <StatusPlayground />
      <h2 id="hooks">Build a custom layout with hooks</h2>
      <p><code>useBillLifecycle</code> exposes the same session-aware create, payer search, save, submit, document, EOR, payment, review, correction, and close methods.</p>
      <CodeBlock code={hook} filename="CustomBilling.tsx" />
      <h2 id="appearance">Match your product</h2>
      <p>Start with <code>mindbill</code>, <code>qme-companion</code>, <code>orange-bright</code>, or <code>clinical-blue</code>, then override accent, text, surface, border, radius, shadow, font, and spacing tokens.</p>
    </DocPage>
  );
}
