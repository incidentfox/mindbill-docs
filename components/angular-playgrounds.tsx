"use client";

import { AngularPlayground } from "@/components/angular-playground";

const DEMO_ORIGIN =
  process.env.NEXT_PUBLIC_ANGULAR_DEMO_ORIGIN ?? "https://codexangular-clinical-demo.vercel.app";

const appearance = { preset: "clinical-blue" };

const bills = [
  { id: "b1", billNumber: 2048, patientName: "Jordan Rivera", claimNumber: "LH-CA-804219", payerName: "Northwind Claims", state: "processed", agingDays: 12, totalCharge: 2015, totalPaid: 650, balanceDue: 1365 },
  { id: "b2", billNumber: 2047, patientName: "Casey Morgan", claimNumber: "LH-CA-804188", payerName: "CorVel", state: "accepted", agingDays: 27, totalCharge: 1499.25, totalPaid: 0, balanceDue: 1499.25 },
  { id: "b3", billNumber: 2046, patientName: "Taylor Chen", claimNumber: "LH-CA-804103", payerName: "Sedgwick", state: "sent", agingDays: 38, totalCharge: 2015, totalPaid: 0, balanceDue: 2015 },
  { id: "b4", billNumber: 2045, patientName: "Avery Thompson", claimNumber: "LH-CA-803992", payerName: "Gallagher Bassett", state: "processed", agingDays: 54, totalCharge: 763.75, totalPaid: 500, balanceDue: 263.75 },
  { id: "b5", billNumber: 2044, patientName: "Morgan Lee", claimNumber: "LH-CA-803877", payerName: "State Fund", state: "denied", agingDays: 68, totalCharge: 2015, totalPaid: 0, balanceDue: 2015 },
  { id: "b6", billNumber: 2043, patientName: "Jamie Patel", claimNumber: "LH-CA-803741", payerName: "Zurich", state: "processed", agingDays: 93, totalCharge: 4030, totalPaid: 2015, balanceDue: 2015 },
  { id: "b7", billNumber: 2042, patientName: "Riley Davis", claimNumber: "LH-CA-803625", payerName: "AmTrust", state: "closed", agingDays: 102, totalCharge: 2015, totalPaid: 2015, balanceDue: 0 },
];

const matrixCode = `import { MindBillStatusAgingMatrixComponent } from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [MindBillStatusAgingMatrixComponent],
  template: \`
    <mindbill-status-aging-matrix
      [bills]="bills"
      [appearance]="{ preset: 'clinical-blue' }"
      (cellSelected)="openDrillDown($event)"
    />
  \`,
})
export class BillingMatrixComponent {
  bills = loadBillSummaries(); // same rows the dashboard uses
  openDrillDown(cell: MindBillStatusAgingCell) {
    // cell = { state, bucket, count, balance, bills }
  }
}`;

export function MatrixAngularPlayground() {
  return (
    <AngularPlayground
      name="MindBillStatusAgingMatrixComponent"
      tag="mindbill-status-aging-matrix"
      code={matrixCode}
      height={620}
      props={{ bills, appearance }}
      events={{ cellSelected: (detail) => console.info("cellSelected", detail) }}
    />
  );
}

const dashboardCode = `import { MindBillBillingDashboardComponent } from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [MindBillBillingDashboardComponent],
  template: \`
    <mindbill-billing-dashboard
      [bills]="bills"
      [appearance]="{ preset: 'clinical-blue' }"
      (billSelected)="openBill($event)"
      (createBill)="startNewBill()"
    />
  \`,
})
export class BillingDashboardComponent {
  bills = loadBillSummaries();
}`;

export function DashboardAngularPlayground() {
  return (
    <AngularPlayground
      name="MindBillBillingDashboardComponent"
      tag="mindbill-billing-dashboard"
      code={dashboardCode}
      height={720}
      props={{ bills, appearance }}
      events={{ billSelected: (detail) => console.info("billSelected", detail) }}
    />
  );
}

