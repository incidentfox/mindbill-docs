import type { ApiEndpoint } from "./api-reference";

export const reportAutofillEndpoints: ApiEndpoint[] = [{
  slug: "report-autofill", group: "Bills", authentication: "api-key-or-browser-session",
  method: "POST", path: "/report-autofill", title: "Extract report suggestions",
  summary: "Extract review-only bill suggestions from one report PDF without saving or submitting a bill.",
  useWhen: "Offer optional report-assisted entry after written agreement and operator provisioning of the organization's reportAutofill capability.",
  permissions: ["Server: operator credential with autofill:write", "Browser: explicitly delegated autofill:run"],
  requestFields: [{ name: "report", type: "file (multipart/form-data)", required: true, description: "Exactly one non-empty, unencrypted PDF. Do not send JSON or additional multipart fields.", constraint: "1–100 pages; at most 25 MiB" }],
  responseFields: [
    { name: "data.model", type: '"gpt-5.6-luna"', required: true, description: "Extraction model." },
    { name: "data.requiresReview", type: "true", required: true, description: "Every suggestion requires human review before applying it." },
    { name: "data.fields", type: "ReportField[]", required: true, description: "Explicitly supported report facts; missing or uncertain values are omitted." },
    { name: "data.fields[].key", type: "string", required: true, description: "patientFirstName, patientLastName, dob, claimNumber, doi, adjNumber, employer, dos, bodyParts, dxCode, renderingProvider, claimsAdminName, evaluationLocation, addressLine, city, state, zip, billingProvider, billingProviderNpi, or renderingProviderNpi." },
    { name: "data.fields[].value", type: "string", required: true, description: "Suggested value. Dates use real YYYY-MM-DD calendar dates. Address fields describe the patient, not the service facility." },
    { name: "data.fields[].sourceText", type: "string", required: true, description: "Source excerpt to display during review." },
    { name: "data.fields[].confidence", type: '"high" | "medium"', required: true, description: "Extraction confidence; does not replace human review." },
    { name: "data.matches", type: "object", required: true, description: "patient, billingProvider, renderingProvider, and serviceLocation match results." },
    { name: "data.matches.*.status", type: '"matched" | "ambiguous" | "none"', required: true, description: "Whether existing authorized records provide a unique, ambiguous, or absent match." },
    { name: "data.matches.*.candidates", type: "{ id: string; name: string }[]", required: true, description: "Authorized saved-record candidates." },
    { name: "data.matches.*.selectedId", type: "string", description: "Present only for a unique match. Do not replace existing form selections automatically." },
    { name: "data.warnings", type: "string[]", required: true, description: "Issues that must remain visible during review." },
  ],
  examples: [{ label: "Server", language: "bash", filename: "Extract a synthetic report", code: `curl https://app.mindbill.org/partner/v2/report-autofill \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --form 'report=@synthetic-report.pdf;type=application/pdf'` }],
  responseExample: JSON.stringify({ data: { model: "gpt-5.6-luna", requiresReview: true, fields: [{ key: "dos", value: "2026-09-01", sourceText: "Date of service: September 1, 2026", confidence: "high" }], matches: { patient: { status: "none", candidates: [] }, billingProvider: { status: "none", candidates: [] }, renderingProvider: { status: "none", candidates: [] }, serviceLocation: { status: "none", candidates: [] } }, warnings: [] } }, null, 2),
  notes: [
    { title: "Operator-enabled access", body: "Requires written agreement and the organization's reportAutofill capability. Server credentials must be operator-class. Browser minting additionally requires embed:write and explicit autofill:write delegation. Customer- and bill-scoped access is rejected. The developer console cannot mint autofill:run." },
    { title: "Review and storage", body: "The endpoint does not save or attach the report, create procedures or charges, or submit a bill. Apply reviewed values only to empty fields. Keep extracted information out of logs." },
    { title: "Errors", body: "400 invalid_report: invalid or encrypted PDF, wrong field count, or page count outside 1–100. 413 report_too_large: upload exceeds the limit. 403: denied access or report_autofill_not_enabled. 502 report_extraction_failed: extraction failed. 503 report_autofill_unavailable: extraction is not configured. Keep manual entry available." },
  ],
}];
