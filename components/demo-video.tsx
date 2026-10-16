import Link from "next/link";
import { videoById, type DemoVideoEntry } from "@/lib/videos";

/**
 * Renders a configured feature video from lib/videos.ts. A slot whose entry has no `src`
 * renders nothing, so pages can reserve a place for a video before it is approved.
 */
export function DemoVideo({ id, showGuideLink = false, headingLevel = 3 }: { id: string; showGuideLink?: boolean; headingLevel?: 2 | 3 }) {
  const video = videoById(id);
  if (!video?.src) return null;
  return <DemoVideoPlayer video={video} showGuideLink={showGuideLink} headingLevel={headingLevel} />;
}

function DemoVideoPlayer({ video, showGuideLink, headingLevel }: { video: DemoVideoEntry & { src?: string }; showGuideLink: boolean; headingLevel: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = `video-${video.id}`;
  return <section className="launch-video demo-video" aria-labelledby={headingId} data-demo-video={video.id}>
    <Heading id={headingId}>{video.title}</Heading>
    <p>{video.description}</p>
    <figure>
      <video controls playsInline preload="none" poster={video.poster} aria-label={video.title}>
        <source src={video.src} type="video/mp4" />
        {video.captions ? <track kind="captions" src={video.captions} srcLang="en" label="English" default /> : null}
        <a href={video.src}>Watch {video.title}</a>.
      </video>
      {showGuideLink ? <figcaption><Link href={video.guide.href}>{video.guide.label} →</Link></figcaption> : null}
    </figure>
    {video.transcript?.length ? <details>
      <summary>Read the video transcript</summary>
      {video.transcript.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <p><a href={video.src} target="_blank" rel="noopener">Open the video in a new tab</a></p>
    </details> : null}
  </section>;
}