const submissionCode = `import { MindBillBillSubmissionComponent } from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [MindBillBillSubmissionComponent],
  template: \`
    <mindbill-bill-submission
      [initialBill]="initialBill"
      [attachments]="attachments"
      sessionEndpoint="/api/mindbill/session"
      [appearance]="{ preset: 'clinical-blue' }"
      (submitted)="billId = $event.bill.id"
    />
  \`,
})
export class CaseBillingComponent {
  initialBill = caseToMindBillInput(this.case);
  attachments = [
    { filename: "report.pdf", documentType: "final_report", locked: true },
    { filename: "practice-w9.pdf", documentType: "w9", locked: true },
  ];
}`;

const submissionInitialBill = {
  externalId: "docs-playground-case",
  billingMode: "med_legal",
  patient: {
    externalId: "patient-docs-1",
    firstName: "Jordan",
    lastName: "Rivera",
    dateOfBirth: "02/14/1984",
    phone: "(415) 555-0142",
    address: { line1: "1048 Mission Street", city: "San Francisco", state: "CA", postalCode: "94103" },
  },
  claim: {
    externalId: "claim-docs-1",
    claimNumber: "LH-CA-804219",
    employer: "Northwind Transit",
    dateOfInjury: "11/04/2025",
    injuryState: "CA",
    description: "Right wrist injury",
    claimsAdministrator: { id: "payer_sedgwick", name: "Sedgwick Claims Management Services" },
  },
  service: { date: "08/21/2026" },
  billingProvider: {
    name: "Long Health Medical Group",
    taxId: "94-1234567",
    npi: "1841763902",
    phone: "(415) 555-0186",
    address: { line1: "450 Mission Street, Suite 800", city: "San Francisco", state: "CA", postalCode: "94105" },
  },
  renderingProvider: { name: "Dr. Maya Chen", npi: "1932487610", taxonomy: "2083X0100X" },
  serviceLocation: {
    address: { line1: "450 Mission Street, Suite 820", city: "San Francisco", state: "CA", postalCode: "94105" },
    placeOfServiceCode: "11",
  },
  diagnoses: ["S63.501A"],
  serviceLines: [{ code: "ML201", modifiers: ["95"], units: 1 }],
};

const submissionAttachments = [
  {
    externalId: "docs-report",
    filename: "Rivera_Jordan_IME_report.pdf",
    description: "Final report — auto-attached",
    documentType: "final_report",
    contentBase64: "JVBERi0xLjQKJSBzeW50aGV0aWMgZGVtbyBQREYKJSVFT0YK",
    locked: true,
  },
  {
    externalId: "docs-w9",
    filename: "practice-w9.pdf",
    description: "Practice W-9 — auto-attached",
    documentType: "w9",
    contentBase64: "JVBERi0xLjQKJSBzeW50aGV0aWMgZGVtbyBQREYKJSVFT0YK",
    locked: true,
  },
];

export function SubmissionAngularPlayground() {
  return (
    <AngularPlayground
      name="MindBillBillSubmissionComponent"
      tag="mindbill-bill-submission"
      code={submissionCode}
      height={900}
      label="Live form · payer, ICD-10, and ZIP lookups hit the sandbox gateway"
      props={{
        initialBill: submissionInitialBill,
        attachments: submissionAttachments,
        appearance,
        sessionEndpoint: `${DEMO_ORIGIN}/api/mindbill/bill-session`,
        apiBaseUrl: `${DEMO_ORIGIN}/api`,
        submitter: async () => ({
          billId: "bill_demo_2048",
          bill: { id: "bill_demo_2048", externalId: "docs-playground-case", state: "sent" },
        }),
      }}
      events={{ submitted: (detail) => console.info("submitted", detail) }}
    />
  );
}

const managementCode = `import { MindBillBillingManagementButtonComponent } from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [MindBillBillingManagementButtonComponent],
  template: \`
    <mindbill-billing-management-button
      sessionEndpoint="/api/mindbill/management-session"
      [appearance]="{ preset: 'clinical-blue' }"
    />
  \`,
})
export class BillingManagementComponent {}`;

export function ManagementButtonAngularPlayground() {
  return (
    <AngularPlayground
      name="MindBillBillingManagementButtonComponent"
      tag="mindbill-billing-management-button"
      code={managementCode}
      height={200}
      label="Live button · opens a synthetic management session"
      props={{
        appearance,
        sessionProvider: async () => ({ url: `${DEMO_ORIGIN}/management-demo.html` }),
      }}
    />
  );
}
