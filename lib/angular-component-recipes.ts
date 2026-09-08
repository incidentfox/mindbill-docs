export const angularAttachments = `import type { MindBillSubmissionAttachment } from "@mindbill/angular";

// Supply these as [attachments] on mindbill-bill-submission.
// This is your existing authenticated document endpoint.
const attachments: MindBillSubmissionAttachment[] = [{
  filename: "final-report.pdf",
  documentType: "final_report",
  locked: true,
  loadBlob: async () => {
    const response = await fetch("/api/documents/report_demo_001", {
      credentials: "same-origin", cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load finalized report");
    return response.blob();
  },
}];`;

export const angularCustomLifecycle = `import { Component, Input, OnChanges, OnDestroy, inject } from "@angular/core";
import { MindBillLifecycleStore } from "@mindbill/angular";

@Component({
  selector: "app-billing-status",
  standalone: true,
  providers: [MindBillLifecycleStore], // One store per bill view.
  template: \`
    @if (store.loading()) { <p role="status">Loading bill…</p> }
    @if (store.error()) { <p role="alert">Could not load billing status.</p> }
    <button type="button" (click)="refresh()" [disabled]="store.loading()">
      Refresh status
    </button>
    <!-- Render your layout from store.data() after checking it is available. -->
  \`,
})
export class BillingStatusComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) billId = "";
  readonly store = inject(MindBillLifecycleStore);
  ngOnChanges() {
    this.store.disconnect();
    if (this.billId) this.store.connect({
      billId: this.billId,
      sessionEndpoint: \`/api/mindbill/bills/\${encodeURIComponent(this.billId)}/session\`,
    });
  }
  async refresh() {
    try { await this.store.refresh(); } catch { /* store.error supplies feedback */ }
  }
  ngOnDestroy() { this.store.disconnect(); }
}`;

export const angularOperations = `import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  MindBillBillingDashboardComponent,
  MindBillBillingReportComponent,
  MindBillBillingManagementButtonComponent,
  type MindBillDashboardBill, type MindBillAngularAppearance,
} from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [
    MindBillBillingDashboardComponent,
    MindBillBillingReportComponent,
    MindBillBillingManagementButtonComponent,
  ],
  template: \`
    <mindbill-billing-dashboard
      [bills]="bills"
      [appearance]="appearance"
      (billSelected)="billSelected.emit($event)"
      (createBill)="createBill.emit()"
    />

    <mindbill-billing-report [bills]="bills" [appearance]="appearance" />

    <mindbill-billing-management-button
      sessionEndpoint="/api/mindbill/management-session"
      [appearance]="appearance"
      label="View details in MindBill"
    />
  \`,
})
export class BillingOperationsComponent {
  @Output() createBill = new EventEmitter<void>();
  @Input({ required: true }) bills: MindBillDashboardBill[] = [];
  @Output() billSelected = new EventEmitter<MindBillDashboardBill>();
  appearance: MindBillAngularAppearance = { preset: "clinical-blue" };
}`;

export const angularMatrix = `import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  MindBillBillListComponent,
  MindBillStatusAgingMatrixComponent,
  type MindBillStatusAgingCell, type MindBillDashboardBill, type MindBillAngularAppearance,
} from "@mindbill/angular";

@Component({
  standalone: true,
  imports: [MindBillStatusAgingMatrixComponent, MindBillBillListComponent],
  template: \`
    <mindbill-status-aging-matrix
      [bills]="bills"
      [appearance]="appearance"
      (cellSelected)="cell = $event"
    />

    @if (cell) {
      <mindbill-bill-list
        [bills]="cell.bills"
        [appearance]="appearance"
        (billSelected)="billSelected.emit($event)"
      />
    }
  \`,
})
export class BillingMatrixComponent {
  cell: MindBillStatusAgingCell | null = null;
  @Input({ required: true }) bills: MindBillDashboardBill[] = [];
  @Output() billSelected = new EventEmitter<MindBillDashboardBill>();
  appearance: MindBillAngularAppearance = { preset: "clinical-blue" };
}`;

