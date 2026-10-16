/**
 * Current MindBill package versions shown in install snippets and upgrade notes.
 * Update these together when a widgets release is published; every install
 * command on the site reads from here.
 */
export const sdkVersions = {
  react: "0.78.0",
  browser: "0.51.0",
  angular: "0.20.0",
} as const;

export const installReact = `npm install @mindbill/react@${sdkVersions.react}`;
export const installReactWithBrowser = `npm install @mindbill/react@${sdkVersions.react} @mindbill/browser@${sdkVersions.browser}`;
export const installAngular = `npm install @mindbill/angular@${sdkVersions.angular}`;
