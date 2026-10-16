"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { sdkVersions } from "@/lib/sdk-versions";

type PlaygroundProps = {
  name: string;
  code: string;
  height?: number;
  label?: string;
};

const fixture = `const review = {
  bill: {
    id: "bill_demo_1038", billNumber: 1038, status: "Submitted",
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

const submissionCode = `import { useState } from "react";
import { BillSubmissionForm } from "@mindbill/react";

const initialBill = {
  externalId: "report_9f7a",
  billingMode: "med_legal",
  patient: {
    externalId: "patient_42", firstName: "Alex", lastName: "Morgan",
    dateOfBirth: "1988-03-05",
    address: { line1: "100 Main St", city: "Fresno", state: "CA", postalCode: "93721" },
  },
  claim: {
    externalId: "claim_17", claimNumber: "WC-44871",
    employer: "Northstar Foods", dateOfInjury: "2025-05-30", injuryState: "CA",
    claimsAdministrator: { name: "Republic Indemnity" },
  },
  service: { date: "2026-08-26" },
  billingProvider: {
    name: "Northstar Evaluations", taxId: "123456789", npi: "1023401122",
    address: { line1: "236 W Mountain St", city: "Pasadena", state: "CA", postalCode: "91103" },
  },
  renderingProvider: {
    name: "Morgan Chen, MD", npi: "1098765432",
    licenseNumber: "A140748", licenseState: "CA",
  },
  serviceLocation: {
    name: "West Covina Exam Office", placeOfServiceCode: "11",
    address: { line1: "1050 West Lakes Dr", city: "West Covina", state: "CA", postalCode: "91790" },
  },
  diagnoses: ["M25.562"],
  serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1, charge: 2015 }],
};

const attachments = [
  { id: "doc_report", fileName: "final-report.pdf", documentType: "final_report", selected: true },
  { id: "doc_pos", fileName: "proof-of-service.pdf", documentType: "proof_of_service", selected: true },
];

export default function App() {
  const [notice, setNotice] = useState("Review the snapshot and payer packet.");
  return <main className="review-demo">
    <p className="notice">{notice}</p>
    <BillSubmissionForm
      initialBill={initialBill}
      attachments={attachments}
      appearance={{ preset: "clinical-blue" }}
      submitLabel="Submit bill"
      onSubmit={async ({ sourceAttachmentIds, uploads }) => {
        setNotice(
          "Ready to submit " + (sourceAttachmentIds.length + uploads.length) + " documents atomically."
        );
      }}
    />
  </main>;
}`;

const submissionSectionsCode = `import {
  BillSubmissionActions,
  BillSubmissionAttachmentsSection,
  BillSubmissionClaimSection,
  BillSubmissionForm,
  BillSubmissionHeader,
  BillSubmissionPatientSection,
  BillSubmissionProvidersSection,
  BillSubmissionServiceLinesSection,
} from "@mindbill/react";

${submissionCode.slice(submissionCode.indexOf("const initialBill"), submissionCode.indexOf("export default function App"))}

export default function App() {
  return <main className="review-demo">
    <BillSubmissionForm
      initialBill={initialBill}
      attachments={attachments}
      appearance={{ preset: "orange-bright" }}
      onSubmit={async (value) => console.log("submit", value)}
    >
      <BillSubmissionHeader />
      <BillSubmissionPatientSection />
      <BillSubmissionClaimSection />
      <BillSubmissionProvidersSection />
      <BillSubmissionServiceLinesSection />
      <BillSubmissionAttachmentsSection />
      <BillSubmissionActions />
    </BillSubmissionForm>
  </main>;
}`;

const dashboardCode = `import { BillingDashboard } from "@mindbill/react";

