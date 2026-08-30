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

