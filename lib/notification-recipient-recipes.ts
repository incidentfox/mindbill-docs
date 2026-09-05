// Keep aligned with @mindbill/react's notification-recipients.md contract.
export const notificationRecipientsReact = `"use client";
import { useMemo } from "react";
import {
  NotificationRecipientsSettings,
  type NotificationRecipientsAdapter,
} from "@mindbill/react";
import "@mindbill/react/styles.css";

export function BillingRecipients({ identityKey, csrfToken }: {
  identityKey: string; // changes for admin, practice OR sandbox/live environment
  csrfToken: string;
}) {
  const adapter = useMemo<NotificationRecipientsAdapter>(() => {
    async function request(method: string, suffix = "", body?: unknown) {
      // YOUR authenticated admin route; not a MindBill browser-session endpoint.
      const response = await fetch("/api/billing/notification-recipients" + suffix, {
        method, credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) throw new Error("Notification request failed");
      return response.json(); // host returns API data, not the { data } envelope
    }
    return {
      load: offset => request("GET", "?offset=" + offset),
      invite: input => request("POST", "", input), // preserve input.requestId
      disable: async externalUserId => {
        await request("DELETE", "/" + encodeURIComponent(externalUserId));
      },
    };
  }, [identityKey, csrfToken]);
  return <NotificationRecipientsSettings identityKey={identityKey} adapter={adapter}
    appearance={{ preset: "mindbill" }} />;
}`;

export const notificationInvitationHttp = `# Server only, after host administrator, practice and audience authorization.
POST https://app.mindbill.org/partner/v2/notifications/recipients/doctor_42/invitations
Authorization: Bearer <server-only-partner-key-with-orgs:write>
X-MindBill-Org-Id: <server-resolved-managed-organization>
Content-Type: application/json

{
  "requestId": "<client-generated-UUID-preserved-on-unchanged-retries>",
  "email": "doctor@example.test",
  "audience": "assigned_bills",
  "statusUpdates": true,
  "agingDays": [30, 60, 90],
  "quietHours": true,
  "reportDigest": "off"
}

# A sent invitation is NOT an enabled subscription.
# The email owner must review and explicitly confirm the invitation.
# Do not add enabled, consent timestamps, tenant IDs or bill assignments.`;