const bills = [
  { id: "bill_1042", billNumber: 1042, patientName: "Jordan Lee", claimNumber: "WC-78142", payerName: "Republic Indemnity", state: "processed", submittedAt: "2026-05-14", totalCharge: 2015, totalPaid: 650, balanceDue: 1365 },
  { id: "bill_1041", billNumber: 1041, patientName: "Morgan Cruz", claimNumber: "WC-77908", payerName: "State Compensation Insurance Fund", state: "accepted", submittedAt: "2026-06-29", totalCharge: 2015, totalPaid: 0, balanceDue: 2015 },
  { id: "bill_1039", billNumber: 1039, patientName: "Taylor Kim", claimNumber: "WC-76881", payerName: "Sedgwick", state: "submitted", submittedAt: "2026-08-19", totalCharge: 1300, totalPaid: 0, balanceDue: 1300 },
  { id: "bill_1036", billNumber: 1036, patientName: "Alex Morgan", claimNumber: "WC-75117", payerName: "Gallagher Bassett", state: "closed", submittedAt: "2026-04-02", totalCharge: 2015, totalPaid: 2015, balanceDue: 0 },
];

export default function App() {
  return <main className="operations-demo">
    <BillingDashboard
      bills={bills}
      showSettings={false} // This synthetic demo has no authenticated settings session.
      heading="Billing operations"
      description="Search every bill and act on aging balances."
      appearance={{ preset: "orange-bright" }}
      onSelectBill={(bill) => alert("Open " + bill.id)}
    />
  </main>;
}`;

const reportCode = `import { useState } from "react";
import { BillingReport, buildBillingReportCsv } from "@mindbill/react";

const bills = [
  { id: "bill_1042", patientName: "Jordan Lee", payerName: "Republic Indemnity", state: "processed", submittedAt: "2026-05-14", totalCharge: 2015, totalPaid: 650, balanceDue: 1365 },
  { id: "bill_1041", patientName: "Morgan Cruz", payerName: "State Compensation Insurance Fund", state: "accepted", submittedAt: "2026-06-29", totalCharge: 2015, totalPaid: 0, balanceDue: 2015 },
  { id: "bill_1039", patientName: "Taylor Kim", payerName: "Sedgwick", state: "submitted", submittedAt: "2026-08-19", totalCharge: 1300, totalPaid: 0, balanceDue: 1300 },
];

export default function App() {
  const [groupBy, setGroupBy] = useState("payer");
  return <main className="operations-demo">
    <nav className="report-controls">
      <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
        <option value="payer">Payer</option><option value="status">Status</option><option value="aging">Aging</option>
      </select>
      <button onClick={() => navigator.clipboard.writeText(buildBillingReportCsv(bills, groupBy))}>Copy CSV</button>
    </nav>
    <BillingReport bills={bills} groupBy={groupBy} appearance={{ preset: "orange-bright" }} />
  </main>;
}`;

const lifecycleCode = `import {
  BillActivityTimeline,
  BillExplanationOfReview,
  BillLifecycleActions,
  BillLifecycleProgress,
  BillSnapshotSummary,
} from "@mindbill/react";

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
  remittance: {
    billedAmount: 2015, expectedAmount: 2015, payerAllowedAmount: 0,
    payerReportedPaid: 0, postedPrincipal: 0, postedAdditional: 0,
    totalPostedCash: 0, balanceDue: 2015,
    denialReason: "Medical necessity or frequency",
  },
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
    <BillLifecycleProgress {...lifecycle.lifecycle} appearance={{ preset: "orange-bright" }} />
    <BillSnapshotSummary {...lifecycle} appearance={{ preset: "orange-bright" }} />
    <BillExplanationOfReview
      remittance={lifecycle.remittance}
      eors={lifecycle.eors}
      payments={lifecycle.payments}
      submittedAt={lifecycle.lifecycle.submittedAt}
      onOpenEor={(eor) => alert("Preview " + eor.filename)}
      appearance={{ preset: "orange-bright" }}
    />
    <BillLifecycleActions actions={lifecycle.lifecycle.actions} onAction={() => {}} appearance={{ preset: "orange-bright" }} />
    <BillActivityTimeline events={lifecycle.activity} appearance={{ preset: "orange-bright" }} />
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
        billedAmount: 2015,
        expectedAmount: 2015,
        payerAllowedAmount: 650,
        payerReportedPaid: 503.75,
        postedPrincipal: 450,
        postedAdditional: 53.75,
        totalPostedCash: 503.75,
        balanceDue: 1511.25,
        denialReason: "Payment reduced pending additional documentation.",
      }}
      appearance={{ preset: "orange-bright" }}
    />
  </main>;
}`;

const explanationOfReviewCode = `import { BillExplanationOfReview } from "@mindbill/react";

