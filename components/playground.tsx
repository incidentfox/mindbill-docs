"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

type PlaygroundProps = {
  name: string;
  code: string;
  height?: number;
  label?: string;
};

const fixture = `const review = {
  bill: {
    id: "bill_demo_1038", billNumber: 1038, status: "Incomplete",
    billingMode: "med_legal", dos: "2026-08-26",
    billingSnapshot: {
      billingProvider: { name: "Northstar Evaluations", taxId: "12-3456789", npi: "1023401122", billType: "Professional", phone: "626-555-0194", billingStreet: "236 W Mountain St", billingCity: "Pasadena", billingState: "CA", billingZip: "91103" },
      renderingProvider: { name: "Dr. Morgan Chen", specialty: "Psychiatry", npi: "1023401122", taxonomy: "2084P0800X", licenseNumber: "A140748", licenseState: "CA", isQME: true },
      placeOfService: { name: "West Covina Exam Office", street: "1050 West Lakes Dr, Ste 225", city: "West Covina", state: "CA", zip: "91790", posCode: "11" },
    },
    lineItems: [{ id: "line_1", code: "ML201", modifiers: ["-95"], units: 1, charge: 2015, serviceDate: "2026-08-26" }],
    attachments: [
      { id: "doc_report", filename: "final-report.pdf", documentType: "final_report", description: "Final medical-legal report" },
      { id: "doc_pos", filename: "proof-of-service.pdf", documentType: "proof_of_service", description: "Proof of service" },
    ],
    totalCharge: 2015, totalPaid: 0, balanceDue: 2015,
  },
  patient: { name: "Alex Morgan", firstName: "Alex", lastName: "Morgan", dob: "1988-03-05" },
  injury: { claimNumber: "W8331838-0001", employer: "Northstar Foods", doi: "2025-05-30", adjNumber: "ADJ21439594", claimsAdminId: "payer_republic", claimsAdminName: "Republic Indemnity", claimPatternStatus: { state: "match", label: "Claim pattern matches Republic Indemnity" } },
};`;

const statusCode = `import { useState } from "react";
import { BillStatusSummary } from "@mindbill/react";

export default function App() {
  const [message, setMessage] = useState("");
  return <main className="demo">
    <BillStatusSummary
      status="processed" submittedAt="2026-08-12" agingDays={13}
      updatedAt="2026-08-25" totalCharge={2015} totalPaid={0}
      balanceDue={2015} appearance={{ preset: "mindbill" }}
      actions={[
        { id: "eor", label: "View EOR", onClick: () => setMessage("Opening EOR") },
        { id: "payment", label: "Post payment", primary: true, onClick: () => setMessage("Payment opened") },
      ]}
    />
    {message && <p>{message}</p>}
  </main>;
}`;

const connectedStatusCode = `import { useState } from "react";
import { ConnectedBillStatus } from "@mindbill/react";

const status = {
  billId: "bill_demo_1038", state: "denied", nativeStatus: "Denied",
  submittedAt: "2026-07-27", agingDays: 29, updatedAt: "2026-08-25",
  totalCharge: 2015, totalPaid: 0, balanceDue: 2015,
};

export default function App() {
  const [message, setMessage] = useState("");
  return <main className="demo">
    <ConnectedBillStatus
      billId={status.billId} enabled={false} initialData={status}
      appearance={{ preset: "orange-bright" }}
      actions={[
        { id: "denial", label: "View denial", onClick: () => setMessage("Denial opened") },
        { id: "review", label: "Second review", primary: true, onClick: () => setMessage("Second review opened") },
      ]}
    />
    {message && <p>{message}</p>}
  </main>;
}`;

