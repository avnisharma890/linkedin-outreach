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

mongoose.connection.on("connected", () => {
  console.log("[MongoDB] Connected");
});

mongoose.connection.on("error", (err) => {
  console.error(
    "[MongoDB] Connection error:",
    err.message
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected");
});

 export async function connectDB() {
    try {
      if (cached.conn) {
        return cached.conn;
      }

      if (!cached.promise) {
        console.log(
          "[MongoDB] Creating new connection..."
        );

        cached.promise = mongoose.connect(
          MONGODB_URI!,
          {
            bufferCommands: false,
          }
        );
      }

      cached.conn = await cached.promise;

      return cached.conn;
    } catch (error) {
      console.error(
        "[MongoDB] Failed to connect:",
        error
      );

      cached.promise = null;

      throw error;
    }
  }

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}