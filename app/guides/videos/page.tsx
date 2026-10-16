import type { Metadata } from "next";
import Link from "next/link";
import { DemoVideo } from "@/components/demo-video";
import { DocPage } from "@/components/doc-page";
import { publishedVideos } from "@/lib/videos";

export const metadata: Metadata = { title: "Feature videos" };

export default function VideosPage() {
  return <DocPage eyebrow="Walkthroughs" title="Feature videos" description="Short recordings of embedded MindBill workflows built with synthetic data."
    toc={publishedVideos.map((video) => ({ id: `video-${video.id}`, label: video.title }))}
    previous={{ href: "/walkthroughs/rfa", label: "RFA walkthroughs" }} next={{ href: "/guides/treatment-billing", label: "Treatment billing" }}>
    {publishedVideos.length
      ? publishedVideos.map((video) => <DemoVideo key={video.id} id={video.id} headingLevel={2} showGuideLink />)
      : <p data-videos-empty>Videos coming soon. Until then, follow the <Link href="/guides/treatment-billing">treatment billing guide</Link> and the illustrated <Link href="/walkthroughs/rfa">RFA walkthroughs</Link>.</p>}
  </DocPage>;
}