const reviewCode = `import { useState } from "react";
import { BillReviewForm } from "@mindbill/react";

${fixture}

const delivery = {
  payerName: "Republic Indemnity",
  recommended: { route: "ebill", label: "E-bill via Data Dimensions", detail: "Payer ID WR618 · EDI", fallback: false, confidence: "high", payerName: "Republic Indemnity", payerId: "WR618" },
  options: [
    { route: "ebill", label: "E-bill via Data Dimensions", detail: "Payer ID WR618 · EDI", fallback: false, confidence: "high", payerName: "Republic Indemnity", payerId: "WR618" },
    { route: "fax", label: "Fax", detail: "(213) 555-0199", fallback: true, confidence: "directory", payerName: "Republic Indemnity", target: "(213) 555-0199" },
    { route: "mail", label: "Mail", detail: "PO Box 19600, Irvine, CA 92623", fallback: true, confidence: "directory", payerName: "Republic Indemnity", target: "PO Box 19600, Irvine, CA 92623" },
  ],
  contacts: { faxNumber: "(213) 555-0199", mailingAddress: "PO Box 19600, Irvine, CA 92623" },
};

export default function App() {
  const [data, setData] = useState(review);
  const [notice, setNotice] = useState("Try editing a field or opening Submit bill.");
  return <main className="review-demo">
    <p className="notice">{notice}</p>
    <BillReviewForm
      data={data} appearance={{ preset: "qme-companion" }}
      features={{ codingPresets: true, wcabNumber: true }}
      onSave={async () => { setNotice("Draft saved locally."); return data; }}
      onSubmit={async (_, route) => setNotice("Submitted through " + route.route + ".")}
      onGetDeliveryOptions={async () => delivery}
      onSearchClaimsAdministrators={async (query) => [
        { id: "payer_republic", name: "Republic Indemnity", hasElectronic: true, recommended: true, confidence: "high", signals: [{ kind: "claim_number", state: "match", label: "Claim number pattern matches" }] },
        { id: "payer_republic_wc", name: "Republic Indemnity Company of America", hasElectronic: true, confidence: "directory" },
      ].filter((payer) => payer.name.toLowerCase().includes(query.toLowerCase()))}
      onAddAttachment={async (file, documentType) => {
        setData((current) => ({ ...current, bill: { ...current.bill, attachments: [...current.bill.attachments, { id: String(Date.now()), filename: file.name, documentType }] } }));
        setNotice("Document attached locally.");
      }}
      onRemoveAttachment={async (id) => setData((current) => ({ ...current, bill: { ...current.bill, attachments: current.bill.attachments.filter((doc) => doc.id !== id) } }))}
      onOpenAttachment={(doc) => setNotice("Opening " + doc.filename)}
    />
  </main>;
}`;

const lifecycleCode = `import { ConnectedBillLifecycle } from "@mindbill/react";

${fixture}

const lifecycle = {
  ...review,
  bill: { ...review.bill, status: "Denied" },
  lifecycle: {
    state: "denied", nativeStatus: "Denied", submittedAt: "2026-07-27",
    agingDays: 29, updatedAt: "2026-08-25",
    actions: [
      { id: "view_eor", label: "View EOR", enabled: true },
      { id: "second_review", label: "Submit second review", enabled: true, primary: true },
      { id: "close", label: "Close bill", enabled: true },
    ],
  },
  eors: [{ id: "eor_1", filename: "EOR-1038.pdf", description: "Explanation of Review", addedAt: "2026-08-25", contentUrl: "#eor" }],
  activity: [
    { id: "evt_3", type: "bill.denied", createdAt: "2026-08-25T17:42:18Z", description: "Medical necessity or frequency" },
    { id: "evt_2", type: "eor.received", createdAt: "2026-08-25T17:41:02Z", description: "EOR-1038.pdf received" },
    { id: "evt_1", type: "bill.submitted", createdAt: "2026-07-27T16:08:00Z", actor: "Taylor R." },
  ],
  payments: [],
  remittance: { payerReportedPaid: 0, totalPaid: 0, balanceDue: 2015, denialReason: "Medical necessity or frequency" },
  delivery: {
    payerName: "Republic Indemnity",
    contacts: {
      adjusterName: "Jordan Lee", adjusterPhone: "(213) 555-0188",
      adjusterEmail: "jordan.lee@example.test", faxNumber: "(213) 555-0199",
      mailingAddress: "PO Box 19600, Irvine, CA 92623",
    },
  },
};

export default function App() {
  return <main className="review-demo">
    <ConnectedBillLifecycle
      billId="bill_demo_1038" enabled={false} initialData={lifecycle}
      appearance={{ preset: "orange-bright" }}
    />
  </main>;
}`;

