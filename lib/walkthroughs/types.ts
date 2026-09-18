export type WalkthroughStep = {
  title: string;
  instruction: string;
  expected: string;
  image: string;
  alt: string;
  caption: string;
};

export type Walkthrough = {
  slug: string;
  title: string;
  description: string;
  before: string[];
  steps: WalkthroughStep[];
  limitations: string;
  related: { href: string; label: string }[];
};
