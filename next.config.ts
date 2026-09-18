import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/openapi.yaml",
        destination: "https://app.mindbill.org/partner-openapi.yaml",
        permanent: false,
      },
      {
        source: "/partner-openapi.yaml",
        destination: "https://app.mindbill.org/partner-openapi.yaml",
        permanent: false,
      },
      {
        source: "/mindbill-partner.postman_collection.json",
        destination: "https://app.mindbill.org/mindbill-partner.postman_collection.json",
        permanent: false,
      },
      {
        source: "/llms.txt",
        destination: "https://app.mindbill.org/llms.txt",
        permanent: false,
      },
      {
        source: "/llms-full.txt",
        destination: "https://app.mindbill.org/llms-full.txt",
        permanent: false,
      },
      {
        source: "/partner-guides/api-first-billing.md",
        destination: "https://app.mindbill.org/partner-guides/api-first-billing.md",
        permanent: false,
      },
      {
        source: "/demo",
        destination: "/components/react",
        permanent: true,
      },
      {
        source: "/reference",
        destination: "/learn/quickstart",
        permanent: true,
      },
      {
        source: "/components",
        destination: "/components/react",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

