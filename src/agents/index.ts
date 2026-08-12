import { FinanceAgent } from "./financeAgent.js";
import { HrAgent } from "./hrAgent.js";
import type { Agent, AgentName } from "../types.js";

const agents: Record<AgentName, Agent> = {
  finance: new FinanceAgent(),
  hr: new HrAgent(),
};

export function getAgent(name: AgentName): Agent {
  return agents[name];
}
