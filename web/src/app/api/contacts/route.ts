// TODO(owner: vansh; collaborator: avni)
// - Add pagination and query validation for GET.
// - Harden POST validation/sanitization and structured error responses.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { requireApiKey } from "../_auth";

export async function GET(req: Request) {
  const guard = requireApiKey(req);
  if (guard) return guard;

  await connectDB();
  const items = await Contact.find().sort({ createdAt: -1 }).limit(200).lean();
  const stats = {
    scanned: items.length,
    sent: items.filter((i) => i.messageSent).length,
    replies: items.filter((i) => i.replied).length,
  };
  return NextResponse.json({ items, stats });
}

export async function POST(req: Request) {
  const guard = requireApiKey(req);
  if (guard) return guard;

  const body = await req.json();
  const { profileUrl, name, headline, messageSent } = body;
  if (!profileUrl || !name) {
    return NextResponse.json({ error: "profileUrl and name required" }, { status: 400 });
  }

  await connectDB();
  // Upsert keeps the unique index honest and avoids race-condition duplicates.
  const doc = await Contact.findOneAndUpdate(
    { profileUrl },
    {
      $setOnInsert: { profileUrl, name },
      $set: {
        headline: headline ?? "",
        messageSent: Boolean(messageSent),
        ...(messageSent ? { sentAt: new Date() } : {}),
      },
    },
    { upsert: true, new: true }
  );
  return NextResponse.json({ contact: doc });
}
