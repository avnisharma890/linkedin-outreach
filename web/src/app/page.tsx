"use client";
import { useEffect } from "react";
import { useOutreachStore } from "@/store/useOutreachStore";

export default function Dashboard() {
  const { contacts, stats, loading, fetchContacts } = useOutreachStore();
  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold mb-6">LinkedIn Outreach</h1>

      <section className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Scanned" value={stats.scanned} />
        <Stat label="Sent" value={stats.sent} />
        <Stat label="Replies" value={stats.replies} />
      </section>

      <h2 className="text-lg font-semibold mb-3">Recent contacts</h2>
      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Headline</th>
              <th className="text-left p-3">Sent</th>
              <th className="text-left p-3">Replied</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-4 text-center text-neutral-500">Loading…</td></tr>}
            {!loading && contacts.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-neutral-500">No contacts yet</td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c.profileUrl} className="border-t border-neutral-800">
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-neutral-400">{c.headline}</td>
                <td className="p-3">{c.messageSent ? "✓" : "—"}</td>
                <td className="p-3">{c.replied ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-neutral-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
