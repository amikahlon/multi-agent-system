import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ZodType } from "zod";

export type ModelTier = "fast" | "smart";

interface CompletionOptions<T> {
  system: string;
  prompt: string;
  schema: ZodType<T>;
  tier?: ModelTier;
  maxTokens?: number;
}

let client: Anthropic | undefined;

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

export function getModel(tier: ModelTier = "smart"): string {
  const fast = process.env.MODEL_FAST || "claude-haiku-4-5";
  const smart = process.env.MODEL_SMART || "claude-sonnet-4-5";
  return tier === "fast" ? fast : smart;
}

// Sends a prompt to Claude and returns the response
export async function complete<T>({
  system,
  prompt,
  schema,
  tier = "smart",
  maxTokens = 1024,
}: CompletionOptions<T>): Promise<T> {
  const message = await getClient().messages.parse({
    model: getModel(tier),
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: zodOutputFormat(schema) },
  });

  if (message.parsed_output == null) {
    throw new Error("Claude returned no structured output.");
  }
  return message.parsed_output;
}
