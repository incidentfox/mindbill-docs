import type { Walkthrough } from "./types";
import dashboardArticles from "./dashboard-articles.json";
import submissionArticles from "./submission-articles.json";
import taskArticles from "./task-articles.json";
import screenshotData from "./screenshots.json";

export const walkthroughs: Walkthrough[] = [dashboardArticles[0], ...submissionArticles, ...dashboardArticles.slice(1), ...taskArticles];
export const screenshots: Record<string, { src: string; original: string; width: number; height: number }> = screenshotData;
