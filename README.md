# MindBill developer documentation

Standalone documentation and interactive examples for the MindBill partner API,
React components, Angular components, and hosted billing workflow.

## Public documentation privacy

Never name partners or customers in public documentation, examples, search metadata,
copyable integration prompts, or screenshots. Use generic integration descriptions
and fictional example identities. Demonstrate generic theme presets, not named
customer integrations.

```bash
pnpm install
pnpm dev
```

Production: [docs.mindbill.org](https://docs.mindbill.org)


## Shared business API

Business endpoints use canonical `/partner/v2/*` URLs with either a server API key or an exact-origin browser session. Session issuance, management sessions, events, and webhook-delivery administration remain key-only. `lib/browser-api-inventory.ts` records the canonical calls used by the browser SDK and React components. `/bill-dashboard` preserves their page-based list contract; `/bills` preserves the cursor-based synchronization contract. Legacy `/browser/*` URLs remain backend compatibility aliases and are not a separate API to integrate with.

Deploy the backend support for both credentials before publishing these docs or an SDK release that calls the canonical routes. Keep the public OpenAPI contract and endpoint pages aligned with the implemented backend; do not describe unsupported patient, injury, claim, or provider CRUD.

## Versions, screenshots, and videos

- Install snippets read package versions from `lib/sdk-versions.ts`; update it once per widgets release.
- Component screenshots must use synthetic data. Register them in `lib/walkthroughs/screenshots.json` (widget images use a `widget-` key under `public/screenshots/widgets/`) and render them with `components/widget-screenshot.tsx` or `components/walkthroughs/screenshot.tsx`.
- Feature videos are configured only in `lib/videos.ts`. `<DemoVideo id="…" />` renders nothing until its entry has a `src`, and `/guides/videos` shows "Videos coming soon" until at least one video is configured. Add only approved final cuts with captions and a transcript.
