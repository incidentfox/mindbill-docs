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
};

export default function App() {
  return <main className="review-demo">
    <ConnectedBillLifecycle
      billId="bill_demo_1038" enabled={false} initialData={lifecycle}
      appearance={{ preset: "orange-bright" }}
    />
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
    <div className="playground-shell">
      <div className="playground-title">
        <span>{name}</span>
        <small>{label}</small>
      </div>
      <Sandpack
        template="react"
        theme="auto"
        files={{ "/App.js": code, "/styles.css": demoCss }}
        customSetup={{ dependencies: { "@mindbill/react": "0.15.0" } }}
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

export function LifecyclePlayground() {
  return <ComponentPlayground name="ConnectedBillLifecycle" code={lifecycleCode} height={720} />;
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
