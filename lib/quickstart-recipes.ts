export const singleBillReact = `"use client";
import { useState } from "react";
import { BillSubmissionForm, ConnectedBillLifecycle } from "@mindbill/react";

export default function NewBillPage() {
  // TODO: Load the current report from your backend.
  const report = { id: "report_demo_001", mindbillBillId: null };
  const [billId, setBillId] = useState<string | null>(report.mindbillBillId);

  function handleSubmitted({ billId }: { billId: string }) {
    setBillId(billId);
    // TODO: Save billId on this report through your backend.
    // PATCH /api/reports/:id with { mindbillBillId: billId }
  }

  if (billId) return <ConnectedBillLifecycle
    billId={billId} sessionEndpoint="/api/mindbill/session"
  />;

  return <BillSubmissionForm
    sessionEndpoint="/api/mindbill/session"
    initialBill={{
      externalId: report.id,
      patient: {
        firstName: "", lastName: "", dateOfBirth: "",
        address: { line1: "", city: "", state: "CA", postalCode: "" },
      },
      claim: { claimNumber: "" },
      service: { date: "" },
      serviceLines: [],
    }}
    onSubmitted={handleSubmitted}
  />;
}`;

export const singleBillAngular = `import { Component } from "@angular/core";
import {
  MindBillBillLifecycleComponent, MindBillBillSubmissionComponent,
  type BrowserBillCreateInput,
} from "@mindbill/angular";

@Component({
  selector: "app-new-bill",
  standalone: true,
  imports: [MindBillBillLifecycleComponent, MindBillBillSubmissionComponent],
  template: \`
    @if (billId) {
      <mindbill-bill-lifecycle [billId]="billId"
        sessionEndpoint="/api/mindbill/session" />
    } @else {
      <mindbill-bill-submission [initialBill]="initialBill"
        sessionEndpoint="/api/mindbill/session"
        (submitted)="handleSubmitted($event.bill.id)" />
    }
  \`,
})
export class NewBillComponent {
  // TODO: Load the current report from your backend before mounting.
  report = { id: "report_demo_001", mindbillBillId: null };
  billId: string | null = this.report.mindbillBillId;
  handleSubmitted(billId: string) {
    this.billId = billId;
    // TODO: Save billId on this report through your backend.
    // PATCH /api/reports/:id with { mindbillBillId: billId }
  }
  initialBill: BrowserBillCreateInput = {
    externalId: this.report.id,
    patient: {
      firstName: "", lastName: "", dateOfBirth: "",
      address: { line1: "", city: "", state: "CA", postalCode: "" },
    },
    claim: {
      claimNumber: "", employer: "", dateOfInjury: "",
      claimsAdministrator: { id: "", name: "" },
    },
    service: { date: "" },
    billingProvider: {
      name: "", taxId: "", npi: "", phone: "",
      address: { line1: "", city: "", state: "CA", postalCode: "" },
    },
    renderingProvider: { name: "", npi: "", taxonomy: "" },
    serviceLocation: {
      address: { line1: "", city: "", state: "CA", postalCode: "" },
      placeOfServiceCode: "11",
    },
    diagnoses: [], serviceLines: [],
  };
}`;

export const findBillPage = `// app/billing/report/page.tsx — runs on your server.
import Link from "next/link";
import { ConnectedBillLifecycle } from "@mindbill/react";

export default async function ReportBillingPage() {
  // TODO: Authenticate the user and check access to this report.
  const externalId = "report_demo_001"; // Your saved report or work-item ID.
  const response = await fetch(
    \`https://app.mindbill.org/partner/v2/bills?externalId=\${encodeURIComponent(externalId)}&limit=2\`,
    {
      headers: { Authorization: \`Bearer \${process.env.MINDBILL_API_KEY}\` },
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("Could not look up the bill");
  const { data, nextCursor } = await response.json();
  if (data.length > 1 || nextCursor) {
    throw new Error("Multiple bills match; choose the intended bill");
  }

  return data[0] ? <ConnectedBillLifecycle
    billId={data[0].id} sessionEndpoint="/api/mindbill/session"
  /> : <Link href="/billing/new">Create a bill</Link>;
}`;

export const prefillBill = `// Replace initialBill in step 4 with your known values.
{
  externalId: "report_demo_001",
  patient: {
    firstName: "Taylor", lastName: "Example", dateOfBirth: "1984-04-12",
    address: {
      line1: "100 Example Avenue", city: "Los Angeles",
      state: "CA", postalCode: "90012",
    },
  },
  claim: { claimNumber: "DEMO-12345" },
  service: { date: "2026-09-08" },
  serviceLines: [{ code: "ML201", units: 1 }],
}`;

export const dashboardReact = `"use client";
import { ConnectedBillingWorkspace } from "@mindbill/react";

export default function BillingPage() {
  return <ConnectedBillingWorkspace
    sessionEndpoint="/api/mindbill/session"
    onCreateBill={() => window.location.assign("/billing/new")}
  />;
}`;

export const dashboardAngular = `import { Component, Input } from "@angular/core";
import { MindBillBillingDashboardComponent } from "@mindbill/angular";
import type { MindBillDashboardBill } from "@mindbill/angular";

@Component({
  selector: "app-billing",
  standalone: true,
  imports: [MindBillBillingDashboardComponent],
  template: \`<mindbill-billing-dashboard
    [bills]="bills"
    (billSelected)="openBill($event.id)"
    (createBill)="createBill()"
  />\`,
})
export class BillingComponent {
  @Input({ required: true }) bills!: MindBillDashboardBill[];
  openBill(id: string) {
    window.location.href = "/billing/" + encodeURIComponent(id);
  }
  createBill() { window.location.href = "/billing/new"; }
}`;

export const settingsReact = `"use client";
import { BillingSettings } from "@mindbill/react";

export default function BillingSettingsPage() {
  return <BillingSettings
    sessionEndpoint="/api/mindbill/settings-session"
  />;
}`;

export const settingsAngular = `import { Component } from "@angular/core";
import { OrganizationOnboardingComponent } from "@mindbill/angular";

@Component({
  selector: "app-billing-settings",
  standalone: true,
  imports: [OrganizationOnboardingComponent],
  template: \`<mindbill-organization-onboarding
    variant="settings"
    sessionEndpoint="/api/mindbill/settings-session"
  />\`,
})
export class BillingSettingsComponent {}`;
