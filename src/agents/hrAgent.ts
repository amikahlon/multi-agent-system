import hrData from "../data/hr.json" with { type: "json" };
import { BaseAgent } from "./BaseAgent.js";
import type { AgentTool } from "../types.js";

// Metadata is shared context
const context = `Data is as of ${hrData.asOf}.`;

const tools: AgentTool[] = [
  {
    name: "get_headcount",
    description:
      "Current number of employees and how many roles are open. Use for team-size or open-roles questions.",
    run: () => ({
      currentHeadcount: hrData.currentHeadcount,
      openRoles: hrData.openRoles,
    }),
  },
  {
    name: "get_workforce_health",
    description:
      "Team workload and recent departures: utilization and attrition. Use for burnout, capacity, or how-stretched questions.",
    run: () => ({
      avgTeamUtilization: hrData.avgTeamUtilization,
      attritionLast90Days: hrData.attritionLast90Days,
    }),
  },
  {
    name: "get_critical_roles",
    description:
      "The most important open roles and average time to fill a role. Use for hiring-priority or time-to-hire questions.",
    run: () => ({
      criticalRoles: hrData.criticalRoles,
      avgTimeToHireDays: hrData.avgTimeToHireDays,
    }),
  },
];

export class HrAgent extends BaseAgent {
  readonly name = "hr" as const;
  protected readonly role = "HR Agent";
  protected readonly context = context;
  protected readonly tools = tools;
}
