import { z } from "zod";
import { getAgent } from "./agents/index.js";
import { complete } from "./llm.js";
import { route } from "./router.js";
import type {
  AgentName,
  AgentResponse,
  JointResponse,
  RouteDecision,
  UnsupportedResponse,
} from "./types.js";

export interface AskResult {
  decision: RouteDecision;
  result: AgentResponse | JointResponse | UnsupportedResponse;
}

const recommendationSchema = z.object({
  finalRecommendation: z.string(),
});

const JOINT_PROMPT = `Combine the agents' answers into one recommendation.

Use only the facts provided by the agents.
Do not add outside knowledge, benchmarks, assumptions, causes, or missing data.
Do not present something as a fact unless it appears in the agent answers.
You may make a recommendation, but it must be based only on the available facts.

If the agents disagree, present both sides honestly.
End with a short and clear next step.`;

// Runs the selected agents in parallel, then summarizes one recommendation.
async function Orchestrator(
  question: string,
  agentNames: AgentName[],
): Promise<JointResponse> {
  const responses = await Promise.all(
    agentNames.map((name) => getAgent(name).answer(question)),
  );

  const { finalRecommendation } = await complete({
    system: JOINT_PROMPT,
    prompt: `Question: ${question}\n\nAgent answers:\n${JSON.stringify(responses, null, 2)}`,
    schema: recommendationSchema,
    tier: "smart",
  });

  return { responses, finalRecommendation };
}

// Entry point: route the question, then answer with one agent, many, or none
export async function ask(question: string): Promise<AskResult> {
  const clean = question.trim();
  if (!clean) {
    throw new Error("Question cannot be empty!");
  }

  const decision = await route(clean);

  // no relevant agent- reject with a generic message so we don't reveal
  if (decision.agents.length === 0) {
    return {
      decision,
      result: {
        answer:
          "I can only help with questions about the company's own internal data.",
        internalReason: decision.reason, // only for logging
      },
    };
  }

  const result =
    decision.agents.length === 1
      ? await getAgent(decision.agents[0]).answer(clean)
      : await Orchestrator(clean, decision.agents);

  return { decision, result };
}
