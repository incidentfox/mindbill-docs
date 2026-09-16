import type { ApiEndpoint, ApiField } from "./api-reference";
const field = (name: string, type: string, description: string, required = false): ApiField => ({ name, type, description, required });
const exampleLine = {
  code: "99213", dateOfService: "2026-08-25", units: 1, chargeCents: 15000,
  modifiers: [], serviceZip: "90012",
  physicianContext: { providerKind: "physician", placeOfService: "11", standaloneService: true, globalPeriodApplies: false, hpsaBonusEligible: false },
};
const example = (path: string, payload: unknown) => [{ label: "Server", language: "bash", filename: "Synthetic office visit", code: `curl 'https://app.mindbill.org/partner/v2${path}' \\
  --header "Authorization: Bearer $MINDBILL_API_KEY" \\
  --header 'Content-Type: application/json' \\
  --data '${JSON.stringify(payload, null, 2)}'` }];
const notes = [
  { title: "Access", body: "Requires the organization's treatmentBilling capability and bills:read. Use a server API key or an origin-bound browser session. Credentials select the environment; the request body cannot override it. Quotes do not create or submit bills." },
  { title: "Service dates and evidence", body: "The calculation uses source adoptions applicable to the actual date of service, including revisions within a quarter. Preserve provenance, effective intervals, calculation details, and rule citations. Historical and specialty coverage varies; missing coverage returns review rather than a current-rate fallback." },
  { title: "Charges", body: "All quote amounts use integer cents. A submitted charge is not a verified allowance. By-report services require an actual charge and supporting review. Bill serviceLines[].charge uses dollars instead." },
  { title: "Example assumptions", body: "This fictional example describes a standalone physician office visit, with no global surgical package or geographic bonus. Supply the actual encounter facts. The response example is a TypeScript contract excerpt, not a guaranteed price for the example request." },
];
const quoteFields = [
  field("data.status", '"priced" | "requires_review" | "not_separately_payable"', "Inspect this before using amounts. Review and nonpayable results carry a reason, not a priced amount."),
  field("data.amountCents / scheduleMaximumCents", "integer", "Present on priced results: estimated payable amount and fee ceiling. The payable amount is capped by a supplied charge."),
  field("data.reason", "string", "Reason requiring review or preventing separate payment."),
  field("data.provenance[]", "object[]", "Source records with id and url; downloaded data can include sha256, effectiveFrom, effectiveThrough. Regulatory citations may be undated."),
  field("data.calculation / feeBreakdown", "object", "Optional detailed calculation: method, inputs, components, adjustments, and rounding appropriate to the fee category."),
];
export const feeScheduleEndpoints: ApiEndpoint[] = [
  {
    slug: "ca-claim-fee-quote", group: "Bills", method: "POST", path: "/fee-quotes/ca/claim", authentication: "api-key-or-browser-session",
    title: "Quote a California encounter", summary: "Estimate statutory fees and assess supported same-day coding edits across multiple service lines.",
    useWhen: "Calculate a complete encounter before creating a professional bill, or power the FeeScheduleCalculator component. The browser client's quoteClaimFees() unwraps data.",
    permissions: ["Server: bills:read", "Browser: bills:read"],
    requestFields: [
      field("lines", "object[]", "1–100 lines for one patient and one provider/group. Each date is evaluated separately.", true),
      field("lines[].id", "string", "Unique line identifier, up to 100 characters.", true),
      field("lines[].code", "string", "Five-character procedure code.", true),
      field("lines[].dateOfService", "string", "Actual calendar date, YYYY-MM-DD.", true),
      field("lines[].units", "number", "Positive quantity, at most 10,000; some categories require additional unit context."),
      field("lines[].chargeCents", "integer", "Positive submitted line charge, up to 100,000,000 cents."),
      field("lines[].modifiers", "string[]", "Up to four distinct two-character modifiers. Do not add a modifier solely to bypass an edit."),
      field("lines[].serviceZip / serviceCounty", "string", "Service locality inputs. ZIP accepts 5 digits or ZIP+4. Required locality depends on category and date."),
      field("lines[].physicianContext", "object", "Provider kind, two-digit placeOfService, standaloneService, globalPeriodApplies, and hpsaBonusEligible. Supply telehealthModality for audio/video context where applicable. See OpenAPI for specialty context schemas."),
      field("completeDateOfServiceContext", "boolean", "Whether all related services for these dates and this patient/provider group are included. Derive from encounter records; no separate user checkbox is necessary.", true),
      field("ordinaryMultipleSurgeryContext", "boolean", "Optional confirmation that the submitted encounter meets the supported ordinary multiple-surgery context. Do not infer this from codes alone."),
    ],
    responseFields: [
      field("data.status", '"priced" | "requires_review" | "not_separately_payable"', "Final claim assessment after line calculations and supported claim edits."),
      field("data.lines[]", "object[]", "Line id, normalized input, base quote, final assessment, findings, and any paymentAdjustment. A priced base quote can still have a requires_review final assessment."),
      field("data.lines[].quote", "object", "Category-specific status, amounts when priced, calculation details, provenance, and notes or review reason."),
      field("data.lines[].findings[]", "object[]", "Coding findings with code, lineIds, message, and optional citationUrl and edit details."),
      field("data.totals", "object", "submittedChargeCents, pricedSubtotalCents, estimatedPayableCents, scheduleMaximumCents, and reviewLineCount. Whole-claim payable and schedule totals are null if review is unresolved. The priced subtotal includes resolved lines only."),
      field("data.claimEdits[]", "object[]", "Per-date screening with lineIds, status, findings, optional reason/provenance, and supported date intervals. Status is evaluated, requires_review, source_unavailable, or not_applicable; not_applicable does not guarantee the absence of other coding rules."),
      field("data.limitations", "string[]", "Context and coverage limitations to display with the result."),
    ],
    examples: example("/fee-quotes/ca/claim", { completeDateOfServiceContext: true, lines: [{ id: "office-visit", ...exampleLine }] }),
    responseLanguage: "typescript",
    responseExample: `// Response envelope; full types are exported by @mindbill/browser.\n{ data: CaClaimFeeQuoteResult }\n\n// Never treat a resolved subtotal as a complete allowance.\nif (data.status === "requires_review") {\n  // data.totals.estimatedPayableCents === null\n  showReview(data.lines, data.claimEdits, data.limitations);\n} else {\n  showEstimate(data.totals.estimatedPayableCents);\n}`,
    notes: [...notes,
      { title: "Statutory calculation", body: "Claim quotes do not accept billingProviderId or payerId overrides and do not apply practice/payer contracts. Use the single-line fee quote endpoint for practice-aware estimates. Procedure-to-procedure and MUE findings require the full same-day context; an eligible modifier does not by itself establish a documented exception." },
      { title: "Validation", body: "Malformed inputs return HTTP 422 with invalid_claim_fee_quote. A valid request can return HTTP 200 with data.status requires_review. Code that checks only HTTP status can incorrectly treat unresolved fees as priced." },
    ],
  },
  {
    slug: "treatment-fee-quote", group: "Bills", method: "POST", path: "/fee-quotes", authentication: "api-key-or-browser-session",
    title: "Quote one treatment line", summary: "Estimate a treatment line with optional authorized practice-charge or payer-contract context.",
    useWhen: "Look up one line before bill entry. Use the claim quote endpoint for encounter-wide NCCI and unit-edit assessment.",
    permissions: ["Server: bills:read", "Browser: bills:read"],
    requestFields: [
      field("code", "string", "Procedure code.", true), field("dateOfService", "string", "Actual calendar date, YYYY-MM-DD.", true),
      field("chargeCents / units / modifiers", "integer / number / string[]", "Submitted line charge in cents, positive units, and up to four modifiers."),
      field("serviceZip / serviceCounty", "string", "Locality information appropriate to the service."),
      field("physicianContext", "object", "Actual provider/setting and encounter facts. Specialty inputs are defined in the OpenAPI schema."),
      field("billingProviderId / payerId", "string", "Optional authorized identities for matching practice charges or payer contracts. A resource-scoped browser session cannot supply billingProviderId."),
    ],
    responseFields: [...quoteFields,
      field("data.practiceCharge / chargeAmountCents", "object / integer", "Optional matched practice-charge information and line charge. A practice charge schedule alone does not change the statutory reimbursement ceiling."),
      field("data.statutoryMaximumCents / reimbursementBasis", 'integer / "statutory_schedule" | "payer_contract"', "Optional statutory ceiling retained separately when practice context applies, and reimbursement basis. Only an explicit matching payer contract changes reimbursement."),
    ],
    examples: example("/fee-quotes", exampleLine), responseLanguage: "typescript",
    responseExample: `// Response shape varies by assessment; no numeric fallback on review.\nif (data.status === "priced") {\n  showEstimate(data.amountCents, data.scheduleMaximumCents);\n  showSources(data.provenance);\n} else {\n  showReason(data.status, data.reason, data.provenance);\n}`,
    notes: [...notes, { title: "Validation and scope", body: "Malformed input returns 422 invalid_fee_quote. A resource-scoped browser session supplying billingProviderId returns 403 customer_scope_unsupported. A successful request is not an encounter-wide coding clearance." }],
  },
];
