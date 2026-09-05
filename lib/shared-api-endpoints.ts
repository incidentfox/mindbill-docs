import type { ApiEndpoint } from "./api-reference";

// Canonical endpoints shared by server integrations and browser components.
export const sharedApiEndpoints: ApiEndpoint[] = [
  {
    "slug": "bill-dashboard",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bill-dashboard",
    "title": "List the bill dashboard",
    "summary": "Organization-wide page pagination and dashboard filters.",
    "useWhen": "Organization-wide page pagination and dashboard filters. GET /bills retains its cursor contract. Bill-scoped browser sessions cannot list collections.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.items",
        "type": "object[]",
        "required": true,
        "description": "items"
      },
      {
        "name": "data.total",
        "type": "integer",
        "required": true,
        "description": "total"
      },
      {
        "name": "data.balanceTotal",
        "type": "number",
        "required": true,
        "description": "balanceTotal"
      },
      {
        "name": "data.page",
        "type": "integer",
        "required": true,
        "description": "page"
      },
      {
        "name": "data.pageSize",
        "type": "integer",
        "required": true,
        "description": "pageSize"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bill-dashboard' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bill-dashboard' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "{\n  \"data\": {\n    \"items\": [],\n    \"total\": 0,\n    \"balanceTotal\": 0,\n    \"page\": 1,\n    \"pageSize\": 25\n  }\n}",
    "queryFields": [
      {
        "name": "page",
        "type": "integer",
        "description": "Page number.",
        "required": false
      },
      {
        "name": "pageSize",
        "type": "integer",
        "description": "Rows per page.",
        "required": false
      },
      {
        "name": "q",
        "type": "string",
        "description": "Search text, at most 160 characters.",
        "required": false
      },
      {
        "name": "status",
        "type": "string",
        "description": "Comma-separated dashboard status keys: incomplete,send,sent,accepted,accepted_no_response,processed,paid,denied,rejected,appealing,lien,ibr,closed.",
        "required": false
      },
      {
        "name": "age",
        "type": "string",
        "description": "Age bucket.",
        "required": false
      },
      {
        "name": "sort",
        "type": "string",
        "description": "Sort column.",
        "required": false
      },
      {
        "name": "dir",
        "type": "string",
        "description": "Sort direction.",
        "required": false
      },
      {
        "name": "claimsAdminId",
        "type": "string",
        "description": "",
        "required": false
      },
      {
        "name": "billingProviderId",
        "type": "string",
        "description": "",
        "required": false
      },
      {
        "name": "taskKind",
        "type": "string",
        "description": "",
        "required": false
      },
      {
        "name": "taskLabel",
        "type": "string",
        "description": "Task label, used with a valid taskKind; maximum 120 characters.",
        "required": false
      },
      {
        "name": "openAr",
        "type": "string",
        "description": "Set to 1 for open accounts receivable.",
        "required": false
      }
    ],
    "pathFields": [],
    "idempotent": false
  },
  {
    "slug": "get-bill-tasks",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bill-tasks",
    "title": "Get bill tasks",
    "summary": "Organization-wide task dashboard and waiting queues.",
    "useWhen": "Organization-wide task dashboard and waiting queues. Bill-scoped browser sessions are rejected.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.dashboard",
        "type": "object",
        "required": false,
        "description": "dashboard"
      },
      {
        "name": "data.waiting",
        "type": "object",
        "required": false,
        "description": "waiting"
      },
      {
        "name": "data.filters",
        "type": "object",
        "required": false,
        "description": "filters"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bill-tasks' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bill-tasks' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [
      {
        "name": "claimsAdminId",
        "type": "string",
        "description": "",
        "required": false
      }
    ],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "get-productivity-report",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/reports/productivity",
    "title": "Get biller productivity",
    "summary": "Organization-wide report for the date range.",
    "useWhen": "Organization-wide report for the date range. Activity is scoped to this partner and environment. Bill-scoped browser sessions are rejected.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object | null",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.lo",
        "type": "string",
        "required": false,
        "description": "lo"
      },
      {
        "name": "data.hi",
        "type": "string",
        "required": false,
        "description": "hi"
      },
      {
        "name": "data.dayKeys",
        "type": "string[]",
        "required": false,
        "description": "dayKeys"
      },
      {
        "name": "data.billers",
        "type": "object[]",
        "required": false,
        "description": "billers"
      },
      {
        "name": "data.created",
        "type": "array[]",
        "required": false,
        "description": "created"
      },
      {
        "name": "data.sent",
        "type": "array[]",
        "required": false,
        "description": "sent"
      },
      {
        "name": "data.createdTotal",
        "type": "number[]",
        "required": false,
        "description": "createdTotal"
      },
      {
        "name": "data.sentTotal",
        "type": "number[]",
        "required": false,
        "description": "sentTotal"
      },
      {
        "name": "data.submittedTotal",
        "type": "number[]",
        "required": false,
        "description": "submittedTotal"
      },
      {
        "name": "data.cleanTotal",
        "type": "number[]",
        "required": false,
        "description": "cleanTotal"
      },
      {
        "name": "data.createdByDay",
        "type": "number[]",
        "required": false,
        "description": "createdByDay"
      },
      {
        "name": "data.sentByDay",
        "type": "number[]",
        "required": false,
        "description": "sentByDay"
      },
      {
        "name": "data.totalCreated",
        "type": "number",
        "required": false,
        "description": "totalCreated"
      },
      {
        "name": "data.totalSent",
        "type": "number",
        "required": false,
        "description": "totalSent"
      },
      {
        "name": "data.totalSubmitted",
        "type": "number",
        "required": false,
        "description": "totalSubmitted"
      },
      {
        "name": "data.totalClean",
        "type": "number",
        "required": false,
        "description": "totalClean"
      },
      {
        "name": "data.maxSentCell",
        "type": "number",
        "required": false,
        "description": "maxSentCell"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/reports/productivity' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/reports/productivity' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [
      {
        "name": "from",
        "type": "string",
        "description": "Inclusive date (YYYY-MM-DD). Required.",
        "required": true
      },
      {
        "name": "to",
        "type": "string",
        "description": "Inclusive date (YYYY-MM-DD). Required.",
        "required": true
      }
    ],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "get-service-line-items-report",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/reports/service-line-items",
    "title": "Get service line items",
    "summary": "Organization-wide report for the date range.",
    "useWhen": "Organization-wide report for the date range. Activity is scoped to this partner and environment. Bill-scoped browser sessions are rejected.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.from",
        "type": "string",
        "required": false,
        "description": "from"
      },
      {
        "name": "data.to",
        "type": "string",
        "required": false,
        "description": "to"
      },
      {
        "name": "data.windowLabel",
        "type": "string",
        "required": false,
        "description": "windowLabel"
      },
      {
        "name": "data.cptRows",
        "type": "object[]",
        "required": false,
        "description": "cptRows"
      },
      {
        "name": "data.billRows",
        "type": "object[]",
        "required": false,
        "description": "billRows"
      },
      {
        "name": "data.flat",
        "type": "object[]",
        "required": false,
        "description": "flat"
      },
      {
        "name": "data.totalBills",
        "type": "number",
        "required": false,
        "description": "totalBills"
      },
      {
        "name": "data.totalLines",
        "type": "number",
        "required": false,
        "description": "totalLines"
      },
      {
        "name": "data.totalBilled",
        "type": "number",
        "required": false,
        "description": "totalBilled"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/reports/service-line-items' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/reports/service-line-items' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [
      {
        "name": "from",
        "type": "string",
        "description": "Inclusive date (YYYY-MM-DD). Omit for the default report window.",
        "required": false
      },
      {
        "name": "to",
        "type": "string",
        "description": "Inclusive date (YYYY-MM-DD). Omit for the default report window.",
        "required": false
      }
    ],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "get-current-organization",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/organization",
    "title": "Get the current organization",
    "summary": "Read the composed profile for the authenticated organization.",
    "useWhen": "Read the composed profile for the authenticated organization.",
    "permissions": [
      "Server: orgs:read",
      "Browser: organization:manage"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "get-current-billing-profile",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/organization/billing-profile",
    "title": "Get bill-entry profile choices",
    "summary": "Read masked provider and location choices for bill creation.",
    "useWhen": "Read masked provider and location choices for bill creation. Browser session must be organization-wide.",
    "permissions": [
      "Server: orgs:read",
      "Browser: bills:create"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/billing-profile' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/billing-profile' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "get-organization",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/organizations/{id}",
    "title": "Get an organization",
    "summary": "Read the composed profile.",
    "useWhen": "Read the composed profile. The explicit organization id must match the authenticated organization.",
    "permissions": [
      "Server: orgs:read",
      "Browser: organization:manage"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "id",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "save-current-billing-profile",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "PUT",
    "path": "/organization/billing-profile",
    "title": "Save current organization billing profile",
    "summary": "Save profile settings.",
    "useWhen": "Save profile settings. Provider/location writes upsert by id, then externalId; existing records are not deleted. W-9 replaces the current PDF. Stored SSNs are masked on reads; omit taxId to preserve it. Do not send response-only taxIdConfigured or taxIdLast4.",
    "permissions": [
      "Server: orgs:write",
      "Browser: organization:manage"
    ],
    "requestFields": [
      {
        "name": "practiceIdentity",
        "type": "object",
        "required": false,
        "description": "practiceIdentity"
      },
      {
        "name": "billingProviders",
        "type": "object[]",
        "required": false,
        "description": "billingProviders"
      },
      {
        "name": "renderingProviders",
        "type": "object[]",
        "required": false,
        "description": "renderingProviders"
      }
    ],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/billing-profile' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/billing-profile' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "save-current-locations",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "PUT",
    "path": "/organization/locations",
    "title": "Save current organization locations",
    "summary": "Save profile settings.",
    "useWhen": "Save profile settings. Provider/location writes upsert by id, then externalId; existing records are not deleted. W-9 replaces the current PDF. Stored SSNs are masked on reads; omit taxId to preserve it. Do not send response-only taxIdConfigured or taxIdLast4.",
    "permissions": [
      "Server: orgs:write",
      "Browser: organization:manage"
    ],
    "requestFields": [
      {
        "name": "locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      }
    ],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/locations' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/locations' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "save-current-w9",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "PUT",
    "path": "/organization/w9",
    "title": "Save current organization W-9",
    "summary": "Save profile settings.",
    "useWhen": "Save profile settings. Provider/location writes upsert by id, then externalId; existing records are not deleted. W-9 replaces the current PDF. Stored SSNs are masked on reads; omit taxId to preserve it. Do not send response-only taxIdConfigured or taxIdLast4.",
    "permissions": [
      "Server: orgs:write",
      "Browser: organization:manage"
    ],
    "requestFields": [
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "filename"
      },
      {
        "name": "contentBase64",
        "type": "string",
        "required": true,
        "description": "Base64 PDF. Decoded maximum 10 MiB; PDF magic bytes are validated."
      },
      {
        "name": "taxYear",
        "type": "integer",
        "required": false,
        "description": "taxYear"
      }
    ],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/w9' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organization/w9' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "save-organization-locations",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "PUT",
    "path": "/organizations/{id}/locations",
    "title": "Save organization locations",
    "summary": "Save profile settings.",
    "useWhen": "Save profile settings. Provider/location writes upsert by id, then externalId; existing records are not deleted. W-9 replaces the current PDF. Stored SSNs are masked on reads; omit taxId to preserve it. Do not send response-only taxIdConfigured or taxIdLast4.",
    "permissions": [
      "Server: orgs:write",
      "Browser: organization:manage"
    ],
    "requestFields": [
      {
        "name": "locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      }
    ],
    "responseFields": [
      {
        "name": "data",
        "type": "object[]",
        "required": true,
        "description": "data"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}/locations' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}/locations' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "id",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": true
  },
  {
    "slug": "save-organization-w9",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "PUT",
    "path": "/organizations/{id}/w9",
    "title": "Save organization W-9",
    "summary": "Save profile settings.",
    "useWhen": "Save profile settings. Provider/location writes upsert by id, then externalId; existing records are not deleted. W-9 replaces the current PDF. Stored SSNs are masked on reads; omit taxId to preserve it. Do not send response-only taxIdConfigured or taxIdLast4.",
    "permissions": [
      "Server: orgs:write",
      "Browser: organization:manage"
    ],
    "requestFields": [
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "filename"
      },
      {
        "name": "contentBase64",
        "type": "string",
        "required": true,
        "description": "Base64 PDF. Decoded maximum 10 MiB; PDF magic bytes are validated."
      },
      {
        "name": "taxYear",
        "type": "integer",
        "required": false,
        "description": "taxYear"
      }
    ],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.organizationId",
        "type": "string",
        "required": true,
        "description": "organizationId"
      },
      {
        "name": "data.practiceIdentity",
        "type": "object",
        "required": false,
        "description": "Practice identity; stored SSNs are masked with taxIdConfigured and taxIdLast4."
      },
      {
        "name": "data.billingProviders",
        "type": "object[]",
        "required": true,
        "description": "billingProviders"
      },
      {
        "name": "data.renderingProviders",
        "type": "object[]",
        "required": true,
        "description": "renderingProviders"
      },
      {
        "name": "data.locations",
        "type": "object[]",
        "required": true,
        "description": "locations"
      },
      {
        "name": "data.w9",
        "type": "object | null",
        "required": true,
        "description": "w9"
      },
      {
        "name": "data.onboarding",
        "type": "object",
        "required": true,
        "description": "onboarding"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}/w9' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}/w9' \\\n  --request PUT \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "id",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": true
  },
  {
    "slug": "list-organization-locations",
    "group": "Platform",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/organizations/{id}/locations",
    "title": "List organization locations",
    "summary": "Read saved locations.",
    "useWhen": "Read saved locations. The explicit organization id must match the authenticated organization.",
    "permissions": [
      "Server: orgs:read",
      "Browser: organization:manage"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object[]",
        "required": true,
        "description": "data"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}/locations' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations/{id}/locations' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "id",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "provision-organization",
    "group": "Platform",
    "authentication": "api-key",
    "method": "POST",
    "path": "/organizations",
    "title": "Provision an organization",
    "summary": "Create or find a managed organization using your stable externalId.",
    "useWhen": "Create or find a managed organization using your stable externalId. Requires an account-scoped credential; an organization-scoped credential is rejected. Returns 201 when created, 200 when found.",
    "permissions": [
      "Server: orgs:write"
    ],
    "requestFields": [
      {
        "name": "externalId",
        "type": "string",
        "required": true,
        "description": "externalId"
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "name"
      },
      {
        "name": "accessMode",
        "type": "string",
        "required": false,
        "description": "Legacy invite input is accepted with adminName and adminEmail; this endpoint provisions managed access."
      },
      {
        "name": "practiceIdentity",
        "type": "object",
        "required": false,
        "description": "practiceIdentity"
      },
      {
        "name": "billingProviders",
        "type": "object[]",
        "required": false,
        "description": "billingProviders"
      },
      {
        "name": "renderingProviders",
        "type": "object[]",
        "required": false,
        "description": "renderingProviders"
      },
      {
        "name": "locations",
        "type": "object[]",
        "required": false,
        "description": "locations"
      },
      {
        "name": "adminName",
        "type": "string",
        "required": false,
        "description": "adminName"
      },
      {
        "name": "adminEmail",
        "type": "string",
        "required": false,
        "description": "adminEmail"
      }
    ],
    "responseFields": [
      {
        "name": "organizationId",
        "type": "string",
        "required": false,
        "description": "organizationId"
      },
      {
        "name": "externalId",
        "type": "string",
        "required": false,
        "description": "externalId"
      },
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "name"
      },
      {
        "name": "status",
        "type": "string",
        "required": false,
        "description": "status"
      },
      {
        "name": "accessMode",
        "type": "object",
        "required": false,
        "description": "accessMode"
      },
      {
        "name": "created",
        "type": "boolean",
        "required": false,
        "description": "created"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/organizations' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      }
    ],
    "responseStatus": "201",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [],
    "responseLanguage": "text",
    "idempotent": true
  },
  {
    "slug": "courtesy-forward-bill",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "POST",
    "path": "/bills/{billId}/courtesy-forward",
    "title": "Preview or send a courtesy copy",
    "summary": "Preview the exact PDF, recipients, and message before sending.",
    "useWhen": "Preview the exact PDF, recipients, and message before sending. mode=send requires Idempotency-Key and the preview packetHash. A changed packet returns 409. Sandbox sends are simulated. This is not a payer submission.",
    "permissions": [
      "Server: bills:write",
      "Browser: bills:act"
    ],
    "requestFields": [
      {
        "name": "mode",
        "type": "string",
        "required": true,
        "description": "mode"
      },
      {
        "name": "to",
        "type": "string[]",
        "required": true,
        "description": "to"
      },
      {
        "name": "cc",
        "type": "string[]",
        "required": false,
        "description": "cc"
      },
      {
        "name": "subject",
        "type": "string",
        "required": true,
        "description": "subject"
      },
      {
        "name": "bodyText",
        "type": "string",
        "required": true,
        "description": "bodyText"
      },
      {
        "name": "includeCms1500",
        "type": "boolean",
        "required": false,
        "description": "includeCms1500"
      },
      {
        "name": "documentIds",
        "type": "string[]",
        "required": false,
        "description": "documentIds"
      },
      {
        "name": "packetHash",
        "type": "string",
        "required": false,
        "description": "Required for send. Hash from the reviewed preview for this exact packet, recipients, and message."
      }
    ],
    "responseFields": [
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "filename"
      },
      {
        "name": "documentCount",
        "type": "integer",
        "required": true,
        "description": "documentCount"
      },
      {
        "name": "packetHash",
        "type": "string",
        "required": true,
        "description": "packetHash"
      },
      {
        "name": "pdfBase64",
        "type": "string",
        "required": true,
        "description": "pdfBase64"
      },
      {
        "name": "environment",
        "type": "string",
        "required": true,
        "description": "environment"
      },
      {
        "name": "ok",
        "type": "boolean",
        "required": true,
        "description": "ok"
      },
      {
        "name": "sent",
        "type": "boolean",
        "required": true,
        "description": "sent"
      },
      {
        "name": "messageId",
        "type": "string",
        "required": false,
        "description": "messageId"
      },
      {
        "name": "simulated",
        "type": "boolean",
        "required": false,
        "description": "simulated"
      },
      {
        "name": "dryRun",
        "type": "boolean",
        "required": false,
        "description": "dryRun"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/courtesy-forward' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/courtesy-forward' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "get-bill-delivery-options",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bills/{billId}/delivery-options",
    "title": "Get bill delivery options",
    "summary": "Read delivery choices for an existing bill.",
    "useWhen": "Read delivery choices for an existing bill. Returns the top-level delivery object; 404 when unavailable.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "payerName",
        "type": "string",
        "required": true,
        "description": "payerName"
      },
      {
        "name": "recommended",
        "type": "object",
        "required": false,
        "description": "recommended"
      },
      {
        "name": "options",
        "type": "object[]",
        "required": true,
        "description": "options"
      },
      {
        "name": "contacts",
        "type": "object",
        "required": false,
        "description": "contacts"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/delivery-options' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/delivery-options' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "download-bill-eor-document",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bills/{billId}/eors/{docId}",
    "title": "Download an EOR document",
    "summary": "Download an original EOR PDF by its document identifier.",
    "useWhen": "Download an original EOR PDF by its document identifier.",
    "permissions": [
      "Server: bills:read",
      "Browser: eors:read"
    ],
    "requestFields": [],
    "responseFields": [],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/eors/{docId}' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/eors/{docId}' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "%PDF-…",
    "queryFields": [],
    "pathFields": [
      {
        "name": "docId",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      },
      {
        "name": "billId",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "download-bill-ibr-packet",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bills/{billId}/ibr-packet",
    "title": "Download an IBR packet",
    "summary": "Download the prepared Independent Bill Review packet.",
    "useWhen": "Download the prepared Independent Bill Review packet. Returns 409 when unavailable. This download does not file or pay for a review.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/ibr-packet' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/ibr-packet' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "%PDF-…",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "reject-repeat-bill-submission",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "POST",
    "path": "/bills/{billId}/submissions",
    "title": "Legacy repeat submission",
    "summary": "Compatibility endpoint.",
    "useWhen": "Compatibility endpoint. Bills are submitted atomically by POST /bills; this endpoint always returns 409 bill_already_submitted for an authorized existing bill. Use lifecycle actions for allowed follow-up work.",
    "permissions": [
      "Server: bills:write",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "type",
        "type": "string",
        "required": true,
        "description": "Stable problem type URI."
      },
      {
        "name": "title",
        "type": "string",
        "required": true,
        "description": "Short error summary."
      },
      {
        "name": "status",
        "type": "integer",
        "required": true,
        "description": "HTTP status."
      },
      {
        "name": "code",
        "type": "string",
        "required": true,
        "description": "Stable machine-readable error code."
      },
      {
        "name": "detail",
        "type": "string",
        "required": false,
        "description": "Human-readable context."
      },
      {
        "name": "errors",
        "type": "object[]",
        "required": false,
        "description": "Field-level validation details."
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/submissions' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/submissions' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "409",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "Resource identifier.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "bill-lifecycle",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bills/{billId}/lifecycle",
    "title": "Get the complete bill workspace",
    "summary": "Read the immutable submitted bill snapshot, human-readable activity history, current lifecycle, EORs, payments, remittance, and payer contacts.",
    "useWhen": "Read the immutable submitted bill snapshot, human-readable activity history, current lifecycle, EORs, payments, remittance, and payer contacts. Partners do not need to maintain a separate bill-history store.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "data"
      },
      {
        "name": "data.environment",
        "type": "string",
        "required": true,
        "description": "Credential environment used to load this lifecycle."
      },
      {
        "name": "data.bill",
        "type": "object",
        "required": true,
        "description": "The same immutable submitted bill snapshot returned by the bill-review surface."
      },
      {
        "name": "data.patient",
        "type": "object",
        "required": true,
        "description": "patient"
      },
      {
        "name": "data.injury",
        "type": "object",
        "required": true,
        "description": "injury"
      },
      {
        "name": "data.options",
        "type": "object",
        "required": false,
        "description": "Display metadata retained for compatible embedded components."
      },
      {
        "name": "data.lifecycle",
        "type": "object",
        "required": true,
        "description": "lifecycle"
      },
      {
        "name": "data.eors",
        "type": "object[]",
        "required": true,
        "description": "eors"
      },
      {
        "name": "data.attempts",
        "type": "object[]",
        "required": true,
        "description": "Immutable delivery attempts in the logical bill chain, oldest first. Every successful transmission, including Second Review, is a separate row even when it reuses the same bill record."
      },
      {
        "name": "data.history",
        "type": "object[]",
        "required": true,
        "description": "One chronological timeline spanning every delivery attempt. Each row identifies its correction-chain member bill record via attemptId."
      },
      {
        "name": "data.activity",
        "type": "object[]",
        "required": true,
        "description": "activity"
      },
      {
        "name": "data.payments",
        "type": "object[]",
        "required": true,
        "description": "payments"
      },
      {
        "name": "data.remittance",
        "type": "object",
        "required": true,
        "description": "remittance"
      },
      {
        "name": "data.delivery",
        "type": "object",
        "required": true,
        "description": "delivery"
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/lifecycle' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/lifecycle' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "MindBill bill ID.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "bill-packet",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bills/{billId}/packet",
    "title": "Download the complete bill packet",
    "summary": "Download one ordered PDF containing truthful submission proof and timeline, the MC 1500, selected supporting attachments, and the practice W-9 when available.",
    "useWhen": "Download one ordered PDF containing truthful submission proof and timeline, the MC 1500, selected supporting attachments, and the practice W-9 when available. Delivery proof reflects the actual e-bill, fax, mail, or email route.",
    "permissions": [
      "Server: bills:read",
      "Browser: bills:read"
    ],
    "requestFields": [],
    "responseFields": [],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/packet' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/packet' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "%PDF-…",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "MindBill bill ID.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  },
  {
    "slug": "sandbox-simulate",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "POST",
    "path": "/sandbox/bills/{billId}/simulate",
    "title": "Simulate a sandbox lifecycle response",
    "summary": "Advance a submitted synthetic sandbox bill through deterministic accepted, processed, rejected, denied, partial-payment, or paid scenarios.",
    "useWhen": "Advance a submitted synthetic sandbox bill through deterministic accepted, processed, rejected, denied, partial-payment, or paid scenarios. This endpoint is unavailable to live credentials and is intended for demos and integration tests.",
    "permissions": [
      "Server: bills:submit",
      "Browser: bills:act"
    ],
    "requestFields": [
      {
        "name": "scenario",
        "type": "string",
        "required": true,
        "description": "Deterministic synthetic response to apply."
      },
      {
        "name": "amount",
        "type": "number",
        "required": false,
        "description": "Optional payer-reported amount used by partial-payment scenarios."
      },
      {
        "name": "reasonCode",
        "type": "string",
        "required": false,
        "description": "Optional synthetic adjustment or rejection reason code."
      }
    ],
    "responseFields": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "Synthetic simulation result and updated bill state."
      }
    ],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/sandbox/bills/{billId}/simulate' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\" \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/sandbox/bills/{billId}/simulate' \\\n  --request POST \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example' \\\n  --header 'Content-Type: application/json' \\\n  --data @request.json \\\n  --header 'Idempotency-Key: example-write-0001'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "Response fields are documented below.",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "MindBill bill ID.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": true
  },
  {
    "slug": "review-packet",
    "group": "Lifecycle",
    "authentication": "api-key-or-browser-session",
    "method": "GET",
    "path": "/bills/{billId}/reviews/{reviewId}/packet",
    "title": "Download the IBR filing packet",
    "summary": "For independent_bill_review reviews only.",
    "useWhen": "For independent_bill_review reviews only. Returns a print-ready PDF: the completed Request for Independent Bill Review, filing instructions (current DWC-IBR mailing address and the $195 application fee), and a Proof of Service. IBR is self-filed — print, sign, enclose the fee, mail the packet to DWC-IBR within 30 days of the final Second Review determination, and concurrently serve the claims administrator (CCR 9792.5.7(b)). MindBill performs no IBR transport and this endpoint is never billed.",
    "permissions": [
      "Server: bills:read",
      "Browser: documents:read"
    ],
    "requestFields": [],
    "responseFields": [],
    "examples": [
      {
        "label": "Server",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/reviews/{reviewId}/packet' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_API_KEY\""
      },
      {
        "label": "Browser session",
        "language": "bash",
        "filename": "Request",
        "code": "curl 'https://app.mindbill.org/partner/v2/bills/{billId}/reviews/{reviewId}/packet' \\\n  --request GET \\\n  --header \"Authorization: Bearer $MINDBILL_BROWSER_TOKEN\" \\\n  --header 'Origin: https://your-app.example'"
      }
    ],
    "responseStatus": "200",
    "responseExample": "%PDF-…",
    "queryFields": [],
    "pathFields": [
      {
        "name": "billId",
        "type": "string",
        "description": "MindBill bill ID.",
        "required": true
      },
      {
        "name": "reviewId",
        "type": "string",
        "description": "MindBill review ID.",
        "required": true
      }
    ],
    "responseLanguage": "text",
    "idempotent": false
  }
];