const remittance = {
  billedAmount: 2015, expectedAmount: 2015, payerAllowedAmount: 650,
  payerReportedPaid: 503.75, postedPrincipal: 450, postedAdditional: 53.75,
  totalPostedCash: 503.75, balanceDue: 1511.25,
  denialReason: "Payment reduced pending additional documentation.",
};

const eors = [{
  id: "eor_1", filename: "EOR-1038.pdf", description: "Explanation of Review",
  addedAt: "2026-08-25T17:42:18Z", contentUrl: "#eor",
}];

const payments = [{
  id: "payment_1", method: "check", checkNumber: "4811505",
  status: "deposited", depositDate: "2026-08-25", checkReceived: true,
  receivedDate: "2026-08-23", amount: 503.75, principalAmount: 450,
  feeAmount: 53.75, feeReason: "Penalty and interest", source: "paper",
  postedAt: "2026-08-25T17:42:18Z", updatedAt: null, note: "Partial payment",
}];

export default function App() {
  return <main className="demo">
    <BillExplanationOfReview
      remittance={remittance}
      eors={eors}
      payments={payments}
      submittedAt="2026-08-12T17:00:00Z"
      onOpenEor={(eor) => alert("Preview " + eor.filename)}
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
  receivedDate: "2026-08-23", amount: 503.75, principalAmount: 450,
  feeAmount: 53.75, feeReason: "Penalty and interest", source: "paper", postedAt: "2026-08-25T17:42:18Z",
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

const statusGalleryCode = `import { BillStatusSummary } from "@mindbill/react";

const states = [
  ["submitted", "Sent", 0, 2015],
  ["accepted", "Accepted", 0, 2015],
  ["processed", "Processed", 503.75, 1511.25],
  ["rejected", "Rejected", 0, 2015],
  ["denied", "Denied", 0, 2015],
  ["second_review", "Second review sent", 0, 2015],
  ["closed", "Closed", 2015, 0],
];

export default function App() {
  return <main className="gallery-demo">
    {states.map(([status, label, paid, balance]) => (
      <section key={status}>
        <span className="state-label">{label}</span>
        <BillStatusSummary
          status={status}
          submittedAt="2026-08-31T16:08:00Z"
          agingDays={status === "closed" ? 18 : 4}
          totalCharge={2015}
          totalPaid={paid}
          balanceDue={balance}
          appearance={{ preset: "orange-bright" }}
        />
      </section>
    ))}
  </main>;
}`;

const fullLifecycleCode = `import { useMemo, useState } from "react";
import {
  BillActivityTimeline,
  BillExplanationOfReview,
  BillLifecycleProgress,
  BillSnapshotSummary,
} from "@mindbill/react";

${fixture}

const steps = ["submitted", "accepted", "processed", "paid", "closed"];
const labels = { submitted: "Sent", accepted: "Accepted", processed: "Processed", paid: "Payment posted", closed: "Closed" };

export default function App() {
  const [step, setStep] = useState("submitted");
  const index = steps.indexOf(step);
  const paid = step === "paid" || step === "closed" ? 2015 : 0;
  const state = step === "paid" ? "processed" : step;
  const data = useMemo(() => ({
    ...review,
    environment: "sandbox",
    bill: { ...review.bill, status: labels[step], totalPaid: paid, balanceDue: 2015 - paid },
    lifecycle: {
      state,
      nativeStatus: labels[step],
      submittedAt: "2026-08-31T16:08:00Z",
      agingDays: step === "closed" ? 18 : 4,
      updatedAt: "2026-09-04T14:30:00Z",
      actions: [],
    },
    eors: index >= 2 ? [{ id: "eor_1", filename: "EOR-1038.pdf", description: "Explanation of Review", addedAt: "2026-09-04T14:30:00Z", contentUrl: "#eor" }] : [],
    payments: paid ? [{ id: "payment_1", method: "check", checkNumber: "4811505", status: "deposited", amount: 2015, principalAmount: 2015, feeAmount: 0, feeReason: null, source: "paper", postedAt: "2026-09-06T12:15:00Z" }] : [],
    remittance: {
      billedAmount: 2015, expectedAmount: 2015,
      payerAllowedAmount: index >= 2 ? 2015 : null,
      payerReportedPaid: index >= 2 ? 2015 : null,
      postedPrincipal: paid, postedAdditional: 0,
      totalPostedCash: paid, balanceDue: 2015 - paid,
      denialReason: null,
    },
    delivery: { payerName: "Republic Indemnity", channel: "electronic", clearinghouse: "Jopari", contacts: {} },
    activity: [
      ...(step === "closed" ? [{ id: "evt_close", type: "bill.closed", createdAt: "2026-09-18T17:00:00Z", description: "Bill closed after payment was reconciled" }] : []),
      ...(paid ? [{ id: "evt_pay", type: "payment.posted", createdAt: "2026-09-06T12:15:00Z", description: "$2,015.00 payment posted" }] : []),
      ...(index >= 2 ? [{ id: "evt_eor", type: "eor.received", createdAt: "2026-09-04T14:30:00Z", description: "EOR received with full allowance" }] : []),
      ...(index >= 1 ? [{ id: "evt_accept", type: "bill.accepted", createdAt: "2026-09-01T09:16:00Z", description: "Claims administrator accepted the submission" }] : []),
      { id: "evt_submit", type: "bill.submitted", createdAt: "2026-08-31T16:08:00Z", description: "Electronically sent to Republic Indemnity" },
    ],
  }), [step, index, paid, state]);

  return <main className="journey-demo">
    <header>
      <div><small>Interactive sandbox journey</small><h1>Bill #1038</h1></div>
      <strong>{labels[step]}</strong>
    </header>
    <nav aria-label="Demo lifecycle controls">
      {steps.map((item) => <button key={item} className={item === step ? "active" : ""} onClick={() => setStep(item)}>{labels[item]}</button>)}
    </nav>
    <section className="journey-surfaces">
      <BillLifecycleProgress {...data.lifecycle} appearance={{ preset: "orange-bright" }} />
      <BillSnapshotSummary {...data} appearance={{ preset: "orange-bright" }} />
      {index >= 2 ? <BillExplanationOfReview remittance={data.remittance} eors={data.eors} payments={data.payments} submittedAt={data.lifecycle.submittedAt} onOpenEor={(eor) => alert("Preview " + eor.filename)} appearance={{ preset: "orange-bright" }} /> : null}
      <BillActivityTimeline events={data.activity} appearance={{ preset: "orange-bright" }} />
    </section>
  </main>;
}`;

// Treatment billing demos. Each one passes a synthetic `getSession` and an in-page `fetch`, so the real
// connected components run against a mock of the partner API: nothing leaves the preview.
const treatmentBillCode = `import { useState } from "react";
import { ConnectedTreatmentBillForm } from "@mindbill/react";

const address = { line1: "100 Example Way", city: "Oakland", state: "CA", postalCode: "94612" };
const initialBill = {
  externalId: "visit_demo_1", billingMode: "professional",
  patient: { firstName: "Alex", lastName: "Morgan", dateOfBirth: "1988-03-05", address },
  claim: {
    claimNumber: "WC-44871", employer: "Northstar Foods", dateOfInjury: "2026-05-30",
    claimsAdministrator: { id: "payer_demo", name: "Example Claims Administrator" },
  },
  service: { date: "2026-10-08" },
  billingProvider: { name: "Example Spine Group", taxId: "123456789", npi: "1234567890", phone: "5105550100", address },
  renderingProvider: { name: "Sam Example, D.C.", npi: "1098765432", taxonomy: "111N00000X" },
  serviceLocation: { name: "Example Office", placeOfServiceCode: "11", address },
  diagnoses: ["M54.50"],
  serviceLines: [
    { code: "99213", modifiers: ["25"], units: 1, charge: 180, serviceDate: "2026-10-08", diagnosisPointers: [1] },
    { code: "97110", units: 2, charge: 120, serviceDate: "2026-10-08", diagnosisPointers: [1] },
    { code: "97014", units: 1, charge: 40, serviceDate: "2026-10-08", diagnosisPointers: [1] },
  ],
};

// Mock of POST /partner/v2/fee-quotes/encounter with a tiny synthetic fee table (cents per unit).
const fees = { "99213": 9000, "97110": 4650, "97140": 4200, "98941": 5400 };
function quote(body) {
  const lines = body.lines.map((line) => {
    if (line.code === "97014") return { id: line.id, assessment: "not_separately_payable", findings: [], displayNotes: ["97014 is not payable under the California schedule; bill G0283 or omit."], quote: { status: "not_separately_payable", reason: "code_not_payable", provenance: [] } };
    const unit = fees[line.code];
    if (!unit) return { id: line.id, assessment: "requires_review", findings: [], displayNotes: ["Not in this demo's fee table."], quote: { status: "requires_review", reason: "fee_schedule_code_not_found", provenance: [] } };
    const amountCents = unit * (line.units || 1);
    const notes = line.code === "99213" && line.modifiers?.includes("25") ? ["Modifier 25: document a separately identifiable visit."] : [];
    return { id: line.id, assessment: "priced", findings: [], displayNotes: notes, quote: { status: "priced", amountCents, scheduleMaximumCents: amountCents, basis: "ca_physician_rbrvs", notes: [], provenance: [], ...(line.chargeCents ? { chargeAmountCents: line.chargeCents } : {}) } };
  });
  const priced = lines.filter((line) => line.assessment === "priced");
  const review = lines.filter((line) => line.assessment === "requires_review").length;
  const subtotal = priced.reduce((sum, line) => sum + line.quote.amountCents, 0);
  return {
    status: review ? "requires_review" : "priced", lines,
    totals: { submittedChargeCents: body.lines.reduce((sum, line) => sum + (line.chargeCents || 0), 0), pricedSubtotalCents: subtotal, estimatedPayableCents: review ? null : subtotal, scheduleMaximumCents: review ? null : subtotal, reviewLineCount: review },
    claimEdits: [], limitations: [], medicalLegalLineIds: [], visitNotes: ["Therapy visit 3 of 24 (LC 4604.5)"],
  };
}
// Mock of POST/PATCH /partner/v2/bill-drafts: keeps one draft in memory and bumps its revision per save.
let savedDraft = null;
function saveDraft(method, body) {
  const now = new Date().toISOString();
  savedDraft = {
    id: "billdraft_demo", externalId: body.externalId ?? savedDraft?.externalId ?? null, status: "draft",
    revision: method === "POST" ? 1 : savedDraft.revision + 1, claimId: null, patientId: null,
    bill: body.bill, encounter: body.encounter ?? savedDraft?.encounter ?? null,
    serviceLineCount: (body.bill.serviceLines || []).length, submittedBillId: null,
    createdAt: savedDraft?.createdAt ?? now, updatedAt: now, submittedAt: null,
  };
  return savedDraft;
}
async function mockApi(input, init = {}) {
  const url = new URL(String(input), location.href);
  if (url.pathname.endsWith("/partner/v2/fee-quotes/encounter")) return Response.json({ data: quote(JSON.parse(init.body)) });
  if (url.pathname.includes("/partner/v2/bill-drafts") && (init.method === "POST" || init.method === "PATCH")) {
    return Response.json({ data: saveDraft(init.method, JSON.parse(init.body)) }, { status: init.method === "POST" ? 201 : 200 });
  }
  return Response.json({ data: [] });
}

export default function App() {
  const [total, setTotal] = useState(null);
  const [draft, setDraft] = useState(null);
  return <main className="review-demo">
    <p className="notice">Expected payment for this visit: {total == null ? "needs review" : "$" + (total / 100).toFixed(2)}</p>
    {draft ? <p className="notice">Draft {draft.id} saved, revision {draft.revision}. Nothing was sent.</p> : null}
    <ConnectedTreatmentBillForm
      getSession={async () => ({ token: "demo_session" })}
      fetch={mockApi}
      initialBill={initialBill}
      encounter={{ renderingProviderId: "rp_demo", placeOfServiceId: "loc_demo", claimId: "claim_demo" }}
      onEncounterQuote={(estimate) => setTotal(estimate?.totals.estimatedPayableCents ?? null)}
      drafts
      draftExternalId="visit_demo_1"
      onDraftSaved={setDraft}
      deliveryRoutePicker="off"
      appearance={{ preset: "mindbill" }}
      onSubmit={async () => alert("The demo submits nothing.")}
    />
  </main>;
}`;

const rfaRecordsFixture = `const item = (id, service, code, outcome, extra = {}) => ({
  id, diagnosisCode: "M54.50", serviceDescription: service, procedureCode: code,
  frequency: "2x/week", duration: "4 weeks", outcome, quantity: 8, units: null,
  authorizationNumber: outcome === "approved" || outcome === "modified" ? "DEMO-AUTH-" + id : null,
  decisionReason: null, decidedAt: outcome === "pending" ? null : "2026-09-10T17:00:00Z", ...extra,
});
const rfa = (id, status, lifecycleStatus, provider, created, submitted, items, extra = {}) => ({
  id, status, lifecycleStatus, renderingProviderId: "rp_" + provider.length, providerName: provider,
  expedited: false, requestType: "initial", contentRevision: 1, claimId: "claim_demo", patientId: "patient_demo",
  claimsAdminId: null, employeeName: "Alex Morgan", claimNumber: "WC-44871", reviewType: "prospective",
  createdAt: created, updatedAt: created, signedAt: submitted, submittedAt: submitted, receivedAt: null,
  decisionDueAt: submitted ? "2026-09-20T00:00:00Z" : null, decisionDeadlineBasis: null,
  incompleteReason: null, deferredReason: null, closedReason: null,
  readiness: { ready: true, missing: [] }, items, documents: [], ...extra,
});
const rfas = [
  rfa("rfa_5f2c91aa01", "approved", "closed", "Morgan Chen, MD", "2026-08-20T10:00:00Z", "2026-08-21T10:00:00Z", [
    item("a1", "Physical therapy, lumbar spine", "97110", "approved"),
    item("a2", "Lumbar MRI without contrast", "72148", "denied"),
  ]),
  rfa("rfa_7b13e0cc02", "submitted", "sent", "Riley Park, DO", "2026-09-12T10:00:00Z", "2026-09-13T10:00:00Z", [
    item("b1", "Chiropractic manipulative treatment, spinal, 3-4 regions", "98941", "pending"),
  ], { expedited: true }),
  rfa("rfa_9d44a1ee03", "draft", "incomplete", "Morgan Chen, MD", "2026-09-15T10:00:00Z", null, [
    item("c1", "Acupuncture, 1 or more needles", "97810", "pending"),
  ]),
];
const related = { claimId: "claim_demo", hasMore: false, data: [
  { id: "bill_1042", label: "Bill #1042", treatments: ["Physical therapy, lumbar spine"], relationship: "Linked authorization", status: "submitted", serviceDate: "2026-09-12" },
  { id: "bill_1031", label: "Bill #1031", treatments: ["Office visit, established patient"], relationship: "Same injury", status: "paid", serviceDate: "2026-08-30" },
] };
const decisions = { editable: true,
  linked: [
    { rfaId: "rfa_5f2c91aa01", rfaItemId: "a1", service: "Physical therapy, lumbar spine", form: { state: "attached" }, decision: { state: "attached", authorizationNumber: "DEMO-AUTH-a1" } },
  ],
  decisions: [
    { documentId: "doc_1", rfaId: "rfa_5f2c91aa01", filename: "ur-decision.pdf", decidedAt: "2026-09-10T17:00:00Z", attached: false, matchesBill: true, treatments: [
      { service: "Physical therapy, lumbar spine", code: "97110", outcome: "approved", authorizationNumber: "DEMO-AUTH-a1", effectiveFrom: "2026-09-10", effectiveTo: "2026-10-10" },
      { service: "Lumbar MRI without contrast", code: "72148", outcome: "denied", authorizationNumber: null, effectiveFrom: null, effectiveTo: null },
    ] },
    { documentId: "doc_2", rfaId: "rfa_7b13e0cc02", filename: "ur-decision-2.pdf", decidedAt: null, attached: true, matchesBill: false, treatments: [
      { service: "Office visit", code: "99213", outcome: "modified", authorizationNumber: "DEMO-AUTH-x", effectiveFrom: "2026-09-01", effectiveTo: "2026-09-30" },
    ] },
  ] };

// Mock of the partner API routes these components call through a browser session.
async function mockApi(input, init = {}) {
  const path = new URL(String(input), location.href).pathname;
  if ((init.method || "GET") !== "GET") return Response.json({ data: { attached: 1 } });
  if (path.endsWith("/rfas/related")) return Response.json(related);
  if (path.endsWith("/ur-decisions")) return Response.json({ data: decisions });
  if (path.endsWith("/rfas")) return Response.json({ data: rfas, nextCursor: null, summary: { total: rfas.length, byStatus: {} } });
  return Response.json({ error: { message: "Not in this demo: " + path } }, { status: 404 });
}
const session = { getSession: async () => ({ token: "demo_session" }), fetch: mockApi, appearance: { preset: "mindbill" } };`;

const rfaClaimIndexCode = `import { RfaClaimIndex } from "@mindbill/react";

${rfaRecordsFixture}

export default function App() {
  return <main className="review-demo">
    <RfaClaimIndex
      {...session}
      claimId="claim_demo"
      canCreate
      onCreateRfa={() => alert("Open your RFA creation page")}
      onSelectRfa={(rfaId) => alert("Open " + rfaId)}
    />
  </main>;
}`;

const relatedRecordsCode = `import { RelatedAuthorizationRecords } from "@mindbill/react";

${rfaRecordsFixture}

export default function App() {
  return <main className="review-demo">
    <RelatedAuthorizationRecords
      {...session}
      rfaId="rfa_5f2c91aa01"
      onSelectBill={(billId) => alert("Open " + billId)}
      getClaimHref={(claimId) => "#" + claimId}
    />
  </main>;
}`;

const billUrDecisionsCode = `import { useState } from "react";
import { BillUrDecisions } from "@mindbill/react";

${rfaRecordsFixture}

export default function App() {
  const [message, setMessage] = useState("Select a decision letter to attach to this unsent bill.");
  return <main className="review-demo">
    <p className="notice">{message}</p>
    <BillUrDecisions
      {...session}
      billId="bill_1042"
      canEdit
      openDocument={(decision) => setMessage("Preview " + decision.filename)}
      onSelectRfa={(rfaId) => setMessage("Open " + rfaId)}
      onAttached={(result) => setMessage("Attached " + result.attached + " document. Nothing was sent.")}
    />
  </main>;
}`;

const demoCss = `body { margin: 0; background: #f5f8f9; }
.demo { padding: 24px; max-width: 760px; margin: 0 auto; font-family: Inter, system-ui, sans-serif; color: #203743; }
.demo > p, .notice { color: #657982; }
.review-demo { width: 100%; min-width: 0; padding: 18px; font-family: Inter, system-ui, sans-serif; }
.operations-demo { padding: 24px; font-family: Inter, system-ui, sans-serif; }
.report-controls { display: flex; justify-content: flex-end; gap: 8px; margin: 0 0 12px; }
.report-controls select, .report-controls button { min-height: 42px; border: 1px solid #e4d5ca; border-radius: 9px; padding: 8px 12px; background: white; color: #352a24; font: inherit; font-weight: 700; }
.notice { margin: 0 0 12px; padding: 10px 12px; border: 1px solid #dbe6ea; border-radius: 8px; background: white; }
.error { color: #b42318 !important; }
.gallery-demo { display: grid; gap: 18px; padding: 24px; background: #fffaf6; font-family: Inter, system-ui, sans-serif; }
.gallery-demo section { position: relative; }
.state-label { display: inline-block; margin: 0 0 8px 4px; color: #9c3b09; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.journey-demo { padding: 24px; background: #fffaf6; color: #090f1f; font-family: Inter, system-ui, sans-serif; }
.journey-demo > header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 auto 16px; max-width: 1040px; }
.journey-demo h1 { margin: 3px 0 0; font-size: 30px; }
.journey-demo small { color: #9c3b09; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.journey-demo > header > strong { padding: 8px 13px; border-radius: 999px; background: #ffeadf; color: #a33700; }
.journey-demo > nav { display: flex; flex-wrap: wrap; gap: 8px; max-width: 1040px; margin: 0 auto 20px; }
.journey-demo > nav button { border: 1px solid #e4d5ca; border-radius: 999px; padding: 9px 14px; background: white; color: #4d443f; font: inherit; font-weight: 700; cursor: pointer; }
.journey-demo > nav button.active { border-color: #f4510b; background: #f4510b; color: white; }
.review-demo, .journey-surfaces { display: grid; gap: 16px; }
.journey-surfaces { max-width: 1040px; margin: 0 auto; }
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
        customSetup={{ dependencies: { "@mindbill/react": sdkVersions.react, "@mindbill/browser": sdkVersions.browser } }}
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

export function ExplanationOfReviewPlayground() {
  return <ComponentPlayground name="BillExplanationOfReview" code={explanationOfReviewCode} height={680} />;
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

export function SubmissionFormPlayground() {
  return <ComponentPlayground name="BillSubmissionForm" code={submissionCode} height={760} />;
}

export function SubmissionSectionsPlayground() {
  return <ComponentPlayground name="Composable submission sections" code={submissionSectionsCode} height={760} />;
}

export function BillingDashboardPlayground() {
  return <ComponentPlayground name="BillingDashboard" code={dashboardCode} height={760} label="Synthetic receivables · search and filter" />;
}

export function BillingReportPlayground() {
  return <ComponentPlayground name="BillingReport" code={reportCode} height={650} label="Synthetic reporting · group and export" />;
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

export function StatusGalleryPlayground() {
  return <ComponentPlayground name="Lifecycle status gallery" code={statusGalleryCode} height={760} label="Seven synthetic states · edit and run" />;
}

export function FullLifecyclePlayground() {
  return <ComponentPlayground name="Complete bill journey" code={fullLifecycleCode} height={820} label="Mocked sandbox API · click each lifecycle state" />;
}

export function TreatmentBillPlayground() {
  return <ComponentPlayground name="ConnectedTreatmentBillForm" code={treatmentBillCode} height={760} label="Mocked encounter quote and drafts · edit lines, save a draft" />;
}

export function RfaClaimIndexPlayground() {
  return <ComponentPlayground name="RfaClaimIndex" code={rfaClaimIndexCode} height={640} label="Mocked RFA list · synthetic claim" />;
}

export function RelatedRecordsPlayground() {
  return <ComponentPlayground name="RelatedAuthorizationRecords" code={relatedRecordsCode} height={560} label="Mocked related records · synthetic claim" />;
}

export function BillUrDecisionsPlayground() {
  return <ComponentPlayground name="BillUrDecisions" code={billUrDecisionsCode} height={640} label="Mocked UR decisions · nothing is sent" />;
}