const lifecycleActionsCode = `import { useState } from "react";
import { BillLifecycleActions } from "@mindbill/react";

const actions = [
  { id: "view_eor", label: "View EOR", enabled: true },
  { id: "second_review", label: "Submit second review", enabled: true, primary: true },
  { id: "post_payment", label: "Post payment", enabled: false, reason: "No payable EOR line remains." },
  { id: "close", label: "Close bill", enabled: true },
];

export default function App() {
  const [message, setMessage] = useState("Choose an available action.");
  return <main className="demo">
    <h2>Denied · $2,015.00 due</h2>
    <p>{message}</p>
    <BillLifecycleActions
      actions={actions}
      showUnavailable
      appearance={{ preset: "orange-bright" }}
      onAction={(action) => setMessage(action.label + " selected")}
    />
  </main>;
}`;

const activityTimelineCode = `import { BillActivityTimeline } from "@mindbill/react";

const events = [
  { id: "evt_4", type: "bill.denied", createdAt: "2026-08-25T17:42:18Z", description: "Medical necessity or frequency" },
  { id: "evt_3", type: "eor.received", createdAt: "2026-08-25T17:41:02Z", description: "EOR-1038.pdf received" },
  { id: "evt_2", type: "bill.accepted", createdAt: "2026-08-13T09:16:00Z" },
  { id: "evt_1", type: "bill.submitted", createdAt: "2026-08-12T16:08:00Z", actor: "Taylor R." },
];

export default function App() {
  return <main className="demo">
    <BillActivityTimeline
      events={events}
      appearance={{ preset: "clinical-blue" }}
    />
  </main>;
}`;

const lifecycleProgressCode = `import { BillLifecycleProgress } from "@mindbill/react";

export default function App() {
  return <main className="demo">
    <BillLifecycleProgress
      state="second_review"
      nativeStatus="Second Bill Review submitted"
      submittedAt="2026-07-27T16:08:00Z"
      agingDays={29}
      appearance={{ preset: "orange-bright" }}
    />
  </main>;
}`;

const snapshotCode = `import { BillSnapshotSummary } from "@mindbill/react";

${fixture}

export default function App() {
  return <main className="demo">
    <BillSnapshotSummary
      bill={review.bill}
      patient={review.patient}
      injury={review.injury}
      delivery={{ payerName: "Republic Indemnity", contacts: {} }}
      appearance={{ preset: "clinical-blue" }}
    />
  </main>;
}`;

const remittanceCode = `import { BillRemittanceCard } from "@mindbill/react";

export default function App() {
  return <main className="demo">
    <BillRemittanceCard
      remittance={{
        payerReportedPaid: 503.75,
        totalPaid: 503.75,
        balanceDue: 1511.25,
        denialReason: "Payment reduced pending additional documentation.",
      }}
      appearance={{ preset: "orange-bright" }}
    />
  </main>;
}`;

const payerContactCode = `import { BillPayerContactCard } from "@mindbill/react";

export default function App() {
  return <main className="demo">
    <BillPayerContactCard
      delivery={{
        payerName: "Republic Indemnity",
        contacts: {
          adjusterName: "Jordan Lee",
          adjusterPhone: "(213) 555-0188",
          adjusterEmail: "jordan.lee@example.test",
          faxNumber: "(213) 555-0199",
          mailingAddress: "PO Box 19600, Irvine, CA 92623",
        },
      }}
      appearance={{ preset: "clinical-blue" }}
    />
  </main>;
}`;

const paymentLedgerCode = `import { BillPaymentLedger } from "@mindbill/react";

const payments = [{
  id: "payment_1", method: "check", checkNumber: "4811505",
  status: "deposited", depositDate: "2026-08-25", checkReceived: true,
  receivedDate: "2026-08-23", amount: 503.75, feeAmount: null,
  feeReason: null, source: "paper", postedAt: "2026-08-25T17:42:18Z",
  updatedAt: null, note: "Partial payment",
}];

export default function App() {
  return <main className="demo">
    <BillPaymentLedger payments={payments} appearance={{ preset: "orange-bright" }} />
  </main>;
}`;

