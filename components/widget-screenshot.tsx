import { Screenshot } from "@/components/walkthroughs/screenshot";
import screenshotData from "@/lib/walkthroughs/screenshots.json";

const screenshots: Record<string, { src: string; original: string; width: number; height: number }> = screenshotData;

/** A registered synthetic component screenshot (lib/walkthroughs/screenshots.json, key "widget-<id>"). */
export function WidgetScreenshot({ id, alt, caption }: { id: string; alt: string; caption: string }) {
  const shot = screenshots[`widget-${id}`];
  if (!shot) throw new Error(`Unknown widget screenshot: ${id}`);
  return <Screenshot {...shot} alt={alt} caption={caption} />;
}
