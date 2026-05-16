export const KEYWORDS = [
  "student",
  "b.tech",
  "btech",
  "full stack",
  "fullstack",
  "frontend",
  "front-end",
  "backend",
  "back-end",
  "mern",
] as const;

export interface ScrapedProfile {
  name: string;
  headline: string;
  profileUrl: string;
  connectionStatus: string;
}

export function matchesKeywords(p: ScrapedProfile): boolean {
  const hay = `${p.headline} ${p.name}`.toLowerCase();
  return KEYWORDS.some((k) => hay.includes(k));
}

export function inferRole(headline: string): string | undefined {
  const h = headline.toLowerCase();
  if (h.includes("mern")) return "MERN developer";
  if (h.includes("full stack") || h.includes("fullstack")) return "Full stack developer";
  if (h.includes("frontend") || h.includes("front-end")) return "Frontend developer";
  if (h.includes("backend") || h.includes("back-end")) return "Backend developer";
  if (h.includes("b.tech") || h.includes("btech") || h.includes("student")) return "College student";
  return undefined;
}
