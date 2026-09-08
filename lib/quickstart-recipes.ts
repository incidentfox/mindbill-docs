export const singleBillReact = `"use client";
import { ConnectedBillLifecycle } from "@mindbill/react";
import "@mindbill/react/styles.css";

export default function BillPage({ billId }: { billId: string }) {
  return <ConnectedBillLifecycle
    billId={billId}
    sessionEndpoint="/api/mindbill/session"
  />;
}`;

export const singleBillAngular = `import { Component, Input } from "@angular/core";
import { MindBillBillLifecycleComponent } from "@mindbill/angular";

@Component({
  selector: "app-bill",
  standalone: true,
  imports: [MindBillBillLifecycleComponent],
  template: \`<mindbill-bill-lifecycle
    [billId]="billId"
    sessionEndpoint="/api/mindbill/session"
  />\`,
})
export class BillComponent {
  @Input({ required: true }) billId!: string;
}`;

export const dashboardReact = `"use client";
import { ConnectedBillingWorkspace } from "@mindbill/react";
import "@mindbill/react/styles.css";

export default function BillingPage() {
  return <ConnectedBillingWorkspace
    sessionEndpoint="/api/mindbill/session"
    style={{ height: "calc(100dvh - 96px)", minHeight: 0 }}
    onCreateBill={() => { window.location.href = "/billing/new"; }}
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

export const prefillReact = `"use client";
import { BillSubmissionForm, type BillSubmissionInput } from "@mindbill/react";
import "@mindbill/react/styles.css";

export default function NewBill({ initialBill }: {
  initialBill: BillSubmissionInput;
}) {
  return <BillSubmissionForm
    initialBill={initialBill}
    sessionEndpoint="/api/mindbill/session"
    onSubmitted={({ billId }) => {
      window.location.href = "/billing/" + encodeURIComponent(billId);
    }}
  />;
}`;

export const prefillAngular = `import { Component, Input } from "@angular/core";
import {
  MindBillBillSubmissionComponent,
  type BrowserBillCreateInput,
} from "@mindbill/angular";

@Component({
  selector: "app-new-bill",
  standalone: true,
  imports: [MindBillBillSubmissionComponent],
  template: \`<mindbill-bill-submission
    [initialBill]="initialBill"
    sessionEndpoint="/api/mindbill/session"
    (submitted)="openBill($event.bill.id)"
  />\`,
})
export class NewBillComponent {
  @Input({ required: true }) initialBill!: BrowserBillCreateInput;
  openBill(id: string) {
    window.location.href = "/billing/" + encodeURIComponent(id);
  }
}`;

export const settingsReact = `"use client";
import { BillingSettings } from "@mindbill/react";
import "@mindbill/react/styles.css";

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
