// TODO(owner: avni; collaborator: vansh)
// - Add retry with exponential backoff for transient failures.
// - Handle non-OK responses with typed error objects.
const BASE = process.env.PLASMO_PUBLIC_API_BASE!;
const KEY = process.env.PLASMO_PUBLIC_API_KEY!;

function headers() {
  return {
    "Content-Type": "application/json",
    "x-api-key": KEY,
  };
}

export async function checkDuplicate(profileUrl: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/contacts/check`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ profileUrl }),
  });
  const j = await res.json();
  return Boolean(j.exists);
}

export async function generateMessage(p: { name: string; headline: string; role?: string }) {
  const res = await fetch(`${BASE}/api/generate-message`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(p),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "generate failed");
  return j.message as string;
}

export async function saveContact(c: {
  profileUrl: string;
  name: string;
  headline: string;
  messageSent: boolean;
}) {
  await fetch(`${BASE}/api/contacts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(c),
  });
}

/** Random delay to avoid bursty patterns. */
export function withJitter(minMs = 3000, maxMs = 8000) {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((r) => setTimeout(r, ms));
}
