// TODO(owner: vansh; collaborator: avni)
// - Validate payload schema before generation.
// - Add timeout/fallback handling for upstream AI failures.
import { NextResponse } from "next/server";
import { generateOutreachMessage } from "@/lib/openrouter";
import { requireApiKey } from "../_auth";

export async function POST(req: Request) {
  const guard = requireApiKey(req);
  if (guard) return guard;

  const { name, headline, role } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  try {
    const message = await generateOutreachMessage({ name, headline: headline ?? "", role });
    return NextResponse.json({ message });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "generation failed" }, { status: 500 });
  }
}
