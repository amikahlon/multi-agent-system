export type AgentName = "finance" | "hr";

export interface AgentResponse {
  agent: AgentName;
  answer: string;
  facts: string[];
}

export interface Agent {
  readonly name: AgentName;
  answer(question: string): Promise<AgentResponse>;
}

export interface RouteDecision {
  agents: AgentName[];
  reason: string;
}

export interface JointResponse {
  responses: AgentResponse[];
  finalRecommendation: string;
}

export interface UnsupportedResponse {
  answer: string; // shown to the user
  internalReason: string;
}

export interface AgentTool {
  name: string;
  description: string;
  run(): Record<string, unknown>;
}
