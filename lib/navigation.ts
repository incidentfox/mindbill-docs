import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Braces,
  FileUp,
  KeyRound,
  Layers3,
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
    href: "/learn/quickstart",
    label: "Quickstart",
    description: "Create and render your first bill in about ten minutes.",
    group: "Get started",
    icon: SquareCode,
    keywords: ["install", "first bill", "session", "setup"],
  },
  {
    href: "/guides/authentication",
    label: "Authentication",
    description: "Keep the API key server-side and mint origin-bound browser sessions.",
    group: "Get started",
    icon: KeyRound,
    keywords: ["api key", "token", "origin", "security"],
  },
  {
    href: "/guides/bills",
    label: "Create and edit bills",
    description: "Send the CMS-1500 snapshot without synchronizing partner databases.",
    group: "Build",
    icon: ReceiptText,
    keywords: ["create", "update", "cms-1500", "snapshot", "payer"],
  },
  {
    href: "/guides/documents",
    label: "Documents",
    description: "Build an explicit payer packet and upload supporting PDFs.",
    group: "Build",
    icon: FileUp,
    keywords: ["attachments", "pdf", "report", "proof of service", "w9"],
  },
  {
    href: "/guides/lifecycle",
    label: "Lifecycle and actions",
    description: "Read status, EORs, denials, payments, reviews, and resubmissions.",
    group: "Build",
    icon: Workflow,
    keywords: ["status", "denial", "payment", "eor", "second review", "close"],
  },
  {
    href: "/components/react",
    label: "React",
    description: "Native components with sessions, API calls, and state-aware actions.",
    group: "Components",
    icon: Layers3,
    keywords: ["react", "hooks", "component", "theme", "playground"],
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
    href: "/api-reference#events",
    label: "Events and webhooks",
    description: "Receive signed state changes without polling.",
    group: "Reference",
    icon: Activity,
    keywords: ["webhook", "events", "signature", "delivery"],
  },
];

export const navigationGroups = ["Get started", "Build", "Components", "Reference"];

