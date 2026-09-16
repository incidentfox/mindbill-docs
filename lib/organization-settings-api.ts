import type { ApiEndpoint, ApiField, HttpMethod } from "./api-reference";

export const billSearchFields: ApiField[] = [
  { name: "q", type: "string", description: "Case-insensitive search across patient, administrator, bill/claim identifiers, external IDs, status, procedure codes, and dates. Every word must match; words may match different fields.", constraint: "At most 160 characters after trimming" },
  { name: "dateField", type: '"service" | "submitted"', description: "Choose the date used by the range filter; defaults to submitted." },
  { name: "from", type: "string", description: "Inclusive start of the selected date range.", constraint: "Real YYYY-MM-DD date; from must not be after to" },
  { name: "to", type: "string", description: "Inclusive end of the selected date range.", constraint: "Real YYYY-MM-DD date; from must not be after to" },
];

const member = { id: "user_example", email: "biller@example.com", name: "Example Biller", role: "biller", active: true, createdAt: "2026-09-01T12:00:00.000Z", canManage: true };
const administrator = { id: "custom_example", name: "Example Claims Office", fax: "+15555550123", email: null, mailingAddress: null, submissionMethod: "fax", notes: null, active: true, createdAt: "2026-09-01T12:00:00.000Z" };
const id: ApiField = { name: "id", type: "string", required: true, description: "Identifier returned by this organization's list endpoint." };
const requestExample = (method: HttpMethod, path: string, body?: object) => [{
  label: "Server", language: "bash", filename: "Request", code: `curl 'https://app.mindbill.org/partner/v2${path}' \\\n  --request ${method} \\\n  --header "Authorization: Bearer $MINDBILL_API_KEY"${body ? ` \\\n  --header 'Content-Type: application/json' \\\n  --data '${JSON.stringify(body)}'` : ""}`,
}];
const teamNotes = [
  { title: "MindBill accounts only", body: "Lists and edits existing MindBill login accounts. It does not invite/create accounts or modify users or roles in your application. The response identifies its account domain as mindbill." },
  { title: "Explicit team authority", body: "An organization-wide browser session must explicitly request team:manage, delegated from the server key's orgs:team:write scope. organization:manage does not imply team access. Bill-scoped and customer-scoped credentials are not supported. Respect canManage and the returned role choices; protected accounts are not editable." },
];
const adminNotes = [
  { title: "Organization-specific destinations", body: "Requires an organization-wide credential. Bill-scoped and customer-scoped credentials are not supported. These contacts do not create electronic payer routes in the shared directory. Removing a contact preserves historical bill snapshots." },
  { title: "Delivery method", body: "Supply at least one fax, email, or mailing address. The server derives submissionMethod from the available contact channels." },
];
const adminFields: ApiField[] = [
  { name: "name", type: "string", required: true, description: "Claims administrator display name.", constraint: "1–200 characters" },
  { name: "fax", type: "string | null", description: "Fax destination; required unless an email or mailing address is supplied.", constraint: "At most 50 characters" },
  { name: "email", type: "string | null", description: "Email destination.", constraint: "Valid email, at most 254 characters; empty or null clears it" },
  { name: "mailingAddress", type: "string | null", description: "Mailing address as text, not a structured address object.", constraint: "At most 2,000 characters" },
  { name: "notes", type: "string | null", description: "Internal contact notes.", constraint: "At most 4,000 characters" },
];
export const organizationSettingsEndpoints: ApiEndpoint[] = [
  {
    slug: "list-organization-team", group: "Platform", authentication: "api-key-or-browser-session", method: "GET", path: "/organization/team",
    title: "List organization team", summary: "Read existing MindBill accounts and permitted role choices.", useWhen: "Show team access for the authenticated MindBill organization.", permissions: ["Server: orgs:team:read", "Browser: team:manage"],
    responseFields: [
      { name: "data.members", type: "TeamMember[]", required: true, description: "Existing accounts: id, email, name, role, active, createdAt, and canManage." },
      { name: "data.roles", type: "object[]", required: true, description: "Assignable roles, each with id, label, and permissions." },
      { name: "data.capabilities", type: "object", required: true, description: "canManage reflects whether this credential has team-write authority; canAdd is false because account creation is not available." },
      { name: "data.identityDomain", type: '"mindbill"', required: true, description: "These accounts belong to MindBill, not the host application." },
    ], examples: requestExample("GET", "/organization/team"), responseExample: JSON.stringify({ data: { members: [member], roles: [{ id: "biller", label: "Biller", permissions: ["bills.create", "bills.edit", "bills.send", "payments.post", "tasks.assign", "payers.manage", "reports.view", "comments.create"] }], capabilities: { canManage: true, canAdd: false }, identityDomain: "mindbill" } }, null, 2), notes: teamNotes,
  },
  {
    slug: "update-organization-team-member", group: "Platform", authentication: "api-key-or-browser-session", method: "PATCH", path: "/organization/team/{id}",
    title: "Update a team member", summary: "Change an eligible existing MindBill account's role or active state.", useWhen: "Apply a reviewed team-access change after authorizing the host user on your server.", permissions: ["Server: orgs:team:write", "Browser: team:manage"], pathFields: [id],
    requestFields: [
      { name: "role", type: '"admin" | "manager" | "biller" | "payments" | "viewer"', description: "Assignable role. Existing legacy member or protected super_admin values may appear in reads; they are not assignment choices." },
      { name: "active", type: "boolean", description: "Whether this account is active." },
    ], responseFields: [{ name: "data", type: "TeamMember", required: true, description: "Updated account, including canManage." }],
    examples: requestExample("PATCH", "/organization/team/user_example", { role: "biller" }), responseExample: JSON.stringify({ data: member }, null, 2), notes: [...teamNotes, { title: "Preserve administrator access", body: "Send at least one of role or active. The server rejects protected accounts with protected_member and prevents removing the last active administrator with last_admin." }],
  },
  {
    slug: "list-organization-claims-administrators", group: "Directories", authentication: "api-key-or-browser-session", method: "GET", path: "/organization/claims-administrators",
    title: "List custom claims administrators", summary: "Read active claims-administrator contacts saved for this organization.", useWhen: "Populate custom destination settings.", permissions: ["Server: orgs:read", "Browser: organization:manage"],
    responseFields: [{ name: "data", type: "CustomClaimsAdministrator[]", required: true, description: "Active contacts: id, name, fax, email, mailingAddress, submissionMethod, notes, active, and createdAt. Contact fields may be null." }],
    examples: requestExample("GET", "/organization/claims-administrators"), responseExample: JSON.stringify({ data: [administrator] }, null, 2), notes: adminNotes,
  },
  ...(["POST", "PATCH"] as const).map((method): ApiEndpoint => {
    const create = method === "POST";
    const path = `/organization/claims-administrators${create ? "" : "/{id}"}`;
    return {
      slug: `${create ? "create" : "update"}-organization-claims-administrator`, group: "Directories", authentication: "api-key-or-browser-session", method, path,
      title: `${create ? "Create" : "Update"} a custom claims administrator`, summary: `${create ? "Save" : "Edit"} an organization-specific fax, email, or mail destination.`, useWhen: "Manage a destination outside the shared electronic payer directory.", permissions: ["Server: orgs:write", "Browser: organization:manage"],
      pathFields: create ? undefined : [id], requestFields: adminFields, responseStatus: create ? "201 Created" : "200 OK",
      responseFields: [{ name: "data", type: "CustomClaimsAdministrator", required: true, description: "Saved contact and server-derived submissionMethod." }],
      examples: requestExample(method, path.replace("{id}", "custom_example"), { name: administrator.name, fax: administrator.fax }), responseExample: JSON.stringify({ data: administrator }, null, 2), notes: create ? adminNotes : [...adminNotes, { title: "Send the complete contact", body: "PATCH replaces the editable contact fields. Include the name and at least one delivery channel; omitted optional contact fields and notes are cleared." }],
    };
  }),
  {
    slug: "delete-organization-claims-administrator", group: "Directories", authentication: "api-key-or-browser-session", method: "DELETE", path: "/organization/claims-administrators/{id}",
    title: "Remove a custom claims administrator", summary: "Remove a saved destination from future choices.", useWhen: "Retire an organization's custom contact while preserving existing bill snapshots.", permissions: ["Server: orgs:write", "Browser: organization:manage"], pathFields: [id],
    responseFields: [{ name: "data.id", type: "string", required: true, description: "Removed contact identifier." }, { name: "data.deleted", type: "boolean", required: true, description: "True after the contact is deactivated." }],
    examples: requestExample("DELETE", "/organization/claims-administrators/custom_example"), responseExample: JSON.stringify({ data: { id: administrator.id, deleted: true } }, null, 2), notes: adminNotes,
  },
];
