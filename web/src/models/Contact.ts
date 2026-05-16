import mongoose, { Schema, model, models } from "mongoose";

const ContactSchema = new Schema(
  {
    profileUrl: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    headline: { type: String, default: "" },
    messageSent: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export type ContactDoc = mongoose.InferSchemaType<typeof ContactSchema>;
export const Contact = models.Contact || model("Contact", ContactSchema);
