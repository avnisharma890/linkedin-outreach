// TODO(owner: avni; collaborator: vansh)
// - Add model fallback list and timeout controls.
// - Add output guardrails (length/tone) with safe fallback message.
// Thin wrapper around OpenRouter's chat completions endpoint.
// Free models tried in order; first success wins.

const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";
const KEY = process.env.OPENROUTER_API_KEY;

export interface ProfileInput {
  name: string;
  headline: string;
  role?: string;
}

export async function generateOutreachMessage(p: ProfileInput): Promise<string> {
  if (!KEY) throw new Error("OPENROUTER_API_KEY missing");

  const system =
    "You write short, friendly, professional LinkedIn connection notes. " +
    "Tone: curious, peer-to-peer, never salesy. Max 280 characters. " +
    "No emojis. No hashtags. Mention one specific detail from their headline.";

  const user = `Name: ${p.name}
Headline: ${p.headline}
${p.role ? `Inferred role: ${p.role}` : ""}

Write a single connection note addressed to them.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content || "").trim();
}
