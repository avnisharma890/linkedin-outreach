import { create } from "zustand";

export interface Contact {
  _id?: string;
  profileUrl: string;
  name: string;
  headline?: string;
  messageSent?: boolean;
  replied?: boolean;
  sentAt?: string;
}

interface OutreachState {
  contacts: Contact[];
  stats: { scanned: number; sent: number; replies: number };
  loading: boolean;
  fetchContacts: () => Promise<void>;
}

export const useOutreachStore = create<OutreachState>((set) => ({
  contacts: [],
  stats: { scanned: 0, sent: 0, replies: 0 },
  loading: false,
  fetchContacts: async () => {
    set({ loading: true });
    const res = await fetch("/api/contacts");
    const json = await res.json();
    set({ contacts: json.items ?? [], stats: json.stats ?? { scanned: 0, sent: 0, replies: 0 }, loading: false });
  },
}));
