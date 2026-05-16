import { useState } from "react";
import { checkDuplicate, generateMessage, saveContact, withJitter } from "~lib/api";
import type { ScrapedProfile } from "~lib/filter";

type Enriched = ScrapedProfile & { role?: string; message?: string; skipped?: boolean; sent?: boolean };

export default function Popup() {
  const [profiles, setProfiles] = useState<Enriched[]>([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string>("");

  async function withActiveTab<T>(fn: (tabId: number) => Promise<T>): Promise<T> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    return fn(tab.id);
  }

  async function scan() {
    setBusy(true);
    setLog("Scanning…");
    try {
      const matched = await withActiveTab(
        (id) => new Promise<Enriched[]>((resolve) =>
          chrome.tabs.sendMessage(id, { type: "SCRAPE" }, (res) => resolve(res?.matched ?? []))
        )
      );
      setProfiles(matched);
      setLog(`Found ${matched.length} matching profiles`);
    } finally { setBusy(false); }
  }

  async function generateAll() {
    setBusy(true);
    const next: Enriched[] = [];
    for (const p of profiles) {
      setLog(`Checking ${p.name}…`);
      const dup = await checkDuplicate(p.profileUrl);
      if (dup) { next.push({ ...p, skipped: true }); continue; }
      try {
        const message = await generateMessage({ name: p.name, headline: p.headline, role: p.role });
        next.push({ ...p, message });
      } catch (e: any) {
        next.push({ ...p, message: `[error: ${e.message}]` });
      }
      await withJitter();
    }
    setProfiles(next);
    setLog("Done generating");
    setBusy(false);
  }

  async function fillSelected(p: Enriched) {
    if (!p.message) return;
    const ok = await withActiveTab(
      (id) => new Promise<boolean>((resolve) =>
        chrome.tabs.sendMessage(id, { type: "AUTOFILL", text: p.message }, (res) => resolve(Boolean(res?.ok)))
      )
    );
    if (!ok) { setLog("Open the message composer on LinkedIn first."); return; }
    // Save as sent — user reviews and clicks Send themselves.
    await saveContact({
      profileUrl: p.profileUrl,
      name: p.name,
      headline: p.headline,
      messageSent: true,
    });
    setProfiles((prev) => prev.map((x) => x.profileUrl === p.profileUrl ? { ...x, sent: true } : x));
  }

  return (
    <div style={{ width: 380, padding: 12, fontFamily: "system-ui", background: "#0a0a0a", color: "#fafafa" }}>
      <h1 style={{ fontSize: 16, margin: "0 0 8px" }}>LinkedIn Outreach</h1>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <button onClick={scan} disabled={busy} style={btn}>Scan Profiles</button>
        <button onClick={generateAll} disabled={busy || profiles.length === 0} style={btn}>Generate Messages</button>
      </div>
      <p style={{ fontSize: 11, color: "#a3a3a3", margin: "4px 0 8px" }}>{log}</p>
      <div style={{ maxHeight: 380, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {profiles.map((p) => (
          <div key={p.profileUrl} style={card}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#a3a3a3" }}>{p.headline}</div>
            {p.skipped && <div style={tag("#737373")}>Already contacted — skipped</div>}
            {p.message && (
              <>
                <div style={{ fontSize: 11, marginTop: 6, whiteSpace: "pre-wrap" }}>{p.message}</div>
                <button onClick={() => fillSelected(p)} style={{ ...btn, marginTop: 6 }}>
                  {p.sent ? "Filled ✓" : "Fill Message"}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#2563eb", color: "white", border: 0, borderRadius: 6,
  padding: "6px 10px", fontSize: 12, cursor: "pointer",
};
const card: React.CSSProperties = {
  border: "1px solid #262626", borderRadius: 8, padding: 8, background: "#171717",
};
const tag = (c: string): React.CSSProperties => ({
  display: "inline-block", marginTop: 4, fontSize: 10, color: c,
});
