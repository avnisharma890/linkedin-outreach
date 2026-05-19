// TODO(owner: vansh; collaborator: avni)
// - Normalize profile URLs before duplicate lookup.
// - Return consistent validation errors for malformed payloads.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { requireApiKey } from "../../_auth";

export async function POST(req: Request) {
  const guard = requireApiKey(req);
  if (guard) return guard;

  const { profileUrl } = await req.json();
  if (!profileUrl) return NextResponse.json({ error: "profileUrl required" }, { status: 400 });

  await connectDB();
  const found = await Contact.exists({ profileUrl });
  return NextResponse.json({ exists: Boolean(found) });
}
