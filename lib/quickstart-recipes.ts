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

export const dashboardAngular = `import { Component, inject, signal, type OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MindBillBillingDashboardComponent } from "@mindbill/angular";
import type { MindBillDashboardBill } from "@mindbill/angular";
import { loadDashboardBills } from "./load-dashboard";

@Component({
  selector: "app-billing",
  standalone: true,
  imports: [MindBillBillingDashboardComponent],
  template: \`
    @if (loading()) {
      <p role="status">Loading bills…</p>
    } @else if (error()) {
      <p role="alert">{{ error() }}</p>
      <button type="button" (click)="load()">Try again</button>
    } @else {
      <mindbill-billing-dashboard [bills]="bills()"
        (billSelected)="openBill($event.id)" (createBill)="createBill()" />
    }
  \`,
})
export class BillingComponent implements OnInit {
  private readonly router = inject(Router);
  readonly bills = signal<MindBillDashboardBill[]>([]);
  readonly loading = signal(true);
  readonly error = signal("");

  ngOnInit() { void this.load(); }
  async load() {
    this.loading.set(true);
    this.error.set("");
    try { this.bills.set(await loadDashboardBills()); }
    catch { this.error.set("Could not load bills. Check your billing session and try again."); }
    finally { this.loading.set(false); }
  }
  openBill(id: string) {
    void this.router.navigate(["/billing", id]);
  }
  createBill() { void this.router.navigate(["/billing/new"]); }
}`;

export const angularBillPage = `import { Component, Input } from "@angular/core";
import { MindBillBillLifecycleComponent } from "@mindbill/angular";

@Component({
  selector: "app-bill",
  standalone: true,
  imports: [MindBillBillLifecycleComponent],
  template: \`<mindbill-bill-lifecycle [billId]="id"
    sessionEndpoint="/api/mindbill/session" />\`,
})
export class BillComponent {
  @Input({ required: true }) id!: string;
}`;

export const angularRoutes = `import type { Routes } from "@angular/router";
import { BillingComponent } from "./billing.component";
import { NewBillComponent } from "./new-bill.component";
import { BillComponent } from "./bill.component";

export const routes: Routes = [
  { path: "billing", component: BillingComponent },
  { path: "billing/new", component: NewBillComponent },
  // Add other named billing routes before the :id route.
  { path: "billing/:id", component: BillComponent },
];`;

export const angularRouterConfig = `import type { ApplicationConfig } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    // Keep your existing application providers.
    provideRouter(routes, withComponentInputBinding()),
  ],
};`;

export const angularRouterOutlet = `import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: \`<router-outlet />\`,
})
export class AppComponent {}`;

export const angularBootstrap = `import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

bootstrapApplication(AppComponent, appConfig).catch(console.error);`;

export const angularProxy = `{
  "/api/**": {
    "target": "http://localhost:3000",
    "changeOrigin": false
  }
}`;

export const settingsReact = `"use client";
import { BillingSettings } from "@mindbill/react";

export default function BillingSettingsPage() {
  return <BillingSettings
    sessionEndpoint="/api/mindbill/settings-session"
  />;
}`;

export const settingsAngular = `import { Component } from "@angular/core";
import { MindBillOrganizationOnboardingComponent } from "@mindbill/angular";

@Component({
  selector: "app-billing-settings",
  standalone: true,
  imports: [MindBillOrganizationOnboardingComponent],
  template: \`<mindbill-organization-onboarding
    variant="settings"
    sessionEndpoint="/api/mindbill/settings-session"
  />\`,
})
export class BillingSettingsComponent {}`;
