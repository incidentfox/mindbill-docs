import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Braces,
  CircleDollarSign,
  FileText,
  FileUp,
  KeyRound,
  Layers3,
  Network,
  ReceiptText,
  Route,
  SquareCode,
  Workflow,
} from "lucide-react";

export type DocLink = {
  href: string;
  label: string;
  description: string;
  group: string;
  icon: LucideIcon;
  keywords: string[];
};

export const navigation: DocLink[] = [
  {
    href: "/",
    label: "Overview",
    description: "What MindBill does and where it fits in a workers' comp product.",
    group: "Start here",
    icon: Network,
    keywords: ["workers compensation", "clearinghouse", "infrastructure", "overview"],
  },
  {
    href: "/learn/workers-comp-billing",
    label: "Workers' comp billing",
    description: "The parties, formats, and rules developers need to understand.",
    group: "Start here",
    icon: ReceiptText,
    keywords: ["workers comp", "treatment", "qme", "med legal", "claims administrator"],
  },
  {
    href: "/learn/anatomy-of-a-bill",
    label: "Anatomy of a bill",
    description: "The CMS-1500 data and payer packet represented by one bill resource.",
    group: "Start here",
    icon: FileText,
    keywords: ["cms 1500", "837p", "patient", "claim", "service lines"],
  },
  {
    href: "/learn/quickstart",
    label: "Quickstart",
    description: "Review, submit, and track your first sandbox bill.",
    group: "Start here",
    icon: SquareCode,
    keywords: ["install", "first bill", "rest", "node", "sandbox"],
  },
  {
    href: "/learn/routing",
    label: "Routing and EDI",
    description: "How MindBill resolves payers, routes bills, and normalizes acknowledgements.",
    group: "Understand",
    icon: Route,
    keywords: ["carisk", "jopari", "data dimensions", "edi", "837p", "999", "277ca"],
  },
  {
    href: "/guides/bills",
    label: "The bill resource",
    description: "Send the CMS-1500 snapshot without synchronizing partner databases.",
    group: "Understand",
    icon: ReceiptText,
    keywords: ["create", "submit", "immutable", "cms-1500", "snapshot", "payer"],
  },
  {
    href: "/guides/documents",
    label: "Documents",
    description: "Build an explicit payer packet and upload supporting PDFs.",
    group: "Understand",
    icon: FileUp,
    keywords: ["attachments", "pdf", "report", "proof of service", "w9"],
  },
  {
    href: "/guides/lifecycle",
    label: "Lifecycle and actions",
    description: "Read status, EORs, denials, payments, reviews, and resubmissions.",
    group: "Understand",
    icon: Workflow,
    keywords: ["status", "denial", "payment", "eor", "second review", "close"],
  },
  {
    href: "/guides/authentication",
    label: "Authentication",
    description: "Mint organization-bound, role-permissioned browser sessions safely.",
    group: "Build",
    icon: KeyRound,
    keywords: ["api key", "token", "origin", "security", "session"],
  },
  {
    href: "/guides/sandbox",
    label: "Sandbox and live access",
    description: "Create test keys, accept the BAA, and promote an integration to live traffic.",
    group: "Build",
    icon: KeyRound,
    keywords: ["sandbox", "api key", "baa", "production", "live access"],
  },
  {
    href: "/components/react",
    label: "React",
    description: "Connected billing workspace, search, reports, submission, and state-aware lifecycle actions.",
    group: "Components",
    icon: Layers3,
    keywords: ["react", "hooks", "component", "theme", "playground", "all bills", "bill tasks", "search", "productivity", "procedure report"],
  },
  {
    href: "/components/react/lifecycle-demo",
    label: "Full lifecycle demo",
    description: "Run the complete synthetic bill journey from submission through payment and closure.",
    group: "Components",
    icon: Workflow,
    keywords: ["react", "sandbox", "demo", "submitted", "accepted", "processed", "payment", "closed"],
  },
  {
    href: "/components/angular",
    label: "Angular",
    description: "A standalone Angular component for the complete bill lifecycle.",
    group: "Components",
    icon: Braces,
    keywords: ["angular", "standalone", "component", "typescript"],
  },
  {
    href: "/api-reference",
    label: "REST API",
    description: "Endpoints, payloads, lifecycle actions, and the OpenAPI contract.",
    group: "Reference",
    icon: Route,
    keywords: ["rest", "endpoint", "openapi", "reference", "curl"],
  },
  {
    href: "/api-reference/create-bill",
    label: "Create and submit a bill",
    description: "Atomically submit an immutable CMS-1500 snapshot and payer packet.",
    group: "Reference",
    icon: FileText,
    keywords: ["create", "submit", "bill", "immutable", "cms-1500", "payer packet"],
  },
  {
    href: "/api-reference/bill-actions",
    label: "Bill actions",
    description: "Close, correct, review, and post payments.",
    group: "Reference",
    icon: Workflow,
    keywords: ["close", "payment", "correction", "second review"],
  },
  {
    href: "/api-reference/browser-sessions",
    label: "Browser sessions",
    description: "Authorize native components without exposing an API key.",
    group: "Reference",
    icon: KeyRound,
    keywords: ["browser", "session", "token", "permissions", "origin"],
  },
  {
    href: "/api-reference/events",
    label: "Events and webhooks",
    description: "Receive signed state changes without polling.",
    group: "Reference",
    icon: Activity,
    keywords: ["webhook", "events", "signature", "delivery"],
  },
  {
    href: "/pricing",
    label: "Pricing",
    description: "Usage-based pricing per submitted bill.",
    group: "Reference",
    icon: CircleDollarSign,
    keywords: ["price", "pricing", "volume", "submitted bill"],
  },
];

export const navigationGroups = ["Start here", "Understand", "Build", "Components", "Reference"];
