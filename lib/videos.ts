/**
 * Feature videos shown by <DemoVideo>. This file is the only place videos are configured.
 *
 * An entry without `src` is a reserved slot: it renders nothing anywhere on the site (no
 * player, no placeholder). To publish a video, add its approved final cut under
 * public/video/ (or an absolute HTTPS URL) and fill in `src`, `poster`, `captions`
 * (WebVTT), and `transcript`. Use synthetic data only; never name partners or customers.
 */
export type DemoVideoEntry = {
  id: string;
  title: string;
  description: string;
  /** MP4 URL. Leave undefined until an approved final cut exists. */
  src?: string;
  /** Poster image shown before playback. */
  poster?: string;
  /** WebVTT captions file (English). */
  captions?: string;
  /** Transcript paragraphs, shown in a disclosure under the player. */
  transcript?: string[];
  /** The guide that explains the workflow shown in the video. */
  guide: { href: string; label: string };
};

export const demoVideos: DemoVideoEntry[] = [
  {
    id: "treatment-bill-omfs",
    title: "Create a treatment bill with expected OMFS payment",
    description: "Enter a visit, see Charge, Expected (OMFS), and Difference for every line, and submit the bill.",
    guide: { href: "/guides/treatment-billing#bill", label: "Treatment billing guide" },
  },
  {
    id: "rfa-create-sign-send",
    title: "Create, sign, and send an RFA",
    description: "Complete the DWC Form RFA, attach clinical support, review the packet, and send it.",
    guide: { href: "/guides/treatment-billing#rfa", label: "Treatment billing guide" },
  },
  {
    id: "rfa-ur-decisions",
    title: "Record a utilization review decision",
    description: "Match an incoming response, review the proposed decisions, and record them per treatment.",
    guide: { href: "/guides/rfas#tasks", label: "RFA guide" },
  },
  {
    id: "rfa-claim-records",
    title: "Authorizations on the claim and the bill",
    description: "Review every RFA on a claim and attach UR decisions to the treatment bill.",
    guide: { href: "/guides/treatment-billing#records", label: "Treatment billing guide" },
  },
];

export const publishedVideos = demoVideos.filter((video) => Boolean(video.src));

export function videoById(id: string) {
  return demoVideos.find((video) => video.id === id);
}
