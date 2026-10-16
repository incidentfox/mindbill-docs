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
const quoteExamples = (path: string, payload: unknown) => [
  ...example(path, payload).map((entry) => ({ ...entry, filename: "Server API key" })),
  { label: "Browser session", language: "bash", filename: "Browser session", code: `curl 'https://app.mindbill.org/partner/v2${path}' \\
  --header "Authorization: Bearer $MINDBILL_BROWSER_TOKEN" \\
  --header 'Origin: https://your-app.example' \\
  --header 'Content-Type: application/json' \\
  --data '${JSON.stringify(payload, null, 2)}'` },
];
const quoteAccess = { title: "Access", body: "Requires bills:read and the organization's treatmentBilling capability (otherwise 403 treatment_billing_not_enabled). Use a server API key or an origin-bound browser session; credentials select sandbox or live. Quotes are read-only: they never create, change, or submit a bill and are not a coverage or payment determination." };
const encounterExample = {
  claimId: "clm_example", renderingProviderId: "rp_example", placeOfServiceId: "loc_example", dateOfService: "2026-09-18",
  lines: [
    { id: "line-1", code: "99213", units: 1, modifiers: ["25"], chargeCents: 18000 },
    { id: "line-2", code: "97110", units: 2, chargeCents: 12000 },
  ],
};
const encounterQuoteEndpoint: ApiEndpoint = {
  slug: "encounter-fee-quote", group: "Fee quotes", method: "POST", path: "/fee-quotes/encounter", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
  title: "Quote expected payment for a visit",
  summary: "Expected California OMFS payment per line for one treatment visit, priced exactly like a saved treatment bill.",
  useWhen: "Show Charge, Expected (OMFS), and Difference while a biller enters a treatment bill. Provider type, place of service, practice charges, and payer come from the organization's saved records, so you send IDs instead of clinical context. ConnectedTreatmentBillForm calls this for you.",
  permissions: ["Server: bills:read", "Browser: bills:read"],
  requestFields: [
    field("renderingProviderId", "string", "Saved rendering provider (from GET /rfas/creation-context or the organization billing profile).", true),
    field("placeOfServiceId", "string", "Saved service location ID (organization billing profile locations[].id).", true),
    field("dateOfService", "string", "Visit date, YYYY-MM-DD.", true),
    field("claimId", "string", "Optional saved claim; its claims administrator is used and prior LC 4604.5 therapy visits are counted."),
    field("billingProviderId", "string", "Optional saved billing provider; the organization default is used when omitted."),
    field("lines[]", "object[]", "1–100 lines of the visit, priced together.", true),
    field("lines[].id", "string", "Caller line ID, unique in the request.", true),
    field("lines[].code", "string", "Five-character procedure code, or an ML medical-legal code (listed in medicalLegalLineIds and not priced).", true),
    field("lines[].units", "number", "Positive units, at most 10,000.", true),
    field("lines[].modifiers", "string[]", "Up to four two-character modifiers."),
    field("lines[].dateOfService / dateOfServiceEnd", "string", "Line dates when they differ from the visit date."),
    field("lines[].chargeCents", "integer", "Billed charge in cents; returned with the difference."),
    field("lines[].feeContext / drug", "object", "Optional specialty context (anesthesia, therapy, imaging, equipment) and billed drug identity (ndcNumber, metricQuantity, unitOfMeasure), as on bill service lines."),
  ],
  responseFields: [
    field("data.status", '"priced" | "requires_review" | "not_separately_payable" | "by_report"', "Visit-level assessment.", true),
    field("data.lines[].assessment", "same values as status", "A line that is not priced has no expected amount and must be reviewed. Never substitute the charge.", true),
    field("data.lines[].quote", "object", "status, amountCents, scheduleMaximumCents, chargeAmountCents, basis, calculation, provenance, and notes when priced; reason otherwise.", true),
    field("data.lines[].paymentAdjustment", "object", "Multiple-surgery or endoscopy adjustment; when present its amountCents is the expected payment."),
    field("data.lines[].findings[] / displayNotes[]", "object[] / string[]", "Coding findings (code, message, citationUrl) and short biller-facing notes for the line.", true),
    field("data.totals", "object", "submittedChargeCents, pricedSubtotalCents, estimatedPayableCents, scheduleMaximumCents, reviewLineCount. estimatedPayableCents is null while any line needs review."),
    field("data.visitNotes", "string[]", "Visit-wide notes such as per-visit caps and LC 4604.5 visit counts. Show once.", true),
    field("data.medicalLegalLineIds", "string[]", "Lines with ML codes, which the treatment schedule does not price.", true),
    field("data.claimEdits / limitations", "object[]", "Same-day edit screening and context limitations."),
  ],
  examples: quoteExamples("/fee-quotes/encounter", encounterExample),
  responseExample: `{
  "data": {
    "status": "priced",
    "lines": [
      {
        "id": "line-1",
        "assessment": "priced",
        "quote": { "status": "priced", "amountCents": 9264, "scheduleMaximumCents": 9264, "chargeAmountCents": 18000 },
        "findings": [{ "code": "modifier_conditional_estimate", "message": "Modifier 25 requires a significant, separately identifiable visit in the record." }],
        "displayNotes": ["Modifier 25 requires a separately identifiable visit."]
      },
      { "id": "line-2", "assessment": "priced", "quote": { "status": "priced", "amountCents": 8113, "scheduleMaximumCents": 8113, "chargeAmountCents": 12000 }, "findings": [], "displayNotes": [] }
    ],
    "totals": { "submittedChargeCents": 30000, "pricedSubtotalCents": 17377, "estimatedPayableCents": 17377, "scheduleMaximumCents": 17377, "reviewLineCount": 0 },
    "visitNotes": ["Therapy visit 3 of 24 under LC 4604.5 for this claim."],
    "medicalLegalLineIds": []
  }
}`,
  notes: [
    quoteAccess,
    { title: "Illustrative amounts", body: "The response amounts are synthetic and illustrate the shape only. Actual amounts depend on the date of service, the saved provider and location, and the claim." },
    { title: "Encounter quote vs claim quote", body: "Use this endpoint while entering a bill for a saved provider and location. Use POST /fee-quotes/ca/claim when you have the clinical context but no saved MindBill records (for example a stand-alone calculator)." },
    { title: "SDK", body: "@mindbill/browser 0.51.0 adds quoteEncounter to the bill reference and lifecycle clients (build the body with encounterQuoteRequest), and createEncounterQuoter for the onQuoteEncounter prop of BillSubmissionForm." },
  ],
};

