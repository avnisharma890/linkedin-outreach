// TODO(owner: vansh; collaborator: avni)
// - Document auth behavior for local vs production use.
// - Return standardized unauthorized response format across APIs.
import { NextResponse } from "next/server";

// Minimal shared-secret guard. Swap for NextAuth when you add real users.
export function requireApiKey(req: Request): NextResponse | null {
  const secret = process.env.API_SHARED_SECRET;
  if (!secret) return null; // disabled in dev when unset
  const provided = req.headers.get("x-api-key");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
