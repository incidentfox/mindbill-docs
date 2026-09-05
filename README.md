# MindBill developer documentation

Standalone documentation and interactive examples for the MindBill partner API,
React components, Angular components, and hosted billing workflow.

```bash
pnpm install
pnpm dev
```

Production: [docs.mindbill.org](https://docs.mindbill.org)


## Shared business API

Business endpoints use canonical `/partner/v2/*` URLs with either a server API key or an exact-origin browser session. Session issuance, management sessions, events, and webhook-delivery administration remain key-only. `lib/browser-api-inventory.ts` records the canonical calls used by the browser SDK and React components. `/bill-dashboard` preserves their page-based list contract; `/bills` preserves the cursor-based synchronization contract. Legacy `/browser/*` URLs remain backend compatibility aliases and are not a separate API to integrate with.

Deploy the backend support for both credentials before publishing these docs or an SDK release that calls the canonical routes. Keep the public OpenAPI contract and endpoint pages aligned with the implemented backend; do not describe unsupported patient, injury, claim, or provider CRUD.
