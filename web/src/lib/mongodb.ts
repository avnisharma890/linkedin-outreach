import mongoose from "mongoose";

// Cached connection — required for serverless (Vercel) so we don't open
// a new pool on every cold start.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongo = global as unknown as { _mongo?: Cached };
const cached: Cached = globalForMongo._mongo ?? { conn: null, promise: null };
globalForMongo._mongo = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
