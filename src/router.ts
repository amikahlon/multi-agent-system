import { z } from "zod";
import { complete } from "./llm.js";
import type { RouteDecision } from "./types.js";

const routeDecisionSchema = z.object({
  // Empty list - the question is not for any agent !
  agents: z.array(z.enum(["finance", "hr"])).max(2),
  reason: z.string(),
});

const ROUTER_PROMPT = `Choose which agents should answer the user's question.
Pick the minimal set of agents needed - do not add agents that are not required.

Available agents:
- finance: money, revenue, expenses, cash, budgets, and costs
- hr: employees, open roles, workload, and hiring

Return an EMPTY list if the question is not about this company's own finance or
HR data - for example, questions about other companies, general knowledge, or
small talk. Never force an unrelated question onto an agent.

Choose more than one agent only when the answer genuinely depends on data from
several departments - for example, a decision that weighs money against people.`;

// Classifies the question before the agents answer - Fast Model
export async function route(question: string): Promise<RouteDecision> {
  const decision = await complete({
    system: ROUTER_PROMPT,
    prompt: question,
    schema: routeDecisionSchema,
    tier: "fast",
    maxTokens: 256,
  });

  // Remove duplicate agents
  return { ...decision, agents: Array.from(new Set(decision.agents)) };
}