const hostedReviewCode = `import { useState } from "react";
import { MindBillBillReview } from "@mindbill/react";

export default function App() {
  const [error, setError] = useState("");
  return <main className="demo">
    <h2>Hosted bill review</h2>
    <p>Replace these two values with a session minted by your server.</p>
    <MindBillBillReview
      sessionToken="demo-session-replace-me"
      embedUrl="https://app.mindbill.org/embed/bill-review"
      appearance={{ theme: "light", accentColor: "#ff4f0a" }}
      onMindBillError={(event) => setError(event.detail.message)}
    />
    {error && <p className="error">{error}</p>}
  </main>;
}`;

const hostedTimelineCode = `import { useState } from "react";
import { MindBillBillTimeline } from "@mindbill/react";

export default function App() {
  const [error, setError] = useState("");
  return <main className="demo">
    <h2>Hosted bill timeline</h2>
    <p>Replace these two values with a session minted by your server.</p>
    <MindBillBillTimeline
      sessionToken="demo-session-replace-me"
      embedUrl="https://app.mindbill.org/embed/bill-timeline"
      appearance={{ theme: "light", accentColor: "#1677ff" }}
      onMindBillError={(event) => setError(event.detail.message)}
    />
    {error && <p className="error">{error}</p>}
  </main>;
}`;

const demoCss = `body { margin: 0; background: #f5f8f9; }
.demo { padding: 24px; max-width: 760px; margin: 0 auto; font-family: Inter, system-ui, sans-serif; color: #203743; }
.demo > p, .notice { color: #657982; }
.review-demo { min-width: 920px; padding: 18px; font-family: Inter, system-ui, sans-serif; }
.notice { margin: 0 0 12px; padding: 10px 12px; border: 1px solid #dbe6ea; border-radius: 8px; background: white; }
.error { color: #b42318 !important; }
* { box-sizing: border-box; }`;

function ComponentPlayground({
  name,
  code,
  height = 520,
  label = "Synthetic data · edit and run",
}: PlaygroundProps) {
  return (
    <div className="playground-shell" data-copy-page-ignore>
      <div className="playground-title">
        <span>{name}</span>
        <small>{label}</small>
      </div>
      <Sandpack
        template="react"
        theme="auto"
        files={{ "/App.js": code, "/styles.css": demoCss }}
        customSetup={{ dependencies: { "@mindbill/react": "0.17.0" } }}
        options={{
          showNavigator: false,
          showTabs: true,
          showLineNumbers: true,
          editorHeight: height,
          wrapContent: true,
          closableTabs: false,
          activeFile: "/App.js",
        }}
      />
    </div>
  );
}

const quickstartComponentCode = `import { ConnectedBillLifecycle } from "@mindbill/react";
import { knownBillValues } from "./bill-data";

export default function CaseBilling() {
  return (
    <ConnectedBillLifecycle
      create={knownBillValues}
      sessionEndpoint="/api/mindbill/session"
      appearance={{ preset: "clinical-blue" }}
      onBillCreated={(billId) => {
        // Keep this ID beside your case or report.
        saveBillId(billId);
      }}
      onBillIdChange={(billId, previousBillId) => {
        // A corrected bill may replace the previous bill ID.
        replaceStoredBillId(previousBillId, billId);
      }}
      onChanged={(bill) => {
        // Immediate UI and analytics only. Webhooks are authoritative.
        updateLocalBillingSummary(bill.lifecycle);
      }}
    />
  );
}`;

const quickstartServerCode = `import { MindBillClient } from "@mindbill/node";

const mindbill = new MindBillClient({
  apiKey: process.env.MINDBILL_API_KEY,
});

// POST /api/mindbill/session — any server framework
export async function POST(request) {
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

  return Response.json(await mindbill.createBrowserSession({
    subject: user.id,
    permissions,
    allowedOrigin: process.env.APP_ORIGIN,
    expiresIn: 900,
  }));
}`;

