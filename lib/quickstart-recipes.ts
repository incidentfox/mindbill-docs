export const singleBillReact = `"use client";
import { useMemo, useState } from "react";
import {
  BillSubmissionForm, ConnectedBillLifecycle,
  type BillSubmissionInput,
} from "@mindbill/react";
import { syncBillLink } from "./sync-bill-link";
import "@mindbill/react/styles.css";

export default function WorkItemBill({ workItemId, initialBillId, initialBill }: {
  workItemId: string;
  initialBillId: string | null; // Loaded by your backend before rendering.
  initialBill: BillSubmissionInput;
}) {
  const [billId, setBillId] = useState(initialBillId);
  const [saveError, setSaveError] = useState(false);
  const billInput = useMemo(
    () => ({ ...initialBill, externalId: workItemId }), [initialBill, workItemId],
  );
  async function saveLink() {
    try { await syncBillLink(workItemId); setSaveError(false); }
    catch { setSaveError(true); }
  }
  return <>
    {saveError && <p role="alert">
      Bill submitted. Saving the link to your app failed.
      <button onClick={() => void saveLink()}>Retry saving link</button>
    </p>}
    {billId ? <ConnectedBillLifecycle
      billId={billId} sessionEndpoint="/api/mindbill/session"
    /> : <BillSubmissionForm
      initialBill={billInput}
      sessionEndpoint="/api/mindbill/session"
      onSubmitted={({ billId: submittedId }) => {
        setBillId(submittedId); // Switch views immediately; do not submit again.
        void saveLink(); // Your backend verifies and saves the association.
      }}
    />}
  </>;
}`;

export const singleBillAngular = `import { Component, Input, OnChanges } from "@angular/core";
import {
  MindBillBillLifecycleComponent, MindBillBillSubmissionComponent,
  type BrowserBillCreateInput,
} from "@mindbill/angular";
import { syncBillLink } from "./sync-bill-link";

@Component({
  selector: "app-work-item-bill",
  standalone: true,
  imports: [MindBillBillLifecycleComponent, MindBillBillSubmissionComponent],
  template: \`
    @if (saveError) {
      <p role="alert">Bill submitted. Saving the link to your app failed.
        <button (click)="saveLink()">Retry saving link</button>
      </p>
    }
    @if (billId) {
      <mindbill-bill-lifecycle [billId]="billId"
        sessionEndpoint="/api/mindbill/session" />
    } @else {
      <mindbill-bill-submission [initialBill]="billInput"
        sessionEndpoint="/api/mindbill/session"
        (submitted)="onSubmitted($event.bill.id)" />
    }
  \`,
})
export class WorkItemBillComponent implements OnChanges {
  @Input({ required: true }) workItemId!: string;
  @Input({ required: true }) billId!: string | null; // Load before mounting.
  @Input({ required: true }) initialBill!: BrowserBillCreateInput;
  saveError = false;
  billInput!: BrowserBillCreateInput;
  ngOnChanges() {
    this.billInput = { ...this.initialBill, externalId: this.workItemId };
  }
  onSubmitted(id: string) {
    this.billId = id;
    void this.saveLink();
  }
  async saveLink() {
    try { await syncBillLink(this.workItemId); this.saveError = false; }
    catch { this.saveError = true; }
  }
}`;

export const syncBillLink = `// Frontend helper, shared by the React and Angular examples.
// This calls YOUR route below, using your existing app login.
export async function syncBillLink(workItemId: string): Promise<string> {
  const response = await fetch(
    \`/api/work-items/\${encodeURIComponent(workItemId)}/mindbill\`,
    { method: "POST", credentials: "same-origin" },
  );
  if (!response.ok) throw new Error("Could not save the bill link.");
  const { billId } = await response.json();
  if (!billId) throw new Error("Submitted bill not found yet. Retry saving.");
  return billId;
}`;

export const resolveBillLink = `// Server only. These adapters belong to YOUR app; they are not SDK exports.
import {
  requireAuthorizedWorkItem, mindbillForOrganization, saveBillIdIfAbsent,
} from "./your-app";

export async function resolveBillLink(request: Request, workItemId: string) {
  // Verify the signed-in user can bill this item. Read organizationId and
  // mindbillBillId from your database, never from the request body.
  const item = await requireAuthorizedWorkItem(request, workItemId);
  if (item.mindbillBillId) return item.mindbillBillId;

  // Return a server MindBillClient using this organization's API key.
  const mindbill = await mindbillForOrganization(item.organizationId);
  const matches = await mindbill.listBills({ externalId: item.id, limit: 2 });
  if (matches.data.length > 1 || matches.nextCursor) {
    throw new Error("Multiple bills match. Resolve the association explicitly.");
  }
  if (!matches.data.length) return null; // Confirmed absence, not a failed lookup.

  const billId = matches.data[0].id;
  // Atomically save in existing metadata, scoped to organization + item.
  // Accept the same ID on retry; reject a different existing ID.
  await saveBillIdIfAbsent(item.organizationId, item.id, billId);
  return billId;
}`;

export const billLinkRoute = `// Next.js example: app/api/work-items/[id]/mindbill/route.ts
import { resolveBillLink } from "@/lib/resolve-bill-link";

export async function POST(request: Request, context: {
  params: Promise<{ id: string }>;
}) {
  if (!process.env.APP_ORIGIN ||
      request.headers.get("origin") !== process.env.APP_ORIGIN) {
    return new Response("Forbidden", { status: 403 });
  }
  try {
    const { id } = await context.params;
    const billId = await resolveBillLink(request, id);
    return Response.json({ billId }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Could not resolve bill link", { status: 409 });
  }
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
