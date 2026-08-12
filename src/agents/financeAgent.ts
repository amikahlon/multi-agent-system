import financeData from "../data/finance.json" with { type: "json" };
import { BaseAgent } from "./BaseAgent.js";
import type { AgentTool } from "../types.js";

// Metadata is shared context
const context = `Figures are in ${financeData.currency}, as of ${financeData.asOf}.`;

const tools: AgentTool[] = [
  {
    name: "get_income_statement",
    description:
      "Monthly revenue and expenses. Use for profit, income, or spending questions.",
    run: () => ({
      monthlyRevenue: financeData.monthlyRevenue,
      monthlyExpenses: financeData.monthlyExpenses,
    }),
  },
  {
    name: "get_cash_position",
    description:
      "Cash currently available. Use for liquidity or 'how much cash' questions.",
    run: () => ({ cashOnHand: financeData.cashOnHand }),
  },
  {
    name: "get_hiring_budget",
    description:
      "Budget available for hiring: monthly hiring budget, cost per employee, and approved new positions. Use for hiring-affordability questions.",
    run: () => ({
      monthlyHiringBudget: financeData.monthlyHiringBudget,
      avgFullyLoadedCostPerEmployee: financeData.avgFullyLoadedCostPerEmployee,
      openHeadcountBudget: financeData.openHeadcountBudget,
    }),
  },
];

export class FinanceAgent extends BaseAgent {
  readonly name = "finance" as const;
  protected readonly role = "Finance Agent";
  protected readonly context = context;
  protected readonly tools = tools;
}