const specialty = (input: Omit<ApiEndpoint, "group" | "authentication" | "capability" | "method" | "permissions" | "examples"> & { payload: unknown }): ApiEndpoint => {
  const { payload, ...rest } = input;
  return {
    ...rest, group: "Fee quotes", method: "POST", authentication: "api-key-or-browser-session", capability: "treatmentBilling",
    permissions: ["Server: bills:read", "Browser: bills:read"],
    examples: quoteExamples(rest.path, payload),
    notes: [quoteAccess, ...(rest.notes ?? [])],
  };
};

const specialtyFeeQuoteEndpoints: ApiEndpoint[] = [
  specialty({
    slug: "ca-claim-edits", path: "/fee-quotes/ca/claim-edits",
    title: "Screen California PTP and MUE edits",
    summary: "Screen practitioner lines against California-adopted procedure-to-procedure (PTP) and public MUE edits.",
    useWhen: "Check coding edits across a patient, provider, and date of service without pricing. Lines are grouped by opaque patientKey, providerKey, and date.",
    requestFields: [
      field("completeDateOfServiceContext", "boolean", "True only when every service for each patient/provider/date group is included, including services on other bills.", true),
      field("lines[]", "object[]", "1–100 lines: id, code (five characters), units (integer), dateOfService, patientKey, providerKey, and up to four modifiers. Use opaque keys, not names.", true),
    ],
    responseFields: [
      field("data.status", '"evaluated" | "requires_review" | "source_unavailable"', "Screening result; never a claim acceptance or payable amount.", true),
      field("data.findings[]", "object[]", "type (ptp, mue, public_mue_unavailable, incomplete_date_context), lineIds, message, citationUrl, and edit details.", true),
      field("data.limitations / provenance", "string[] / object", "Context limitations and the adopted edition used."),
    ],
    payload: { completeDateOfServiceContext: false, lines: [{ id: "line-1", code: "97110", units: 4, dateOfService: "2026-07-01", patientKey: "patient-1", providerKey: "provider-1" }] },
    responseExample: `{
  "data": {
    "status": "requires_review",
    "scope": "submitted_practitioner_lines",
    "completeDateOfServiceContext": false,
    "findings": [{ "type": "incomplete_date_context", "lineIds": ["line-1"], "message": "Other services on this date may change the result.", "citationUrl": "<adopted edition source URL>" }],
    "limitations": ["Edits cover verified California-adopted editions only."]
  }
}`,
    notes: [{ title: "Scope", body: "A modifier never proves a clinical exception. Missing public MUE values may be confidential and require review. Dates outside the verified editions return source_unavailable. This endpoint never determines an allowance." }],
  }),
  specialty({
    slug: "ca-copy-service-fee-quote", path: "/fee-quotes/ca/copy-service",
    title: "Quote a California copy service",
    summary: "Estimate the California Copy Service fee schedule amount for a record request by service date.",
    useWhen: "Price copy-service invoices. The edition (July 1, 2015 or July 15, 2022) is selected by the actual service date.",
    requestFields: [
      field("dateOfService", "string", "Actual service date, YYYY-MM-DD.", true),
      field("service", '"initial" | "initial_addon" | "cancellation" | "cnr" | "additional_set" | "edd" | "wcirb" | "requested"', "Scheduled service type.", true),
      field("paperPages / electronicPages / xraySheets / mediaCount", "integer", "Counts for the service. For initial_addon, paperPages is cumulative for the original job and priorBilledExcessPaperPages is required."),
      field("submittedChargeCents", "integer", "Billed amount, kept separate from the schedule amount."),
    ],
    responseFields: [
      field("data.status", '"calculated" | "unsupported_date" | "not_scheduled" | "missing_information" | "requires_review" | "documentation_required" | "not_admin_liability"', "Calculation or explicit review state.", true),
      field("data.edition", "string", "Schedule edition applied."),
      field("data.scheduleMaximumCents", "integer | null", "Published schedule amount excluding tax and surcharge. Null means unavailable, not zero."),
      field("data.administratorAmountCents / orderingPartyAmountCents", "integer | null", "Amounts attributed under the supplied facts."),
      field("data.components[]", "object[]", "Line components with code, label, quantity, unit and extended cents, and source URL."),
    ],
    payload: { dateOfService: "2026-09-18", service: "initial", paperPages: 600, submittedChargeCents: 25000 },
    responseExample: `{
  "data": {
    "status": "calculated",
    "edition": "2022-07-15",
    "scheduleMaximumCents": 22500,
    "administratorAmountCents": 22500,
    "submittedChargeCents": 25000,
    "taxCents": 0,
    "components": [{ "code": "initial", "label": "Initial records, up to 500 pages", "quantity": 1, "unitCents": 18000, "amountCents": 18000 }]
  }
}`,
    notes: [{ title: "Illustrative amounts", body: "Response amounts are synthetic. Supplied claim history and evidence are not independently verified; contract amounts, tax, and late-payment estimates stay separate." }],
  }),
  specialty({
    slug: "ca-inpatient-fee-quote", path: "/fee-quotes/ca/inpatient",
    title: "Quote a California inpatient stay",
    summary: "Calculate the statutory inpatient hospital maximum from the assigned DRG and discharge-date factors.",
    useWhen: "Price a hospital stay when the DRG is already assigned. This endpoint does not group diagnoses or procedures.",
    requestFields: [
      field("admissionDate / dischargeDate", "string", "Stay dates, YYYY-MM-DD. The discharge date selects the edition.", true),
      field("hospitalProviderNumber", "string", "Six-digit Medicare provider number, keeping leading zeros.", true),
      field("drg", "string", "Assigned three-digit DRG.", true),
      field("hospitalType / dischargeType", "string", "Hospital and discharge classification.", true),
      field("coveredInpatientChargesCents", "integer", "Covered charges in cents.", true),
      field("deviceReplacementCreditStatus / hasNewTechnology / hasOrganAcquisition", "string / boolean / boolean", "Required facts that change the calculation.", true),
      field("actualInpatientDays / hasLeaveOfAbsence / hasCovid19Diagnosis", "integer / boolean / boolean | null", "Conditional facts; see the OpenAPI contract for when each is required."),
    ],
    responseFields: [
      field("data.status", "string", "priced, or an explicit unavailable or review reason without an allowance.", true),
      field("data.totalMaximumCents", "integer", "Statutory maximum, including any outlier allowance."),
      field("data.drgFactors / hospital / sources", "object", "Calculation factors and dated source files."),
    ],
    payload: { admissionDate: "2025-02-01", dischargeDate: "2025-02-05", hospitalProviderNumber: "050002", drg: "470", hospitalType: "acute", dischargeType: "ordinary", coveredInpatientChargesCents: 5000000, deviceReplacementCreditStatus: "none", hasNewTechnology: false, hasOrganAcquisition: false },
    responseExample: `{
  "data": {
    "status": "priced",
    "dischargeDate": "2025-02-05",
    "drg": "470",
    "lengthOfStay": 4,
    "baseMaximumCents": 3637856,
    "outlierAllowanceCents": 0,
    "totalMaximumCents": 3637856,
    "sources": [{ "url": "https://www.dir.ca.gov/dwc/FeeSchedules/InpatientHospital_FeeSchedule/2024/9789_23.xlsx" }]
  }
}`,
    notes: [{ title: "Statutory maximum only", body: "Returns the statutory maximum, not a negotiated contract amount or coverage decision. Missing editions or hospital factors return unavailable without an amount." }],
  }),
  specialty({
    slug: "pharmacy-fee-quote", path: "/fee-quotes/pharmacy",
    title: "Quote a dispensed drug",
    summary: "Calculate the California maximum for a simple or repackaged dispensed drug by NDC and date.",
    useWhen: "Price pharmacy or physician dispensing. Compounds use the compound endpoint; physician-administered drugs require review here.",
    requestFields: [
      field("ndcNumber", "string", "11-digit NDC dispensed.", true),
      field("originalNdcNumber", "string", "Original labeler NDC; required for repackaged products."),
      field("dateOfService", "string", "Actual dispensing date, YYYY-MM-DD.", true),
      field("dispenser", '"physician" | "pharmacy"', "Who dispensed.", true),
      field("productKind", '"simple" | "repackaged" | "compound" | "physician_administered"', "Product category.", true),
      field("metricQuantity", "string", "Total NCPDP metric decimal units (not package count).", true),
      field("usualCustomaryCents", "integer", "Usual and customary charge, including dispensing.", true),
      field("noSubstitution", "boolean", "Dispense-as-written indicator.", true),
      field("pharmacyNpi / billedCents", "string / integer", "Required for pharmacy dispensing / billed amount."),
    ],
    responseFields: [
      field("data.status", '"matched" | "requires_review"', "Maximum found, or a reason requiring review.", true),
      field("data.maximumCents / amountCents", "integer", "Regulatory maximum and lesser of maximum and billed."),
      field("data.ingredientCostCents / dispensingFeeCents", "integer", "Components of the maximum."),
      field("data.paymentStatus", '"not_determined"', "A quote never establishes payment."),
      field("data.provenance[]", "object[]", "Dated NDC price sources.", true),
    ],
    payload: { ndcNumber: "00000000001", dateOfService: "2026-09-16", dispenser: "pharmacy", pharmacyNpi: "1234567893", productKind: "simple", metricQuantity: "30", usualCustomaryCents: 4500, billedCents: 4500, noSubstitution: false },
    responseExample: `{
  "data": {
    "status": "matched",
    "maximumCents": 2180,
    "amountCents": 2180,
    "ingredientCostCents": 860,
    "dispensingFeeCents": 1320,
    "rateBasis": "ca_simple_dispensed_drug",
    "paymentStatus": "not_determined",
    "provenance": [{ "id": "synthetic_source" }]
  }
}`,
    notes: [{ title: "Illustrative amounts", body: "The example NDC and amounts are synthetic. Historical quotes (March 8, 2019 through June 30, 2025) support only direct-listed simple pharmacy-dispensed drugs with historicalContext." }],
  }),
  specialty({
    slug: "compound-pharmacy-fee-quote", path: "/fee-quotes/pharmacy/compound",
    title: "Quote a compounded prescription",
    summary: "Calculate the California maximum for a compounded prescription dispensed on or after July 1, 2025.",
    useWhen: "Price compounds and eligible single-drug sterile transfers with the documented pharmacist findings.",
    requestFields: [
      field("dateOfService / dispenser / route / dosageForm", "string", "Dispensing facts.", true),
      field("compoundMetricQuantity / containerCount", "string / integer", "Quantity and containers dispensed.", true),
      field("ingredients[]", "object[]", "At least two actual drug ingredients (one for a sterile transfer): ndcNumber, metricQuantity, billedIngredientCents, ndcStatus, productCategory, noSubstitution.", true),
      field("billedCents / billedCompoundingFeeCents / billedSterilityFeeCents", "integer", "Billed amounts.", true),
      field("authorizationStatus / essentialCopyStatus / sterilityTesting", "string", "Required regulatory findings; not inferred.", true),
      field("preparationKind", '"compound" | "sterile_transfer"', "Omit for an ordinary compound."),
    ],
    responseFields: [
      field("data.status", '"matched" | "requires_review"', "Matched maximum with ingredient breakdown, or a review reason.", true),
      field("data.maximumCents / amountCents / scheduleMaximumCents", "integer", "Maximum after caps, lesser of maximum and billed, and schedule amount."),
      field("data.ingredients[]", "object[]", "Per-ingredient cost breakdown."),
    ],
    payload: { dateOfService: "2026-09-16", dispenser: "pharmacy", pharmacyNpi: "1234567893", route: "Oral", dosageForm: "01", compoundMetricQuantity: "30", containerCount: 1, ingredients: [{ ndcNumber: "00000000001", metricQuantity: "10", billedIngredientCents: 1200, ndcStatus: "valid", productCategory: "drug", noSubstitution: false }, { ndcNumber: "00000000002", metricQuantity: "20", billedIngredientCents: 1800, ndcStatus: "valid", productCategory: "drug", noSubstitution: false }], billedCents: 5000, usualCustomaryCents: 5000, billedCompoundingFeeCents: 395, billedSterilityFeeCents: 0, authorizationStatus: "authorized", essentialCopyStatus: "not_essential_copy", sterilityTesting: "not_performed" },
    responseExample: `{
  "data": {
    "status": "requires_review",
    "reason": "source_unavailable",
    "provenance": []
  }
}`,
    notes: [{ title: "Units", body: "Monetary fields are integer cents except ingredient unitCostInHundredThousandths (1/100,000 dollar per metric unit). Missing sources or unresolved rules return requires_review without an amount." }],
  }),
  specialty({
    slug: "owcp-fee-quote", path: "/fee-quotes/owcp",
    title: "Look up an OWCP physician maximum",
    summary: "Return the unadjusted federal OWCP single-service maximum for a procedure, date, and locality.",
    useWhen: "Price federal workers' compensation physician services (FECA, Energy, Black Lung).",
    requestFields: [
      field("code", "string", "Five-character procedure code.", true),
      field("dateOfService", "string", "YYYY-MM-DD.", true),
      field("postalCode / placeOfService", "string", "Service ZIP (or ZIP+4) and two-digit place of service."),
      field("modifiers", "string[]", "Up to four modifiers."),
      field("program", '"FECA" | "ENERGY" | "BLACK_LUNG"', "OWCP program."),
    ],
    responseFields: [
      field("data.status", '"matched" | "requires_review" | "unmatched"', "Lookup result.", true),
      field("data.unitMaximumCents", "integer", "Unadjusted single-service maximum."),
      field("data.locality / setting / globalDays", "string", "Resolved locality, facility setting, and global period."),
    ],
    payload: { code: "99213", dateOfService: "2026-09-08", postalCode: "94612", placeOfService: "11", program: "FECA" },
    responseExample: `{
  "data": {
    "status": "matched",
    "unitMaximumCents": 10412,
    "rateBasis": "unadjusted_single_service_maximum",
    "paymentStatus": "not_determined",
    "setting": "nonfacility"
  }
}`,
    notes: [{ title: "Not an allowance", body: "The result is an unadjusted single-service maximum, not a payable allowance or coding eligibility decision. Amounts in the example are synthetic." }],
  }),
  specialty({
    slug: "owcp-ancillary-fee-quote", path: "/fee-quotes/owcp/ancillary",
    title: "Look up an OWCP lab, DME, or drug maximum",
    summary: "Return the published OWCP maximum for a clinical lab, DMEPOS, or physician-administered drug code.",
    useWhen: "Price federal workers' compensation ancillary services by exact code and modifier.",
    requestFields: [
      field("category", '"clinical_lab" | "dmepos" | "padb"', "Ancillary table.", true),
      field("code", "string", "Five-character HCPCS code.", true),
      field("dateOfService", "string", "YYYY-MM-DD.", true),
      field("modifiers", "string[]", "Up to four modifiers."),
      field("units", "integer", "Whole published billing units, not milligrams or milliliters. Default 1."),
    ],
    responseFields: [
      field("data.status", '"matched" | "requires_review" | "unmatched"', "Lookup result.", true),
      field("data.unitMaximumDollars", "string", "Exact source decimal dollars, keeping fractional cents."),
      field("data.extendedMaximumCents", "integer", "Unit rate times units, rounded once to cents."),
      field("data.dosagePerBillingUnit", "string | null", "Drug dosage per billing unit."),
    ],
    payload: { category: "padb", code: "90656", dateOfService: "2026-09-08", units: 2 },
    responseExample: `{
  "data": {
    "status": "matched",
    "category": "padb",
    "code": "90656",
    "unitMaximumDollars": "21.215",
    "units": 2,
    "extendedMaximumCents": 4243,
    "rateBasis": "published_schedule_maximum",
    "paymentStatus": "not_determined"
  }
}`,
    notes: [{ title: "Published maximum", body: "Zero rates, unsupported modifiers, missing editions, and source holds require review. Amounts in the example are synthetic." }],
  }),
];

export const feeScheduleEndpoints: ApiEndpoint[] = [
  encounterQuoteEndpoint,
  {
    slug: "ca-claim-fee-quote", group: "Fee quotes", capability: "treatmentBilling", method: "POST", path: "/fee-quotes/ca/claim", authentication: "api-key-or-browser-session",
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
    slug: "treatment-fee-quote", group: "Fee quotes", capability: "treatmentBilling", method: "POST", path: "/fee-quotes", authentication: "api-key-or-browser-session",
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
  ...specialtyFeeQuoteEndpoints,
];