const quickstartBillDataCode = `export const knownBillValues = {
  externalId: "report_9f7a",
  billingMode: "med_legal",
  patient: {
    externalId: "patient_42",
    firstName: "Alex",
    lastName: "Morgan",
    dateOfBirth: "1984-05-17",
    address: { line1: "100 Main St", city: "Fresno", state: "CA", postalCode: "93721" },
  },
  claim: {
    externalId: "claim_17",
    claimNumber: "WC-44871",
    employer: "Example Foods",
    dateOfInjury: "2026-02-14",
    claimsAdministrator: { name: "Example Claims Administrator" },
  },
  service: { date: "2026-08-26" },
  billingProvider: { name: "Northstar Evaluations", taxId: "123456789", npi: "1234567893" },
  renderingProvider: { name: "Morgan Chen, MD", npi: "1234567893", isQme: true },
  diagnoses: ["M25.512"],
  serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
};`;

export function QuickstartPlayground() {
  return (
    <div className="playground-shell quickstart-playground" data-copy-page-ignore>
      <div className="playground-title">
        <span>React + server</span>
        <small>Editable synthetic preview</small>
      </div>
      <Sandpack
        template="react"
        theme="auto"
        files={{
          "/App.js": { code: `export { default } from "./Preview";`, hidden: true },
          "/Preview.jsx": reviewCode,
          "/CaseBilling.jsx": quickstartComponentCode,
          "/server.ts": quickstartServerCode,
          "/bill-data.js": quickstartBillDataCode,
          "/styles.css": { code: demoCss, hidden: true },
        }}
        customSetup={{ dependencies: { "@mindbill/react": "0.17.0" } }}
        options={{
          showNavigator: false,
          showTabs: true,
          showLineNumbers: true,
          editorHeight: 680,
          wrapContent: true,
          closableTabs: false,
          activeFile: "/Preview.jsx",
        }}
      />
      <p className="playground-note">Preview uses synthetic data and cannot submit. Open <strong>CaseBilling.jsx</strong>, <strong>server.ts</strong>, and <strong>bill-data.js</strong> for the production integration.</p>
    </div>
  );
}

export function LifecyclePlayground() {
  return <ComponentPlayground name="ConnectedBillLifecycle" code={lifecycleCode} height={720} />;
}

export function LifecycleActionsPlayground() {
  return <ComponentPlayground name="BillLifecycleActions" code={lifecycleActionsCode} height={520} />;
}

export function ActivityTimelinePlayground() {
  return <ComponentPlayground name="BillActivityTimeline" code={activityTimelineCode} height={560} />;
}

export function LifecycleProgressPlayground() {
  return <ComponentPlayground name="BillLifecycleProgress" code={lifecycleProgressCode} />;
}

export function SnapshotPlayground() {
  return <ComponentPlayground name="BillSnapshotSummary" code={snapshotCode} />;
}

export function RemittancePlayground() {
  return <ComponentPlayground name="BillRemittanceCard" code={remittanceCode} />;
}

export function PayerContactPlayground() {
  return <ComponentPlayground name="BillPayerContactCard" code={payerContactCode} />;
}

export function PaymentLedgerPlayground() {
  return <ComponentPlayground name="BillPaymentLedger" code={paymentLedgerCode} height={560} />;
}

export function ConnectedStatusPlayground() {
  return <ComponentPlayground name="ConnectedBillStatus" code={connectedStatusCode} />;
}

export function StatusPlayground() {
  return <ComponentPlayground name="BillStatusSummary" code={statusCode} />;
}

export function ReviewFormPlayground() {
  return <ComponentPlayground name="BillReviewForm" code={reviewCode} height={760} />;
}

export function HostedReviewPlayground() {
  return (
    <ComponentPlayground
      name="MindBillBillReview"
      code={hostedReviewCode}
      height={600}
      label="Live wrapper · add a session to connect"
    />
  );
}

export function HostedTimelinePlayground() {
  return (
    <ComponentPlayground
      name="MindBillBillTimeline"
      code={hostedTimelineCode}
      height={600}
      label="Live wrapper · add a session to connect"
    />
  );
}
