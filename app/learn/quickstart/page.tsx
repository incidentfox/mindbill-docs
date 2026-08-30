import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Callout, DocPage, Step, Steps } from "@/components/doc-page";

export const metadata: Metadata = { title: "Quickstart" };

const install = `npm install @mindbill/react @mindbill/node`;

const server = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY!,
});

// Any server framework: POST /api/mindbill/session
export async function POST(request: Request) {
  const user = await requireSignedInUser(request);

  const permissions = user.role === "billing_admin"
    ? [
        "bills:create", "bills:read", "bills:edit", "bills:submit", "bills:act",
        "documents:read", "documents:write", "payers:read", "eors:read",
      ]
    : [
        "bills:create", "bills:read", "bills:edit",
        "documents:read", "documents:write", "payers:read",
      ];

  const session = await mindbill.createBrowserSession({
    subject: user.id,
    permissions,
    allowedOrigin: process.env.APP_ORIGIN!,
    expiresIn: 900,
  });

  return Response.json(session);
}`;

const snapshot = `export const knownBillValues = {
  externalId: "report_9f7a",
  billingMode: "med_legal",
  patient: {
    externalId: "patient_42",
    firstName: "Alex",
    lastName: "Morgan",
    dateOfBirth: "1984-05-17",
    address: {
      line1: "100 Main St",
      city: "Fresno",
      state: "CA",
      postalCode: "93721",
    },
  },
  claim: {
    externalId: "claim_17",
    claimNumber: "WC-44871",
    employer: "Example Foods",
    dateOfInjury: "2026-02-14",
    claimsAdministrator: { name: "Example Claims Administrator" },
  },
  service: { date: "2026-08-26" },
  billingProvider: {
    name: "Northstar Medical Evaluators",
    taxId: "123456789",
    npi: "1234567893",
    address: {
      line1: "200 Office Ave",
      city: "Fresno",
      state: "CA",
      postalCode: "93721",
    },
  },
  renderingProvider: {
    name: "Morgan Chen, MD",
    npi: "1234567893",
    licenseNumber: "A12345",
    licenseState: "CA",
    isQme: true,
  },
  serviceLocation: {
    name: "Fresno Exam Office",
    placeOfServiceCode: "11",
    address: {
      line1: "200 Office Ave",
      city: "Fresno",
      state: "CA",
      postalCode: "93721",
    },
  },
  diagnoses: ["M25.512"],
  serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
};`;

const component = `import { ConnectedBillLifecycle } from "@mindbill/react";
import { knownBillValues } from "./known-bill-values";

export function CaseBilling() {
  return (
    <ConnectedBillLifecycle
      create={knownBillValues}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "clinical-blue" }}
      onBillCreated={(billId) => {
        // Immediate UI navigation or optimistic association.
        console.log("Created", billId);
      }}
    />
  );
}`;

const browser = `import { createBillLifecycleClient } from "@mindbill/browser";

const billing = createBillLifecycleClient({
  sessionEndpoint: "/api/mindbill/session",
});

const { billId, data } = await billing.createBill(knownBillValues);`;

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Submit your first sandbox bill"
      description="Pass the CMS-1500 values and payer documents your product already has. The component lets a user review, submit, and manage the bill without leaving your product."
      toc={[
        { id: "install", label: "Install" },
        { id: "authorize", label: "Authorize the browser" },
        { id: "snapshot", label: "Map known values" },
        { id: "render", label: "Render billing" },
        { id: "sync", label: "Synchronize status" },
        { id: "api-only", label: "Without React" },
      ]}
      previous={{ href: "/learn/anatomy-of-a-bill", label: "Anatomy of a bill" }}
      next={{ href: "/learn/routing", label: "Routing and EDI" }}
    >
      <Callout title="One small server route">Keep one organization-scoped API key on your server. Your authenticated route maps the current user&apos;s role to billing permissions and returns a short-lived token for the exact browser origin. The browser creates and manages bills without receiving the permanent key.</Callout>
      <Steps>
        <Step title="Install the component and server client">
          <span id="install" />
          <CodeBlock code={install} language="bash" filename="Terminal" />
        </Step>
        <Step title="Authorize the signed-in user">
          <span id="authorize" />
          <p>Add one authenticated route in any server framework. The API key fixes the organization, <code>subject</code> identifies your user, and <code>permissions</code> represent the user&apos;s role.</p>
          <CodeBlock code={server} filename="server/mindbill-session.ts" />
          <Callout tone="warning" title="Do not put the API key in frontend code">Only the short-lived, exact-origin session reaches the browser. MindBill enforces both the organization boundary and the permissions on every request.</Callout>
        </Step>
        <Step title="Map the values you already know">
          <span id="snapshot" />
          <p>A bill is the snapshot that should print on the <a href="https://www.nucc.org/images/stories/PDF/1500_claim_form_2012_02.pdf">CMS-1500</a> and travel in the <a href="https://www.cms.gov/files/document/mln006976-medicare-billing-cms-1500-837p.pdf">837P</a>. Prefill every value already present in your case or report system; the user edits only what is missing or wrong.</p>
          <CodeBlock code={snapshot} filename="known-bill-values.ts" />
          <Callout title="Choose the billing mode"><code>billingMode: &quot;med_legal&quot;</code> applies California medical-legal rules. Use <code>billingMode: &quot;professional&quot;</code> for treatment or professional claims; each service line then needs its exact <code>serviceDate</code> and <code>charge</code>.</Callout>
        </Step>
        <Step title="Render the complete lifecycle">
          <span id="render" />
          <p>The component creates the private draft in the browser, returns its stable <code>billId</code>, and owns payer search, packet review, submission, status, EORs, payment posting, reviews, corrections, and closure.</p>
          <CodeBlock code={component} filename="CaseBilling.tsx" />
          <p>Pass <code>billId</code> instead of <code>create</code> when reopening an existing bill.</p>
        </Step>
        <Step title="Synchronize durable status">
          <span id="sync" />
          <p>Use <code>onBillCreated</code> for immediate UI state. Use ordered events or signed webhooks for authoritative server synchronization because acknowledgements, EORs, payments, and denials can arrive after the browser session ends.</p>
        </Step>
      </Steps>
      <h2 id="api-only">Use the same flow without React</h2>
      <p>The framework-neutral browser package uses the same session route. Angular ships its own native lifecycle component. Your server may also call the REST API directly when there is no end-user review step.</p>
      <CodeBlock code={`npm install @mindbill/browser`} language="bash" filename="Terminal" />
      <CodeBlock code={browser} filename="billing.ts" />
    </DocPage>
  );
}
