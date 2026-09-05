// Copyable host integration examples. The host-auth module is application-owned.
export const notificationSettingsReact = `"use client";
import { useMemo } from "react";
import {
  NotificationSettings,
  type NotificationSettingsAdapter,
  type NotificationSettingsSnapshot,
} from "@mindbill/react";

export function BillingNotificationSettings({ identityKey, csrfToken }: {
  identityKey: string; // Change when signed-in user, practice, or environment changes.
  csrfToken: string;   // Issued by your existing host CSRF protection.
}) {
  const adapter = useMemo<NotificationSettingsAdapter>(() => {
    const endpoint = "/api/mindbill/notification-settings";
    let pending: { payload: string; id: string } | null = null;
    async function request(method: string, body?: unknown, requestId?: string) {
      const response = await fetch(endpoint, {
        method, credentials: "same-origin", cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(method === "GET" ? {} : { "X-CSRF-Token": csrfToken }),
          ...(requestId ? { "X-Notification-Request-Id": requestId } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        if (response.status === 409) pending = null; // Requires a NEW checkbox confirmation.
        throw new Error("Could not confirm notification settings");
      }
      return response;
    }
    async function load(): Promise<NotificationSettingsSnapshot> {
      return (await request("GET")).json();
    }
    return {
      load,
      save: async update => {
        const payload = JSON.stringify(update);
        if (pending?.payload !== payload) pending = { payload, id: crypto.randomUUID() };
        await request(update.enabled ? "PUT" : "DELETE",
          update.enabled ? update : undefined, pending.id);
        const snapshot = await load(); // PUT is not a complete settings response.
        pending = null;
        return snapshot;
      },
      unsubscribe: async () => { pending = null; await request("DELETE"); return load(); },
    };
  }, [identityKey, csrfToken]);

  return <NotificationSettings identityKey={identityKey} adapter={adapter}
    appearance={{ preset: "calm-clinical" }} />;
}`;

export const notificationSettingsServer = `// app/api/mindbill/notification-settings/route.ts (Next.js App Router)
import "server-only";
import {
  requireNotificationAccess,
  assertHostCsrf,
  recordExplicitNotificationConsent,
  syncAuthorizedBillAssignments,
} from "@/server/notification-host-auth"; // YOUR existing auth/access/audit integration.

export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, {
  status, headers: { "Cache-Control": "no-store" },
});

function parseUpdate(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw json({}, 400);
  const x = value as Record<string, unknown>;
  const fields = ["enabled", "statusUpdates", "agingDays", "quietHours", "consent"];
  if (Object.keys(x).some(key => !fields.includes(key)) || x.enabled !== true
    || typeof x.statusUpdates !== "boolean" || typeof x.quietHours !== "boolean"
    || x.consent !== true || !Array.isArray(x.agingDays)
    || x.agingDays.some(day => ![30, 60, 90].includes(day))
    || (!x.statusUpdates && x.agingDays.length === 0)) throw json({}, 400);
  const days = x.agingDays as number[];
  return { enabled: true as const, statusUpdates: x.statusUpdates,
    agingDays: [30, 60, 90].filter(day => days.includes(day)),
    quietHours: x.quietHours };
}

async function handle(request: Request) {
  try {
    // Resolve identity, active membership, managed organization, authorized audience,
    // verified email + verification time, environment and its server key from YOUR auth.
    // No external user ID, org ID, address, audience, timestamps, or bill IDs from JSON.
    const access = await requireNotificationAccess(request);
    if (request.method !== "GET") {
      if (request.headers.get("origin") !== process.env.APP_ORIGIN) throw json({}, 403);
      await assertHostCsrf(request, access); // Verify token against this host session.
    }
    const url = "https://app.mindbill.org/partner/v2/notifications/recipients/"
      + encodeURIComponent(access.externalUserId);
    async function upstream(method: string, body?: unknown) {
      const response = await fetch(url, {
        method, cache: "no-store", signal: AbortSignal.timeout(15000),
        headers: { Authorization: "Bearer " + access.serverApiKey,
          "X-MindBill-Org-Id": access.orgId, "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      // Do not relay administrative response bodies or log addresses/credentials.
      if (!response.ok) throw json({ error: response.status === 409
        ? "fresh_consent_required" : "notification_request_failed" }, response.status);
      return (await response.json()).data;
    }

    if (request.method === "DELETE") {
      await upstream("DELETE"); // Opt-out does not require fresh consent/verification.
      return json({ ok: true });
    }
    if (request.method === "PUT") {
      const update = parseUpdate(await request.json());
      if (!access.emailVerifiedAt || !access.canEnable) throw json({}, 403);
      const state = await upstream("GET");
      if (!state.available) throw json({ error: "notifications_unavailable" }, 503);
      // Persist this REAL explicit user confirmation in your existing audit store.
      // Bind it to identity/email/audience/settings; retain its receipt for exact retries.
      // Never fabricate verification or replace a stale receipt with the current time.
      const requestId = request.headers.get("X-Notification-Request-Id");
      if (!requestId || !/^[0-9a-f-]{36}$/.test(requestId)) throw json({}, 400);
      const consent = await recordExplicitNotificationConsent(access, update, requestId);
      await upstream("PUT", { ...update, email: access.email, audience: access.audience,
        consent: { grantedAt: consent.grantedAt, version: consent.version,
          emailVerifiedAt: access.emailVerifiedAt } });
      // Reads authoritative host bill permissions, not browser choices; see below.
      if (access.audience === "assigned_bills") await syncAuthorizedBillAssignments(access);
      return json({ ok: true });
    }

    const state = await upstream("GET");
    const p = state.recipient;
    return json({ email: access.email, audience: access.audience,
      environment: access.environment,
      canEnable: state.available && access.canEnable && !!access.emailVerifiedAt,
      preferences: p ? { enabled: p.enabled, statusUpdates: p.statusUpdates,
        agingDays: p.agingDays, quietHours: p.quietHours } : null });
  } catch (error) {
    return error instanceof Response ? error : json({ error: "notification_settings_failed" }, 500);
  }
}
export const GET = handle;
export const PUT = handle;
export const DELETE = handle;`;
