// TODO(owner: vansh; collaborator: avni)
// - Add client-side sorting/filter UI for contacts.
// - Show clear loading, empty, and error states with retry action.
"use client";

import { useEffect, useMemo, useState } from "react";
import { useOutreachStore, type Contact } from "@/store/useOutreachStore";

type SortKey = "name" | "sent" | "replied";
type SortDirection = "asc" | "desc";
type DeliveryFilter = "all" | "sent" | "notSent";
type ReplyFilter = "all" | "replied" | "notReplied";

/**
 * Applies delivery/reply filters to a contact.
 * @param contact Contact row from store.
 * @param deliveryFilter Selected sent-status filter.
 * @param replyFilter Selected reply-status filter.
 * @returns True when contact should be shown in table.
 */
function matchesFilters(contact: Contact, deliveryFilter: DeliveryFilter, replyFilter: ReplyFilter): boolean {
  const matchesDelivery =
    deliveryFilter === "all"
      ? true
      : deliveryFilter === "sent"
        ? Boolean(contact.messageSent)
        : !contact.messageSent;

  const matchesReply =
    replyFilter === "all"
      ? true
      : replyFilter === "replied"
        ? Boolean(contact.replied)
        : !contact.replied;

  return matchesDelivery && matchesReply;
}

/**
 * Compares two contacts using selected sort mode.
 * @param left First contact.
 * @param right Second contact.
 * @param sortKey Field to sort on.
 * @param sortDirection Sort direction (`asc`/`desc`).
 * @returns Negative/zero/positive value for Array.sort.
 */
function compareContacts(left: Contact, right: Contact, sortKey: SortKey, sortDirection: SortDirection): number {
  if (sortKey === "name") {
    const leftName = left.name?.toLocaleLowerCase() ?? "";
    const rightName = right.name?.toLocaleLowerCase() ?? "";
    return sortDirection === "asc"
      ? leftName.localeCompare(rightName)
      : rightName.localeCompare(leftName);
  }

  const leftFlag = sortKey === "sent" ? Number(Boolean(left.messageSent)) : Number(Boolean(left.replied));
  const rightFlag = sortKey === "sent" ? Number(Boolean(right.messageSent)) : Number(Boolean(right.replied));
  return sortDirection === "asc" ? leftFlag - rightFlag : rightFlag - leftFlag;
}

export default function Dashboard() {
  const { contacts, stats, loading, fetchContacts } = useOutreachStore();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("all");
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>("all");

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const visibleContacts = useMemo(() => {
    // Centralized filter -> sort pipeline keeps UI rendering deterministic and DX-friendly.
    return contacts
      .filter((contact) => matchesFilters(contact, deliveryFilter, replyFilter))
      .sort((left, right) => compareContacts(left, right, sortKey, sortDirection));
  }, [contacts, deliveryFilter, replyFilter, sortDirection, sortKey]);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold mb-6">LinkedIn Outreach</h1>

      <section className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Scanned" value={stats.scanned} />
        <Stat label="Sent" value={stats.sent} />
        <Stat label="Replies" value={stats.replies} />
      </section>

      <section className="mb-4 flex flex-wrap items-end gap-3" aria-label="Contact table controls">
        <div className="flex flex-col gap-1">
          <label htmlFor="sort-key" className="text-xs uppercase tracking-wide text-neutral-400">Sort by</label>
          <select
            id="sort-key"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="name">Name</option>
            <option value="sent">Sent</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sort-direction" className="text-xs uppercase tracking-wide text-neutral-400">Direction</label>
          <select
            id="sort-direction"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value as SortDirection)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="delivery-filter" className="text-xs uppercase tracking-wide text-neutral-400">Sent filter</label>
          <select
            id="delivery-filter"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={deliveryFilter}
            onChange={(event) => setDeliveryFilter(event.target.value as DeliveryFilter)}
          >
            <option value="all">All</option>
            <option value="sent">Sent only</option>
            <option value="notSent">Not sent only</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reply-filter" className="text-xs uppercase tracking-wide text-neutral-400">Reply filter</label>
          <select
            id="reply-filter"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            value={replyFilter}
            onChange={(event) => setReplyFilter(event.target.value as ReplyFilter)}
          >
            <option value="all">All</option>
            <option value="replied">Replied only</option>
            <option value="notReplied">Not replied only</option>
          </select>
        </div>
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
            {!loading && visibleContacts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-neutral-500">
                  No contacts match the selected filters.
                </td>
              </tr>
            )}
            {visibleContacts.map((contact) => (
              <tr key={contact.profileUrl} className="border-t border-neutral-800">
                <td className="p-3">{contact.name}</td>
                <td className="p-3 text-neutral-400">{contact.headline}</td>
                <td className="p-3">{contact.messageSent ? "✓" : "—"}</td>
                <td className="p-3">{contact.replied ? "✓" : "—"}</td>
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
